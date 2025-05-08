import { NextResponse } from 'next/server';
import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import { ChessEngineService } from '@/services/chessEngine';
import { Chess } from 'chess.js';
import { analyzeGameWorkflow } from '@/workflow/analyzeGameWorkflow';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const analysisResults = await analyzeGameWorkflow.execute(parseInt(id));

    return NextResponse.json(analysisResults);
  } catch (error) {
    console.error('Error analyzing game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 