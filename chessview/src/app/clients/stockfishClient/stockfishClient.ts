import { uciResponse } from './uciResponse';

/**
 * Opens a websocket to stockfish on the default port.
 * Sends the "uci" command.
 * Accumulates the responses and returns them.
 * @returns {Promise<string[]>} - The responses from the stockfish engine.
 */
export async function uciRaw(): Promise<string[]> {
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
            ws.send('uci');
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
    checkUciRaw: uciRaw,
    checkUci: uci
};