import { Chess } from 'chess.js';

interface AnalysisResult {
  moveNumber: number;
  move: string;
  evaluation: number;
  bestMove: string;
  isBlunder: boolean;
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
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = () => {
      console.log('Connected to Stockfish server');
      this.isConnected = true;
      this.processQueue();
    };

    this.ws.onclose = () => {
      console.log('Disconnected from Stockfish server');
      this.isConnected = false;
      // Try to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onmessage = (event) => {
      const response = event.data;
      if (this.currentCallback) {
        this.currentCallback(response);
        this.currentCallback = null;
        this.processQueue();
      }
    };
  }

  private sendCommand(command: string): Promise<string> {
    return new Promise((resolve) => {
      this.messageQueue.push(command);
      this.currentCallback = resolve;
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
      this.ws.send(JSON.stringify({
        type: 'uci:command',
        payload: command
      }));
    }
  }

  async analyzePosition(fen: string, depth: number = 20): Promise<{ evaluation: number; bestMove: string }> {
    const response = await this.sendCommand(`position fen ${fen}\ngo depth ${depth}`);
    const lines = response.split('\n');
    
    let evaluation = 0;
    let bestMove = '';

    for (const line of lines) {
      try {
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
        // Skip lines that aren't valid JSON
        continue;
      }
    }

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
        isBlunder
      });
    }

    return results;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
} 