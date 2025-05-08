import { ChessEngineService } from '../chessEngine';

describe('ChessEngineService Integration', () => {
  let engine: ChessEngineService;

  beforeAll(() => {
    engine = new ChessEngineService();
  });

  afterAll(() => {
    engine.disconnect();
  });

  it('should connect to Stockfish server and analyze a position', async () => {
    // Wait for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    const fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';
    const depth = 5; // Use a small depth for faster testing

    console.log('Starting position analysis...');
    const result = await engine.analyzePosition(fen, depth);
    console.log('Analysis complete:', result);

    // Basic validation of the response
    expect(result).toBeDefined();
    expect(typeof result.evaluation).toBe('number');
    expect(typeof result.bestMove).toBe('string');
    expect(result.bestMove.length).toBe(4); // Should be a valid move like 'e7e6'
  }, 20000); // Increase timeout to 20 seconds

  it('should analyze multiple positions in sequence', async () => {
    // Wait for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    const positions = [
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', // King's Gambit
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',    // e4
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1'     // d4
    ];

    for (const fen of positions) {
      console.log('\nStarting analysis of position:', fen);
      const result = await engine.analyzePosition(fen, 5);
      console.log('Analysis complete:', result);

      expect(result).toBeDefined();
      expect(typeof result.evaluation).toBe('number');
      expect(typeof result.bestMove).toBe('string');
      expect(result.bestMove.length).toBe(4);
    }
  }, 60000); // Increase timeout to 60 seconds
}); 