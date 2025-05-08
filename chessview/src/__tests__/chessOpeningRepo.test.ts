import { ChessOpeningRepo } from '@/repo/chessOpeningRepo';

describe('ChessOpeningRepo', () => {
  let repo: ChessOpeningRepo;

  beforeEach(() => {
    repo = ChessOpeningRepo.getInstance();
  });

  describe('findOpeningsByPgn', () => {
    it('should find openings that match the given PGN sequence', () => {
      const pgnSequence = '1. e4 e5 2. Nf3 Nc6 3. Bb5'; // Ruy Lopez opening

      const result = repo.findOpeningsByPgn(pgnSequence);
      expect(result.map(o => o.id)).toEqual(['ruy_lopez']);
    });

    it('should return empty array when no openings match the PGN sequence', () => {
      const pgnSequence = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3';

      const result = repo.findOpeningsByPgn(pgnSequence);
      expect(result).toEqual([]);
    });

    it('should handle partial PGN matches', () => {
      const pgnSequence = '1. e4 e5 2. Nf3'; // Should match multiple openings

      const result = repo.findOpeningsByPgn(pgnSequence);
      const resultIds = result.map(o => o.id);
      expect(resultIds).toHaveLength(2);
      expect(resultIds).toContain('ruy_lopez');
      expect(resultIds).toContain('italian_game');
    });

    it('more', () => {
        const pgn = '1. e4 e52. Nf3 f63. Bc4';
        const result = repo.findOpeningsByPgn(pgn);

        console.log('result', result);
    });
  });
}); 