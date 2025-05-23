import { StockfishConnection } from "@/app/clients/stockfishClient";
import { evalResult } from "@/models/evalResult";
import fs, { promises as fsPromises } from 'fs';
import * as path from 'path';

interface evalKey {
    fen: string;
    depth: number;
    moveTime: number;
}

interface gameEvalKey extends evalKey {
    gameId: string;
}

// Ensure the eval directory exists
const EVAL_DIR = path.join(process.cwd(), 'data', 'eval');

async function ensureEvalDir() {
    try {
        await fsPromises.access(EVAL_DIR);
    } catch {
        await fsPromises.mkdir(EVAL_DIR, { recursive: true });
    }
}

function getEvalKeyString(evalKey: evalKey): string {
    return `${evalKey.fen}_${evalKey.depth}_${evalKey.moveTime}`;
}

function getEvalFilePath(gameId: string): string {
    return path.join(EVAL_DIR, `game_${gameId}.json`);
}

async function writeEval(gameEvalKey: gameEvalKey, evalResult: evalResult): Promise<void> {
    await ensureEvalDir();
    const filePath = getEvalFilePath(gameEvalKey.gameId);
    
    // Read existing evals or create new object
    let evals: Record<string, evalResult> = {};
    try {
        const content = await fsPromises.readFile(filePath, 'utf-8');
        evals = JSON.parse(content);
    } catch (error) {
        // File doesn't exist or is invalid, start with empty object
    }

    // Add new eval
    const key = getEvalKeyString(gameEvalKey);
    evals[key] = evalResult;

    // Write back to file
    await fsPromises.writeFile(filePath, JSON.stringify(evals, null, 2));
}

async function readEvalFileForGameId(gameId: string): Promise<Record<string, evalResult>> {
    try {
        const filePath = getEvalFilePath(gameId);

        if (!fs.existsSync(filePath))
            return {};        

        const content = await fsPromises.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        // File doesn't exist or is invalid
        return {};
    }
}

async function readEval(gameEvalKey: gameEvalKey): Promise<evalResult | undefined> {
    try {
        const filePath = getEvalFilePath(gameEvalKey.gameId);
        const content = await fsPromises.readFile(filePath, 'utf-8');
        const evals: Record<string, evalResult> = JSON.parse(content);
        
        const key = getEvalKeyString(gameEvalKey);
        return evals[key];
    } catch (error) {
        // File doesn't exist or is invalid
        return undefined;
    }
}

async function getCacheableEvaluation(connection: StockfishConnection, evalKey: gameEvalKey): Promise<evalResult> {
    const existingEval = await readEval(evalKey);
    if (existingEval)
        return existingEval;
    
    const workResult = await doWork(connection, evalKey);

    writeEval(evalKey, workResult);
    return workResult;
}

async function doWork(connection: StockfishConnection, evalKey: evalKey): Promise<evalResult> {
    await connection.sendUci();
    await connection.sendIsReady();
    await connection.setPosition({ fen: evalKey.fen });
    await connection.sendIsReady();
    
    // Use findBestMove with a reasonable depth for more accurate evaluation
    const result = await connection.findBestMove({
      depth: 15,
      moveTimeMs: 1000
    });

    // Convert the result to our EvalResult format
    const evalResult: evalResult = {
      score: result.bestMove.score,
      mate: result.bestMove.mate,
      depth: result.bestMove.depth || 0
    };

    return evalResult;
}

async function getAllCachedEvals(gameId: string): Promise<Record<string, evalResult>> {
    return readEvalFileForGameId(gameId);
}

async function getEvalByFen(fen: string): Promise<evalResult | undefined> {
    try {
        // Read all game evaluation files
        const files = await fsPromises.readdir(EVAL_DIR);
        const evalFiles = files.filter(f => f.startsWith('game_') && f.endsWith('.json'));

        // Search through all files for the FEN
        for (const file of evalFiles) {
            const content = await fsPromises.readFile(path.join(EVAL_DIR, file), 'utf-8');
            const evals: Record<string, evalResult> = JSON.parse(content);
            
            // Find the first evaluation that matches the FEN
            const matchingKey = Object.keys(evals).find(key => key.startsWith(fen + '_'));
            if (matchingKey) {
                return evals[matchingKey];
            }
        }
        
        return undefined;
    } catch (error) {
        console.error('Error getting evaluation by FEN:', error);
        return undefined;
    }
}

export const evaluationRepo = {
    getCacheableEvaluation,
    getAllCachedEvals,
    getEvalByFen
}