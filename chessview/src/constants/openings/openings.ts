import { londonOpenings } from "./londonOpenings";
import { openingsType } from "./openingsType";
import { ruyOpenings } from "./ruyOpenings";

export const openings: openingsType = {
  // First moves
  'e4': { white: 'King\'s Pawn Game', black: 'King\'s Pawn Game' },
  'e4 e5': { white: 'Open Game', black: 'Open Game' },
  'e4 e5 Nf3': { white: 'King\'s Knight Opening', black: 'King\'s Knight Opening' },
  'e4 e5 Nf3 Nc6': { white: 'King\'s Knight Opening', black: 'King\'s Knight Opening' },
  
  'd4 d5': { white: 'Queen\'s Pawn Game', black: 'Queen\'s Pawn Game' },

  ...ruyOpenings,
  
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

  // London System variations

  ...londonOpenings
};