import { analysisResult } from '@/models/analysisResult';
import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import { ChessEngineService } from '@/services/chessEngine';
import { Chess } from 'chess.js';


async function execute(gameIndex: number): Promise<analysisResult[] | undefined> {
    const repo = new ChessHistoryRepo();
    const game = await repo.getGame(gameIndex);

    if (!game)
        return undefined;

    // Create a new Chess instance and load the moves
    const chessGame = new Chess();
    
    // Load the game using PGN format
    const pgn = game.moves.join(' ');
    chessGame.loadPgn(pgn);
    
    const engine = new ChessEngineService();
    const results = await engine.analyzeGame(chessGame);
    
    return results;
}

export const analyzeGameWorkflow = {
    execute
};