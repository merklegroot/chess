import { uciResponse } from './uciResponse';

interface StockfishOptions {
    port?: number;
}

const DEFAULT_PORT = 8080;

type StockfishEventType = 'uci:command' | 'uci:response' | 'auth:authenticated' | 'auth:unauthenticated';

interface StockfishEvent {
    type: StockfishEventType;
    payload?: string;
}

export class StockfishConnection {
    private ws: WebSocket | null = null;
    private messageQueue: { command: string; resolve: (value: string[]) => void; reject: (reason: any) => void }[] = [];
    private currentCallback: ((response: string) => void) | null = null;
    private isConnected = false;
    private port: number;

    constructor(port: number) {
        this.port = port;
    }

    private connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(`ws://localhost:${this.port}`);
            let timeout: NodeJS.Timeout;

            this.ws.onopen = () => {
                this.isConnected = true;
                clearTimeout(timeout);
                resolve();
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.ws = null;
                // Try to reconnect after 5 seconds
                setTimeout(() => this.connect(), 5000);
            };

            this.ws.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };

            this.ws.onmessage = (event) => {
                const response = event.data.toString();
                if (this.currentCallback) {
                    this.currentCallback(response);
                }
            };

            timeout = setTimeout(() => {
                this.ws?.close();
                reject(new Error('Timeout waiting for Stockfish connection'));
            }, 5000);
        });
    }

    private async ensureConnected(): Promise<void> {
        if (!this.isConnected || !this.ws) {
            await this.connect();
        }
    }

    private sendEvent(event: StockfishEvent): void {
        if (!this.ws) {
            throw new Error('WebSocket not connected');
        }
        this.ws.send(JSON.stringify(event));
    }

    async sendCommand(command: string): Promise<string[]> {
        await this.ensureConnected();

        return new Promise((resolve, reject) => {
            const responses: string[] = [];
            let timeout: NodeJS.Timeout;

            this.currentCallback = (response: string) => {
                try {
                    const event = JSON.parse(response) as StockfishEvent;
                    
                    if (event.type === 'auth:unauthenticated') {
                        clearTimeout(timeout);
                        reject(new Error('Authentication failed'));
                        return;
                    }

                    if (event.type === 'uci:response' && event.payload) {
                        responses.push(event.payload);

                        // For 'go' commands, wait for 'bestmove'
                        if (command.startsWith('go') && event.payload.includes('bestmove')) {
                            clearTimeout(timeout);
                            this.currentCallback = null;
                            resolve(responses);
                        }
                        // For 'isready' commands, wait for 'readyok'
                        else if (command === 'isready' && event.payload.includes('readyok')) {
                            clearTimeout(timeout);
                            this.currentCallback = null;
                            resolve(responses);
                        }
                        // For 'uci' command, wait for 'uciok'
                        else if (command === 'uci' && event.payload.includes('uciok')) {
                            clearTimeout(timeout);
                            this.currentCallback = null;
                            resolve(responses);
                        }
                    }
                } catch (e) {
                    // If not JSON, treat as raw UCI response
                    responses.push(response);
                    if (response.includes('bestmove') || response.includes('readyok') || response.includes('uciok')) {
                        clearTimeout(timeout);
                        this.currentCallback = null;
                        resolve(responses);
                    }
                }
            };

            timeout = setTimeout(() => {
                this.currentCallback = null;
                reject(new Error('Timeout waiting for Stockfish response'));
            }, 5000);

            this.sendEvent({
                type: 'uci:command',
                payload: command
            });
        });
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }
}

// Singleton connection instance
let connection: StockfishConnection | null = null;

function getConnection(port: number): StockfishConnection {
    if (!connection || connection['port'] !== port) {
        if (connection) {
            connection.disconnect();
        }
        connection = new StockfishConnection(port);
    }
    return connection;
}