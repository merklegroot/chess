export interface chessOpeningModel {
  eco: string;
  name: string;
  pgn: string;
  uci: string;
  epd: string;
  // Hierarchical information
  mainOpening: string;
  variation?: string;
  subVariation?: string;
}

export interface chessOpeningWithVariantsModel extends chessOpeningModel {
  variants?: chessOpeningModel[];
}
