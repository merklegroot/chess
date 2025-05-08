import { analysisResult } from '@/models/analysisResult';
import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import { ChessEngineService } from '@/services/chessEngine';
import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';

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

    // Save analysis results to file
    const analysisDir = path.join(process.cwd(), 'data', 'analysis');
    const analysisFile = path.join(analysisDir, `game_${gameIndex}.json`);

    // Ensure the analysis directory exists
    if (!fs.existsSync(analysisDir)) {
        fs.mkdirSync(analysisDir, { recursive: true });
    }

    // Create the analysis data object
    const analysisData = {
        gameIndex,
        pgn,
        analysis: results,
        timestamp: new Date().toISOString()
    };

    // Write to file
    fs.writeFileSync(analysisFile, JSON.stringify(analysisData, null, 2));
    
    return results;
}

export const analyzeGameWorkflow = {
    execute
};