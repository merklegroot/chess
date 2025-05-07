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
        const { mainOpening, variation, subVariation } = this.parseOpeningName(name);
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

  private parseOpeningName(name: string): { mainOpening: string; variation?: string; subVariation?: string } {
    const parts = name.split(':').map(part => part.trim());
    const mainOpening = parts[0];
    
    if (parts.length === 1) {
      return { mainOpening };
    }

    const subParts = parts[1].split(',').map(part => part.trim());
    const variation = subParts[0];
    const subVariation = subParts.length > 1 ? subParts[1] : undefined;

    return { mainOpening, variation, subVariation };
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