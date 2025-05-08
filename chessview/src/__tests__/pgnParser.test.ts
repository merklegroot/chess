import { pgnParser } from '@/utils/pgnParser';

describe('pgnParser', () => {
  it('should parse a simple PGN string into an array of moves', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6';
    const expected = ['e4', 'e5', 'Nf3', 'Nc6'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle PGN with castling moves', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7';
    const expected = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle PGN with captures', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6';
    const expected = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle PGN with check and checkmate', () => {
    const pgn = '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#';
    const expected = ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle PGN with promotions', () => {
    const pgn = '1. e4 e5 2. d4 exd4 3. c3 dxc3 4. Bc4 cxb2 5. Bxb2 b5 6. Bxb5 a6 7. Bxa6 Bxa6 8. Qxa6 Qxa6 9. Nxa6 Nxa6 10. Rxa6 Kxa6 11. Nxa6 bxa6 12. Kxa6 cxa6 13. a6 bxa6 14. a7 bxa7 15. a8=Q';
    const expected = ['e4', 'e5', 'd4', 'exd4', 'c3', 'dxc3', 'Bc4', 'cxb2', 'Bxb2', 'b5', 'Bxb5', 'a6', 'Bxa6', 'Bxa6', 'Qxa6', 'Qxa6', 'Nxa6', 'Nxa6', 'Rxa6', 'Kxa6', 'Nxa6', 'bxa6', 'Kxa6', 'cxa6', 'a6', 'bxa6', 'a7', 'bxa7', 'a8=Q'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle PGN with ambiguous moves', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7';
    const expected = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle empty PGN string', () => {
    const pgn = '';
    const expected: string[] = [];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle PGN with comments and annotations', () => {
    const pgn = '1. e4 {Best by test} e5 {Black\'s most common response} 2. Nf3 Nc6 {Developing the knight}';
    const expected = ['e4', 'e5', 'Nf3', 'Nc6'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });

  it('should handle PGN with irregular whitespace', () => {
    const pgn = '   1.  e4    e5    2.  Nf3    Nc6   3.  Bb5   a6   ';
    const expected = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'];
    expect(pgnParser.parse(pgn)).toEqual(expected);
  });
});
