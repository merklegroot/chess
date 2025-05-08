import { NextResponse } from 'next/server';
import { ChessOpeningRepo } from '@/repo/chessOpeningRepo';

export async function POST(request: Request) {
  try {
    const { pgn } = await request.json();
    
    if (!pgn) {
      return NextResponse.json({ error: 'PGN is required' }, { status: 400 });
    }

    const openingRepo = ChessOpeningRepo.getInstance();
    const openings = openingRepo.findOpeningsByPgn(pgn);

    return NextResponse.json({ openings });
  } catch (error) {
    console.error('Error finding openings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 