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

    return { evaluation, bestMove };
  }

  async analyzeGame(game: Chess): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const moves = game.history({ verbose: true });

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const position = new Chess();
      position.load(game.fen());
      
      // Go back to the position before this move
      for (let j = 0; j < i; j++) {
        position.move(moves[j]);
      }

      const { evaluation, bestMove } = await this.analyzePosition(position.fen());
      
      // Consider a move a blunder if it's significantly worse than the best move
      const isBlunder = Math.abs(evaluation) > 2.0;

      results.push({
        moveNumber: Math.floor(i / 2) + 1,
        move: move.san,
        evaluation,
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