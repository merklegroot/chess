
/**
 * Opens a websocket to stockfish on the defeault port.
 * Sends the "uci" command.
 * Accumulates the responses and returns them.
 * @returns {Promise<string[]>} - The responses from the stockfish engine.
 */
async function checkUciRaw(): Promise<string[]> {
    const responses: string[] = [];

    throw Error('Not implemented');
}

export const stockfishClient = {
    checkUciRaw
};