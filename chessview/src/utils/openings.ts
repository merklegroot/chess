import fs from 'fs';
import path from 'path';

export interface ChessOpening {
  eco: string;
  name: string;
  pgn: string;
  uci: string;
  epd: string;
}

export interface OpeningWithVariants extends ChessOpening {
  variants?: ChessOpening[];
}

// Cache for the openings data
let openingsCache: ChessOpening[] | null = null;

export function getAllOpenings(): ChessOpening[] {
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

export function getOpeningById(id: string): ChessOpening | undefined {
  const openings = getAllOpenings();
  return openings.find(opening => opening.eco === id);
}

export function getOpeningsByEcoPrefix(prefix: string): ChessOpening[] {
  const openings = getAllOpenings();
  return openings.filter(opening => opening.eco.startsWith(prefix));
}

// Group openings by their main ECO code (first letter)
export function getOpeningsByCategory(): Record<string, ChessOpening[]> {
  const openings = getAllOpenings();
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

// Get the main opening name (before the first colon or comma)
export function getMainOpeningName(name: string): string {
  return name.split(/[:,]/)[0].trim();
}

// Group openings by their main name
export function getOpeningsByMainName(): Record<string, ChessOpening[]> {
  const openings = getAllOpenings();
  const mainOpenings: Record<string, ChessOpening[]> = {};

  for (const opening of openings) {
    const mainName = getMainOpeningName(opening.name);
    if (!mainOpenings[mainName]) {
      mainOpenings[mainName] = [];
    }
    mainOpenings[mainName].push(opening);
  }

  return mainOpenings;
} 