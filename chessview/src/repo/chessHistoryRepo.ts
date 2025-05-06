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
        const game: Partial<chessGameModel> = {
          moves: [] // Initialize moves as empty array
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
          // Remove move numbers and clock annotations
          const cleanMoves = moveText
            .replace(/\d+\./g, '') // Remove move numbers
            .replace(/\{[^}]*\}/g, '') // Remove clock annotations
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .split(' ')
            .filter(move => move && move !== '1-0' && move !== '0-1' && move !== '1/2-1/2');
          
          game.moves = cleanMoves;
        }
        
        if (this.isValidGame(game)) {
          games.push(game as chessGameModel);
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