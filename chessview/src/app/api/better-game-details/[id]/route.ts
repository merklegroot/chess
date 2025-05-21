import { GameMoveApiModel } from '@/models/GameMoveApiModel';
import { evaluationRepo } from '@/repo/evalulationRepo';
import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import { Chess } from 'chess.js';
import { NextResponse } from 'next/server';
import { evalResult } from '@/models/evalResult';

export const runtime = 'nodejs';

export interface BetterMoveApiModel {
    number: number;
    isWhite: boolean;
    move: string;
    fen: string;
}

export interface BetterGameDetailsResponse {
    id: string;
    moves: BetterMoveApiModel[];
    evaluations: Record<string, evalResult>;
}

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse<BetterGameDetailsResponse | { error: string }>> {
    try {
        const params = await context.params;
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
        const processedMoves: BetterMoveApiModel[] = game.moves.map((move, index) => {
            chess.move(move);
            const fenAfter = chess.fen();
            
            return {
                number: Math.floor(index / 2) + 1,
                isWhite: index % 2 === 0,
                move,
                fen: fenAfter
            };
        });

        const response: BetterGameDetailsResponse = {
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