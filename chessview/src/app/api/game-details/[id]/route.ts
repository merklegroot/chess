import { GameMoveApiModel } from '@/models/GameMoveApiModel';
import { evaluationRepo } from '@/repo/evalulationRepo';
import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';
import { evalResult } from '@/models/evalResult';

export const runtime = 'nodejs';

export interface GameDetailsResponse {
    id: string;
    moves: GameMoveApiModel[];
    evaluations: Record<string, evalResult>;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<NextResponse<GameDetailsResponse | { error: string }>> {
    try {
        if (!params?.id) {
            return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
        }

        const id = params.id;
        
        // Get all cached evaluations for this game
        const evaluations = await evaluationRepo.getAllCachedEvals(id);
        
        // Get game data from the repository
        const repo = new ChessHistoryRepo();
        const game = await repo.getGame(parseInt(id));
        
        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        // Process moves to get FEN positions
        const chess = new Chess();
        const processedMoves: GameMoveApiModel[] = game.moves.map((move, index) => {
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

        const response: GameDetailsResponse = {
            id,
            moves: processedMoves,
            evaluations
        };

        return NextResponse.json(response);
        
    } catch (error) {
        console.error('Error processing game details:', error);
        return NextResponse.json(
            { error: 'Failed to process game details' },
            { status: 500 }
        );
    }
} 