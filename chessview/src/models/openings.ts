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
