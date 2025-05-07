import fs from 'fs';
import path from 'path';
import { chessOpeningModel } from '@/models/chessOpeningModel';

// Cache for the openings data
let openingsCache: chessOpeningModel[] | null = null;

export class ChessOpeningRepo {
  private static instance: ChessOpeningRepo;

  private constructor() {}

  public static getInstance(): ChessOpeningRepo {
    if (!ChessOpeningRepo.instance) {
      ChessOpeningRepo.instance = new ChessOpeningRepo();
    }
    return ChessOpeningRepo.instance;
  }

  public list(): chessOpeningModel[] {
    if (openingsCache) {
      return openingsCache;
    }

    const openings: chessOpeningModel[] = [];
    const files = ['a.tsv', 'b.tsv', 'c.tsv', 'd.tsv', 'e.tsv'];

    for (const file of files) {
      const filePath = path.join(process.cwd(), 'data', 'chess-openings', file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Skip header line and process each line
      const lines = content.split('\n').slice(1);
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const [eco, name, pgn, uci, epd] = line.split('\t');
        const [mainOpening, variation, subVariation] = this.parseOpeningName(name);
        openings.push({ 
          eco, 
          name, 
          pgn, 
          uci, 
          epd,
          mainOpening,
          variation,
          subVariation
        });
      }
    }

    openingsCache = openings;
    return openings;
  }

  private parseOpeningName(name: string): [string, string | undefined, string | undefined] {
    const parts = name.split(/[:,]/).map(part => part.trim());
    return [
      parts[0], // mainOpening
      parts[1], // variation
      parts[2]  // subVariation
    ];
  }

  public getOpeningById(id: string): chessOpeningModel | undefined {
    const openings = this.list();
    return openings.find(opening => opening.eco === id);
  }

  public getOpeningsByEcoPrefix(prefix: string): chessOpeningModel[] {
    const openings = this.list();
    return openings.filter(opening => opening.eco.startsWith(prefix));
  }

  public listOpeningsByCategory(): Record<string, chessOpeningModel[]> {
    const openings = this.list();
    const categories: Record<string, chessOpeningModel[]> = {};

    for (const opening of openings) {
      const category = opening.eco[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(opening);
    }

    return categories;
  }

  public getOpeningsByMainName(): Record<string, chessOpeningModel[]> {
    const openings = this.list();
    const mainOpenings: Record<string, chessOpeningModel[]> = {};

    for (const opening of openings) {
      if (!mainOpenings[opening.mainOpening]) {
        mainOpenings[opening.mainOpening] = [];
      }
      mainOpenings[opening.mainOpening].push(opening);
    }

    return mainOpenings;
  }
} 