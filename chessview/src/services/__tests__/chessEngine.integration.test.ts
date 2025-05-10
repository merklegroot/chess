import { ChessEngineService } from '../chessEngine';

describe('ChessEngineService Integration', () => {
  let engine: ChessEngineService;

  beforeAll(() => {
    engine = new ChessEngineService();
  });

  afterAll(() => {
    engine.disconnect();
  });

  it('should verify connection and get Stockfish version', async () => {
    // Wait for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Testing connection...');
    const result = await engine.testConnection();
    console.log('Connection test result:', result);

    expect(result.connected).toBe(true);
    expect(result.version).toBeDefined();
    expect(result.version).toMatch(/^\d+\.\d+$/); // Should be a version number like "15.1"
  }, 5000);
}); 