import { StockfishConnection } from "@/app/clients/stockfishClient";
import { evalResult } from "@/models/evalResult";

interface evalKey {
    fen: string;
    depth: number;
    moveTime: number;
}

interface gameEvalKey extends evalKey {
    gameId: string;
}


function getEvalKeyString(evalKey: evalKey): string {
    return `${evalKey.fen}_${evalKey.depth}_${evalKey.moveTime}`;
}

// for now, let's store the eval results in a json file.
// its file name should be based on the gameId.
// its structure should be a record of a string representation of evalKey -> evalResult
// the files should be stored in the data/eval directory


async function writeEval (gameEvalKey: gameEvalKey, evalResult: evalResult): Promise<void> {
    throw new Error("Not implemented");
}

async function readEval(gameEvalKey: gameEvalKey): Promise<evalResult | undefined> {
    throw new Error("Not implemented");
}

async function getCacheableEval(connection: StockfishConnection, evalKey: gameEvalKey): Promise<evalResult> {
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

export const evalRepo = {
    getCacheableEval
}