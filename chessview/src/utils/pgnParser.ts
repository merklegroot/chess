export const pgnParser = {
/** Takes in a pgn string and outputs a list of moves.
 * The moves shouldn't have a number in front of them.
 * For example, if the pgn is:
 * 1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 4. d4 exd4 5. Nxd4 Bg7 6. Be3 Nge7 7. Nc3 O-O 8. Qd2 d5
 * then the moves should be:
 * ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'g6', 'd4', 'exd4', 'Nxd4', 'Bg7', 'Be3', 'Nge7', 'Nc3', 'O-O', 'Qd2', 'd5']
 */
  parse(pgn: string): string[] {
    if (!pgn.trim()) {
      return [];
    }

    // Remove comments and annotations
    const withoutComments = pgn.replace(/\{[^}]*\}/g, '');

    // Split into tokens and filter out move numbers and game results
    const tokens = withoutComments
      .trim()
      .split(/\s+/)
      .filter(token => {
        // Skip move numbers (e.g., "1.", "1...")
        if (token.match(/^\d+\.{1,3}$/)) {
          return false;
        }
        // Skip game results
        if (token === '1-0' || token === '0-1' || token === '1/2-1/2') {
          return false;
        }
        
        return true;
      });

    return tokens;
  }
}
