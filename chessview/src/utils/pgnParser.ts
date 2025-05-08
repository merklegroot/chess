export const pgnParser = {
/** Takes in a pgn string and outputs a list of moves.
 * The moves shouldn't have a number in front of them.
 * For example, if the pgn is:
 * 1. e4 e5 2. Nf3 Nc6 3. Bb5 g6 4. d4 exd4 5. Nxd4 Bg7 6. Be3 Nge7 7. Nc3 O-O 8. Qd2 d5
 * then the moves should be:
 * ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'g6', 'd4', 'exd4', 'Nxd4', 'Bg7', 'Be3', 'Nge7', 'Nc3', 'O-O', 'Qd2', 'd5']
 */
  parse: (pgn: string): string[] => {
    throw Error('Not implemented');
  }
}
