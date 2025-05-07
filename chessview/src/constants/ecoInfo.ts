export interface EcoCategoryInfo {
  name: string;
  description: string;
}

export const ecoInfo: Record<string, EcoCategoryInfo> = {
  'A': {
    name: 'Flank Openings',
    description: 'Includes openings like English Opening, Réti Opening, Bird\'s Opening'
  },
  'B': {
    name: 'Semi-Open Games',
    description: 'Includes openings like Sicilian Defense, French Defense, Caro-Kann Defense'
  },
  'C': {
    name: 'Open Games and Indian Defenses',
    description: 'Includes openings like Ruy Lopez, Italian Game, King\'s Indian Defense'
  },
  'D': {
    name: 'Closed Games and Indian Defenses',
    description: 'Includes openings like Queen\'s Gambit, Slav Defense, Grünfeld Defense'
  },
  'E': {
    name: 'Indian Defenses',
    description: 'Includes openings like Queen\'s Indian Defense, Nimzo-Indian Defense'
  }
}; 