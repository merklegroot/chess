import { Chess } from 'chess.js';

interface AnalysisResult {
  moveNumber: number;
  move: string;
  evaluation: number;
  bestMove: string;
  isBlunder: boolean;
  bookMoves: string[]; // List of book moves at this position
}

export class ChessEngineService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private messageQueue: string[] = [];
  private currentCallback: ((response: string) => void) | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    console.log('Attempting to connect to Stockfish server...');
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = async () => {
      console.log('Connected to Stockfish server');
      this.isConnected = true;
      
      // Initialize UCI engine
      await this.sendCommand('uci');
      await this.sendCommand('isready');
      await this.sendCommand('ucinewgame');
      await this.sendCommand('isready');
      
      this.processQueue();
    };

    this.ws.onclose = () => {
      console.log('Disconnected from Stockfish server');
      this.isConnected = false;
      // Try to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      console.log('Received message from Stockfish:', event.data);
      const response = event.data;
      if (this.currentCallback) {
        this.currentCallback(response);
        this.currentCallback = null;
        this.processQueue();
      }
    };
  }

  private sendCommand(command: string): Promise<string> {
    console.log('Sending command to Stockfish:', command);
    return new Promise((resolve) => {
      let responses: string[] = [];
      
      this.messageQueue.push(command);
      this.currentCallback = (response) => {
        responses.push(response);
        
        // For 'go' commands, wait for 'bestmove'
        if (command.startsWith('go')) {
          if (response.includes('bestmove')) {
            resolve(responses.join('\n'));
          } else {
            this.currentCallback = (r) => {
              responses.push(r);
              if (r.includes('bestmove')) {
                resolve(responses.join('\n'));
              } else {
                this.currentCallback = this.currentCallback;
              }
            };
          }
        }
        // For 'isready' commands, wait for 'readyok'
        else if (command === 'isready') {
          if (response.includes('readyok')) {
            resolve(responses.join('\n'));
          } else {
            this.currentCallback = (r) => {
              responses.push(r);
              if (r.includes('readyok')) {
                resolve(responses.join('\n'));
              } else {
                this.currentCallback = this.currentCallback;
              }
            };
          }
        }
        // For 'uci' command, wait for 'uciok'
        else if (command === 'uci') {
          if (response.includes('uciok')) {
            resolve(responses.join('\n'));
          } else {
            this.currentCallback = (r) => {
              responses.push(r);
              if (r.includes('uciok')) {
                resolve(responses.join('\n'));
              } else {
                this.currentCallback = this.currentCallback;
              }
            };
          }
        }
        // For other commands, resolve immediately
        else {
          resolve(responses.join('\n'));
        }
      };
      if (this.isConnected) {
        this.processQueue();
      }
    });
  }

  private processQueue() {
    if (!this.isConnected || this.messageQueue.length === 0 || this.currentCallback) {
      return;
    }

    const command = this.messageQueue.shift();
    if (command && this.ws) {
      console.log('Processing command from queue:', command);
      this.ws.send(JSON.stringify({
        type: 'uci:command',
        payload: command
      }));
    }
  }

  async analyzePosition(fen: string, depth: number = 20): Promise<{ evaluation: number; bestMove: string }> {
    // Send position command and wait for readyok
    await this.sendCommand(`position fen ${fen}`);
    await this.sendCommand('isready');
    
    // Then send go command and wait for bestmove
    const response = await this.sendCommand(`go depth ${depth}`);
    const lines = response.split('\n');
    
    let evaluation = 0;
    let bestMove = '';

    for (const line of lines) {
      try {
        // Try to parse as JSON first
        const jsonResponse = JSON.parse(line);
        if (jsonResponse.type === 'uci:response') {
          const payload = jsonResponse.payload;
          if (payload.startsWith('info depth') && payload.includes('score cp')) {
            const scoreMatch = payload.match(/score cp (-?\d+)/);
            if (scoreMatch) {
              evaluation = parseInt(scoreMatch[1]) / 100;
            }
          }
          if (payload.startsWith('bestmove')) {
            bestMove = payload.split(' ')[1];
          }
        }
      } catch (e) {
        // If not JSON, try parsing as raw UCI
        if (line.startsWith('info depth') && line.includes('score cp')) {
          const scoreMatch = line.match(/score cp (-?\d+)/);
          if (scoreMatch) {
            evaluation = parseInt(scoreMatch[1]) / 100;
          }
        }
        if (line.startsWith('bestmove')) {
          bestMove = line.split(' ')[1];
        }
      }
    }

    console.log('Analysis result:', { evaluation, bestMove });
    return { evaluation, bestMove };
  }

  async analyzeGame(game: Chess): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const moves = game.history();
    const tempGame = new Chess();

    for (let i = 0; i < moves.length; i++) {
      // Load the position before the current move
      const pgn = moves.slice(0, i).join(' ');
      if (pgn) {
        tempGame.loadPgn(pgn);
      }

      // Get the evaluation before making the move
      const { evaluation: beforeEval, bestMove } = await this.analyzePosition(tempGame.fen());
      
      // Get book moves for this position
      const bookMoves = await this.getBookMoves(tempGame.fen());
      
      // Make the actual move
      tempGame.move(moves[i]);
      
      // Get the evaluation after making the move
      const { evaluation: afterEval } = await this.analyzePosition(tempGame.fen());
      
      // A move is a blunder if it significantly worsens the position
      // We consider it a blunder if the evaluation changes by more than 2.0 in the wrong direction
      const isBlunder = Math.abs(afterEval - beforeEval) > 2.0 && 
        ((beforeEval > 0 && afterEval < beforeEval) || // White's position got worse
         (beforeEval < 0 && afterEval > beforeEval));  // Black's position got worse

      results.push({
        moveNumber: Math.floor(i / 2) + 1,
        move: moves[i],
        evaluation: afterEval,
        bestMove,
        isBlunder,
        bookMoves
      });
    }

    return results;
  }

  private async getBookMoves(fen: string): Promise<string[]> {
    const response = await this.sendCommand(`position fen ${fen}\ngo book`);
    const lines = response.split('\n');
    const bookMoves: string[] = [];

    for (const line of lines) {
      try {
        const jsonResponse = JSON.parse(line);
        if (jsonResponse.type === 'uci:response') {
          const payload = jsonResponse.payload;
          if (payload.startsWith('info string book')) {
            const moveMatch = payload.match(/book move: (\w+)/);
            if (moveMatch) {
              bookMoves.push(moveMatch[1]);
            }
          }
        }
      } catch (e) {
        // Skip lines that aren't valid JSON
        continue;
      }
    }

    return bookMoves;
  }

  async testConnection(): Promise<{ connected: boolean; version?: string, lines: string[] }> {
    try {
      const response = await this.sendCommand('uci');
      const lines = response.split('\n');
      
      // Look for the version line which typically starts with "id name Stockfish"
      const versionLine = lines.find(line => line.startsWith('id name Stockfish'));
      const version = versionLine ? versionLine.split(' ')[2] : undefined;
      
      // Check if we got uciok response
      const isConnected = lines.some(line => line.includes('uciok'));
      
      return {
        connected: isConnected,
        version,
        lines
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return { connected: false, lines: [] };
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
} 