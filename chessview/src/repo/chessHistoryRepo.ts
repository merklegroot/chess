import { chessGameModel } from '@/models/chessGameModel';
import fs from 'fs';
import path from 'path';

export class ChessHistoryRepo {
  private readonly dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
  }

  async getGames(): Promise<chessGameModel[]> {
    try {
      const files = await fs.promises.readdir(this.dataDir);
      const pgnFiles = files.filter(file => file.endsWith('.pgn'));
      
      const games: chessGameModel[] = [];
      
      for (const file of pgnFiles) {
        const filePath = path.join(this.dataDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const parsedGames = this.parsePGN(content);
        games.push(...parsedGames);
      }
      
      return games;
    } catch (error) {
      console.error('Error reading games:', error);
      return [];
    }
  }

  private parsePGN(content: string): chessGameModel[] {
    const games: chessGameModel[] = [];
    // Split on double newline followed by a metadata line (starts with [)
    const gameBlocks = content.split(/\n\n(?=\[)/).filter(block => block.trim());
    
    for (const block of gameBlocks) {
      try {
        const [metadata, moves] = block.split('\n\n');
        const game: chessGameModel = {
          event: '',
          site: '',
          date: '',
          round: '',
          white: '',
          black: '',
          result: '',
          whiteElo: '',
          blackElo: '',
          timeControl: '',
          endTime: '',
          termination: '',
          moves: []
        };
        
        // Parse metadata
        const metadataLines = metadata.split('\n');
        for (const line of metadataLines) {
          const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
          if (match) {
            const [_, key, value] = match;
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            game[camelKey as keyof chessGameModel] = value;
          }
        }
        
        // Parse moves
        if (moves) {
          const moveText = moves.trim();
          // Remove clock annotations and normalize whitespace
          const cleanMoves = moveText
            .replace(/\{[^}]*\}/g, '') // Remove clock annotations
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          // Split into individual moves, handling move numbers properly
          const moveTokens = cleanMoves.split(' ');
          const parsedMoves: string[] = [];
          
          for (let i = 0; i < moveTokens.length; i++) {
            const token = moveTokens[i];
            // Skip move numbers (e.g., "1.", "1...")
            if (token.match(/^\d+\.{1,3}$/)) {
              continue;
            }
            // Skip game results
            if (token === '1-0' || token === '0-1' || token === '1/2-1/2') {
              continue;
            }
            if (token) {
              parsedMoves.push(token);
            }
          }
          
          game.moves = parsedMoves;
        }
        
        if (this.isValidGame(game)) {
          games.push(game);
        }
      } catch (error) {
        console.error('Error parsing game block:', error);
      }
    }
    
    return games;
  }

  private isValidGame(game: Partial<chessGameModel>): boolean {
    const requiredFields: (keyof chessGameModel)[] = [
      'event', 'site', 'date', 'white', 'black', 'result'
    ];
    
    return requiredFields.every(field => game[field] !== undefined);
  }
}