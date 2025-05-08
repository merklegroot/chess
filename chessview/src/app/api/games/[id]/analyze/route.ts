import { NextResponse } from 'next/server';
import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import { ChessEngineService } from '@/services/chessEngine';
import { Chess } from 'chess.js';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const repo = new ChessHistoryRepo();
    const game = await repo.getGame(parseInt(id));

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Create a new Chess instance and load the moves
    const chessGame = new Chess();
    
    // Load the game using PGN format
    const pgn = game.moves.join(' ');
    try {
      chessGame.loadPgn(pgn);
    } catch (e) {
      console.error('Failed to load PGN:', e);
      return NextResponse.json({ error: 'Failed to load game moves' }, { status: 400 });
    }
    
    const engine = new ChessEngineService();
    const results = await engine.analyzeGame(chessGame);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error analyzing game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 