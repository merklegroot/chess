import { NextResponse } from 'next/server';
import { ChessEngineService } from '@/services/chessEngine';

export async function POST(request: Request) {
  try {
    const { fen, depth } = await request.json();

    if (!fen) {
      return NextResponse.json({ error: 'FEN is required' }, { status: 400 });
    }

    const engine = new ChessEngineService();
    const result = await engine.analyzePosition(fen, depth || 20);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing position:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 