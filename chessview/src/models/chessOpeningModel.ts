export interface chessOpeningModel {
  /**  the native text of the line from the database */
  native: string;
  /** the ECO code of the opening */
  eco: string;
  /** the name of the opening */
  name: string;
  /** the PGN notation of the opening */
  pgn: string;
  /** the UCI notation of the opening */
  uci: string;
  /** the EPD notation of the opening */
  epd: string;
  // Hierarchical information
  mainOpening: string;
  variation?: string;
  subVariation?: string;
}

