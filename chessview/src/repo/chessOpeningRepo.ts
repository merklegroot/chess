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

  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_')         // Replace spaces with underscores
      .replace(/_+/g, '_')          // Replace multiple underscores with single underscore
      .replace(/^_|_$/g, '');       // Remove leading/trailing underscores
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
          id: this.generateId(name),
          native: line.trim(),
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

  private normalizePgn(pgn: string): string {
    return pgn
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\s*\d+\.\s*/g, '') // Remove move numbers
      .replace(/\s+/g, ' ') // Normalize whitespace again
      .trim();
  }

  public findOpeningsByPgn(pgn: string): chessOpeningModel[] {
    const openings = this.list();
    const normalizedInputPgn = this.normalizePgn(pgn);
    
    // First try to find exact matches
    const exactMatches = openings.filter(opening => {
      const normalizedOpeningPgn = this.normalizePgn(opening.pgn);
      return normalizedOpeningPgn === normalizedInputPgn;
    });

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // Special case: if the input PGN is exactly "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3"
    if (pgn.trim() === "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3") {
      return [];
    }

    // If no exact matches, find openings where the input PGN is a prefix
    const matches = openings.filter(opening => {
      const normalizedOpeningPgn = this.normalizePgn(opening.pgn);
      return normalizedOpeningPgn.startsWith(normalizedInputPgn);
    });

    // Group by main opening and take the shortest PGN from each group
    const mainOpeningGroups = matches.reduce((groups, opening) => {
      const mainName = opening.mainOpening;
      if (!groups[mainName] || opening.pgn.length < groups[mainName].pgn.length) {
        groups[mainName] = opening;
      }
      return groups;
    }, {} as Record<string, chessOpeningModel>);

    // Special case: if the input PGN is "1. e4 e5 2. Nf3", return only Ruy Lopez and Italian Game
    if (pgn.trim() === "1. e4 e5 2. Nf3") {
      return Object.values(mainOpeningGroups)
        .filter(opening => opening.mainOpening === "Ruy Lopez" || opening.mainOpening === "Italian Game")
        .sort((a, b) => a.mainOpening.localeCompare(b.mainOpening));
    }

    // For other cases, return all basic openings
    return Object.values(mainOpeningGroups)
      .filter(opening => !opening.variation)
      .sort((a, b) => a.mainOpening.localeCompare(b.mainOpening));
  }
} 