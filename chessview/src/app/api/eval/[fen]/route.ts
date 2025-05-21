import { NextResponse } from 'next/server';
import { evalResult } from '@/models/evalResult';
import { evaluationRepo } from '@/repo/evalulationRepo';

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    context: { params: Promise<{ fen: string }> }
): Promise<NextResponse<evalResult | { error: string }>> {
    try {
        const params = await context.params;
        if (!params?.fen) {
            return NextResponse.json({ error: 'FEN is required' }, { status: 400 });
        }

        const fen = decodeURIComponent(params.fen);
        console.log('Looking for evaluation for FEN:', fen);
        
        const evaluation = await evaluationRepo.getEvalByFen(fen);
        console.log('Found evaluation:', evaluation);
        
        if (!evaluation) {
            return NextResponse.json({ error: 'No evaluation found for this position' }, { status: 404 });
        }

        return NextResponse.json(evaluation);
        
    } catch (error) {
        console.error('Error getting evaluation:', error);
        return NextResponse.json(
            { error: 'Failed to get evaluation' },
            { status: 500 }
        );
    }
} 