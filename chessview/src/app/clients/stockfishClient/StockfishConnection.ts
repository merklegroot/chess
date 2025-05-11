import { uciResponse } from './uciResponse';

/** Default WebSocket port for Stockfish server */
const DEFAULT_PORT = 8080;

type StockfishEventType = 'uci:command' | 'uci:response' | 'auth:authenticated' | 'auth:unauthenticated';

interface StockfishEvent {
    type: StockfishEventType;
    payload?: string;
}

interface PositionOptions {
    /** FEN string for the position. If not provided, uses 'startpos' */
    fen?: string;
    /** List of moves to apply after the position is set */
    moves?: string[];
}

interface EvaluationOptions {
    /** How long to think in milliseconds */
    moveTimeMs: number;
    /** Maximum depth to search (optional) */
    depth?: number;
}

export class StockfishConnection {
    private ws: WebSocket | null = null;
    private messageQueue: { command: string; resolve: (value: string[]) => void; reject: (reason: any) => void }[] = [];
    private currentCallback: ((response: string) => void) | null = null;
    private isConnected = false;
    private port: number;

    /**
     * Create a new StockfishConnection.
     * @param port Optional WebSocket port number. Defaults to 8080.
     */
    constructor(port: number = DEFAULT_PORT) {
        this.port = port;
    }

    /**
     * Get the version of the Stockfish engine.
     * @returns A promise that resolves to the version string (e.g. "Stockfish 16.1")
     * @throws Error if version information cannot be found in the UCI response
     */
    async getVersion(): Promise<string> {
        const responses = await this.sendUci();
        const versionLine = responses.find(response => 
            response.toLowerCase().includes('stockfish') && 
            response.toLowerCase().includes('by')
        );
        
        if (!versionLine) {
            throw new Error('Could not find Stockfish version information in UCI response');
        }

        // Extract version number - typically in format "Stockfish XX.X by ..."
        const match = versionLine.match(/Stockfish\s+(\d+(?:\.\d+)?)/i);
        if (!match) {
            throw new Error('Could not parse version number from UCI response');
        }

        return `Stockfish ${match[1]}`;
    }

    // UCI Protocol Commands

    /**
     * Tell engine to use the UCI (Universal Chess Interface).
     * Waits for 'uciok' response.
     */
    async sendUci(): Promise<string[]> {
        return this.sendCommand('uci');
    }

    /**
     * Check if the engine is ready.
     * Waits for 'readyok' response.
     */
    async sendIsReady(): Promise<string[]> {
        return this.sendCommand('isready');
    }

    /**
     * Stop calculating as soon as possible.
     * Does not wait for response.
     */
    async sendStop(): Promise<string[]> {
        return this.sendCommand('stop');
    }

    /**
     * Set up the position on the internal board.
     * @param options Configuration options for the position
     */
    async setPosition(options: PositionOptions = {}): Promise<void> {
        const { fen, moves } = options;
        const fenPart = fen || 'startpos';
        const movesPart = moves && moves.length > 0 ? ` moves ${moves.join(' ')}` : '';
        await this.sendCommand(`position ${fenPart}${movesPart}`);
    }

    /**
     * Start calculating on the current position.
     * @param options Configuration options for the evaluation
     */
    async sendEvaluate(options: EvaluationOptions): Promise<string[]> {
        const { moveTimeMs, depth } = options;
        const command = ['go'];
        if (moveTimeMs) command.push(`movetime ${moveTimeMs}`);
        if (depth) command.push(`depth ${depth}`);
        return this.sendCommand(command.join(' '));
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

            // For commands that don't return responses, resolve immediately
            if (command.startsWith('position ') || command === 'stop') {
                this.sendEvent({
                    type: 'uci:command',
                    payload: command
                });
                resolve([]);
                return;
            }

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
            }, 10000);

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