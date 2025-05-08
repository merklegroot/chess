export interface chessOpeningModel {
  /** an id based on the native line.
   * for example, if the native line is:
   * C60	Ruy Lopez: Cozio Defense, Tartakower Gambit	1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 4. d4 exd4 5. Nxd4 Bg7 6. Be3 Nge7 7. Nc3 O-O 8. Qd2 d5
   * then the id should be:
   * ruy_lopez_cozio_defense_tartakower_gambit
   */
  id: string;

  /**  the native text of the line from the database */
  native: string;
  /** the ECO code of the opening */
  eco: string;
  /** the name of the opening */
  name: string;
  /** the PGN notation of the opening */
  pgn: string;
  /** The moves of the opening.
   * This should not include the move number.
   * For example, if the opening is:
   * 1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 4. d4 exd4 5. Nxd4 Bg7 6. Be3 Nge7 7. Nc3 O-O 8. Qd2 d5
   * then the moves should be:
   * ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'g6', 'd4', 'exd4', 'Nxd4', 'Bg7', 'Be3', 'Nge7', 'Nc3', 'O-O', 'Qd2', 'd5'] (note that the move number is not included)
   */
  moves: string[];
  /** the UCI notation of the opening */
  uci: string;
  /** the EPD notation of the opening */
  epd: string;
  // Hierarchical information
  mainOpening: string;
  variation?: string;
  subVariation?: string;
}

