import { NextResponse } from 'next/server';
import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';

export async function GET(
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

    return NextResponse.json({ game });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 