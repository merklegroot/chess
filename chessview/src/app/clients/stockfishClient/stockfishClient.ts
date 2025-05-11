import { uciResponse } from './uciResponse';

/**
 * Opens a websocket to stockfish on the default port.
 * Sends the "uci" command.
 * Accumulates the responses and returns them.
 * @returns {Promise<string[]>} - The responses from the stockfish engine.
 */
async function messageRaw(message: string): Promise<string[]> {
    const responses: string[] = [];
    const ws = new WebSocket('ws://localhost:8080');
    let timeout: NodeJS.Timeout;

    return new Promise((resolve, reject) => {
        ws.onopen = () => {
            // the stockfish container seems to want us to send uci messages,
            // but it responds with JSON.
            // the test i did sent a single one line JSON response.
            // i'm not yet sure if it sends multiple line JSON responses.
            // if there are multiple line responses, i don't know of an easy way to tell when it's done
            // short of parsing the JSON responses.
            ws.send(message);
            timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Timeout waiting for Stockfish response'));
            }, 5000);
        };

        ws.onmessage = (event) => {
            const response = event.data.toString();
            responses.push(response);
            if (responses.length > 0) {
                clearTimeout(timeout);
                ws.close();
                resolve(responses);                
            }
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            ws.close();
            reject(error);
        };
    });
}

/**
 * Opens a websocket to stockfish on the default port.
 * Sends the "uci" command.
 * Accumulates the responses and returns them.
 * @returns {Promise<string[]>} - The responses from the stockfish engine.
 */
export async function uciRaw(): Promise<string[]> {
    return messageRaw('uci');
}

/**
 * Checks if Stockfish is ready to accept commands.
 * Sends the "isready" command and waits for "readyok" response.
 * @returns {Promise<string[]>} - The responses from the stockfish engine.
 */
export async function isReadyRaw(): Promise<string[]> {
    return messageRaw('isready');
}

export async function uci(): Promise<uciResponse> {
    const responses = await uciRaw();
    
    // Parse the first response as JSON
    const response = JSON.parse(responses[0]) as uciResponse;
    
    // Validate the response structure
    if (!response.type || !response.payload) {
        throw new Error('Invalid UCI response format');
    }

    // Extract version number from payload
    const versionMatch = response.payload.match(/Stockfish (\d+\.\d+)/);
    if (!versionMatch) {
        throw new Error('Could not parse Stockfish version');
    }

    const version = versionMatch[1];
    if (!version) {
        throw new Error('Invalid version number');
    }
    
    return { ...response, version };
}

export const stockfishClient = {
    uciRaw,
    uci,

    isReadyRaw
};