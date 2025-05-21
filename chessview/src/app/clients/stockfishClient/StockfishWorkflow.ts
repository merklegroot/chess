import { StockfishConnection } from "./StockfishConnection";
import { evalResult } from "@/models/evalResult";

async function evaluateFen(connection: StockfishConnection, fen: string): Promise<evalResult> {
    await connection.sendUci();
    // await connection.sendIsReady();
    // await connection.sendUciNewGame();
    await connection.sendIsReady();
    await connection.setPosition({ fen: fen });
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

export const StockfishWorkflow = {
    evaluateFen
};