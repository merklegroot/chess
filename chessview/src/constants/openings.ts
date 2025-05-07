export const openings: { [key: string]: { white: string, black: string } } = {
  // First moves
  'e4': { white: 'King\'s Pawn Game', black: 'King\'s Pawn Game' },
  'e4 e5': { white: 'Open Game', black: 'Open Game' },
  'e4 e5 Nf3': { white: 'King\'s Knight Opening', black: 'King\'s Knight Opening' },
  'e4 e5 Nf3 Nc6': { white: 'King\'s Knight Opening', black: 'King\'s Knight Opening' },
  
  // Ruy Lopez and variations
  'e4 e5 Nf3 Nc6 Bb5': { white: 'Ruy Lopez', black: 'Ruy Lopez Defense' },
  'e4 e5 Nf3 Nc6 Bb5 a6': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  'e4 e5 Nf3 Nc6 Bb5 d6': { white: 'Ruy Lopez, Steinitz Defense', black: 'Ruy Lopez Defense, Steinitz Variation' },
  'e4 e5 Nf3 Nc6 Bb5 Nf6': { white: 'Ruy Lopez, Berlin Defense', black: 'Ruy Lopez Defense, Berlin Variation' },
  'e4 e5 Nf3 Nc6 Bb5 f5': { white: 'Ruy Lopez, Schliemann Defense', black: 'Ruy Lopez Defense, Schliemann Variation' },
  'e4 e5 Nf3 Nc6 Bb5 Bc5': { white: 'Ruy Lopez, Classical Defense', black: 'Ruy Lopez Defense, Classical Variation' },
  'e4 e5 Nf3 Nc6 Bb5 d5': { white: 'Ruy Lopez, Open Defense', black: 'Ruy Lopez Defense, Open Variation' },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3': { white: 'Ruy Lopez, Morphy Defense', black: 'Ruy Lopez Defense, Morphy Variation' },
  
  // King's Indian Defense variations
  'd4': { white: 'Queen\'s Pawn Game', black: 'Queen\'s Pawn Game' },
  'd4 Nf6': { white: 'Indian Defense', black: 'Indian Defense' },
  'd4 Nf6 c4': { white: 'Indian Defense', black: 'Indian Defense' },
  'd4 Nf6 c4 g6': { white: 'King\'s Indian Attack', black: 'King\'s Indian Defense' },
  'd4 Nf6 c4 g6 Nc3': { white: 'King\'s Indian Attack', black: 'King\'s Indian Defense' },
  'd4 Nf6 c4 g6 Nc3 Bg7': { white: 'King\'s Indian Attack', black: 'King\'s Indian Defense' },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4': { white: 'King\'s Indian Attack, Classical Variation', black: 'King\'s Indian Defense, Classical Variation' },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6': { white: 'King\'s Indian Attack, Classical Variation', black: 'King\'s Indian Defense, Classical Variation' },
  'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3': { white: 'King\'s Indian Attack, Classical Variation', black: 'King\'s Indian Defense, Classical Variation' },
}; 