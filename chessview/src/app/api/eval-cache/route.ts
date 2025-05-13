import { NextResponse } from 'next/server';
import { evaluationRepo } from '@/repo/evalulationRepo';
import { StockfishConnection } from '@/app/clients/stockfishClient';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const fen = searchParams.get('fen');
    const depth = searchParams.get('depth');
    const moveTime = searchParams.get('moveTime');

    if (!gameId || !fen || !depth || !moveTime) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const connection = new StockfishConnection();
        const result = await evaluationRepo.getCacheableEvaluation(connection, {
            gameId,
            fen,
            depth: Number(depth),
            moveTime: Number(moveTime)
        });
        
        connection.disconnect();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error getting evaluation:', error);
        return NextResponse.json({ error: 'Failed to get evaluation' }, { status: 500 });
    }
} 