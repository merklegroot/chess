import { GameMoveApiModel } from '@/models/GameMoveApiModel';
import { evaluationRepo } from '@/repo/evalulationRepo';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const gameId = params.id;
        
        // Get all cached evaluations for this game
        const evaluations = await evaluationRepo.getAllCachedEvals(gameId);
        
        // Get game data from your database
        // For now, we'll just use the moves from the URL
        const url = new URL(request.url);
        const movesParam = url.searchParams.get('moves');
        if (!movesParam) {
            return NextResponse.json({ error: 'No moves provided' }, { status: 400 });
        }
        
        const moves = movesParam.split(',');
        const chess = new Chess();
        
        // Process each move to get FEN positions
        const processedMoves: GameMoveApiModel[] = moves.map((move, index) => {
            const fenBefore = chess.fen();
            chess.move(move);
            const fenAfter = chess.fen();
            
            return {
                number: Math.floor(index / 2) + 1,
                isWhite: index % 2 === 0,
                move,
                fenBefore,
                fenAfter
            };
        });

        return NextResponse.json({
            id: gameId,
            moves: processedMoves,
            cachedEvals: evaluations
        });
        
    } catch (error) {
        console.error('Error processing game details:', error);
        return NextResponse.json(
            { error: 'Failed to process game details' },
            { status: 500 }
        );
    }
} 