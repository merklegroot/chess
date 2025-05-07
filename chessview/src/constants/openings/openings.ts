import { londonOpenings } from "./londonOpenings";
import { openingsType } from "./openingsType";
import { ruyOpenings } from "./ruyOpenings";
import { caroDefenseOpenings } from "./caro";
import { kingsIndianOpenings } from "./kingsIndian";

export const openings: openingsType = {
  // First moves
  'e4': { white: 'King\'s Pawn Game', black: 'King\'s Pawn Game' },
  'e4 e5': { white: 'Open Game', black: 'Open Game' },
  'e4 e5 Nf3': { white: 'King\'s Knight Opening', black: 'King\'s Knight Opening' },
  'e4 e5 Nf3 Nc6': { white: 'King\'s Knight Opening', black: 'King\'s Knight Opening' },
  'd4 d5': { white: 'Queen\'s Pawn Game', black: 'Queen\'s Pawn Game' },

  ...ruyOpenings,
  ...caroDefenseOpenings,  
  ...kingsIndianOpenings,
  ...londonOpenings
};