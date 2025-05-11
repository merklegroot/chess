import { uciResponse } from './uciResponse';

/**
 * Opens a websocket to stockfish on the default port.
 * Sends the "uci" command.
 * Accumulates the responses and returns them.
 * @returns {Promise<string[]>} - The responses from the stockfish engine.
 */
export async function checkUciRaw(): Promise<string[]> {
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
            // if (response.includes('uciok')) {

            // }
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            ws.close();
            reject(error);
        };
    });
}


export async function checkUci(): Promise<uciResponse> {
    const responses = await checkUciRaw();

    // here's a sample response:
    // {"type":"uci:response","payload":"Stockfish 15.1 by the Stockfish developers (see AUTHORS file)"}

    // return responses.map(response => response.payload);

    throw Error('Not implemented');
}

export const stockfishClient = {
    checkUciRaw,
    checkUci
};