import fs from 'fs';
import path from 'path';
import { ChessOpening } from '@/models/openings';

// Cache for the openings data
let openingsCache: ChessOpening[] | null = null;

export class ChessOpeningRepo {
  private static instance: ChessOpeningRepo;

  private constructor() {}

  public static getInstance(): ChessOpeningRepo {
    if (!ChessOpeningRepo.instance) {
      ChessOpeningRepo.instance = new ChessOpeningRepo();
    }
    return ChessOpeningRepo.instance;
  }

  public list(): ChessOpening[] {
    if (openingsCache) {
      return openingsCache;
    }

    const openings: ChessOpening[] = [];
    const files = ['a.tsv', 'b.tsv', 'c.tsv', 'd.tsv', 'e.tsv'];

    for (const file of files) {
      const filePath = path.join(process.cwd(), 'data', 'chess-openings', file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Skip header line and process each line
      const lines = content.split('\n').slice(1);
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const [eco, name, pgn, uci, epd] = line.split('\t');
        openings.push({ eco, name, pgn, uci, epd });
      }
    }

    openingsCache = openings;
    return openings;
  }

  public getOpeningById(id: string): ChessOpening | undefined {
    const openings = this.list();
    return openings.find(opening => opening.eco === id);
  }

  public getOpeningsByEcoPrefix(prefix: string): ChessOpening[] {
    const openings = this.list();
    return openings.filter(opening => opening.eco.startsWith(prefix));
  }

  public listOpeningsByCategory(): Record<string, ChessOpening[]> {
    const openings = this.list();
    const categories: Record<string, ChessOpening[]> = {};

    for (const opening of openings) {
      const category = opening.eco[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(opening);
    }

    return categories;
  }

  public getOpeningsByMainName(): Record<string, ChessOpening[]> {
    const openings = this.list();
    const mainOpenings: Record<string, ChessOpening[]> = {};

    for (const opening of openings) {
      const mainName = this.getMainOpeningName(opening.name);
      if (!mainOpenings[mainName]) {
        mainOpenings[mainName] = [];
      }
      mainOpenings[mainName].push(opening);
    }

    return mainOpenings;
  }

  private getMainOpeningName(name: string): string {
    return name.split(/[:,]/)[0].trim();
  }
} 