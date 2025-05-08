import { ChessEngineService } from '../chessEngine';

describe('ChessEngineService', () => {
  let engine: ChessEngineService;
  let mockWebSocket: WebSocket;
  let mockSend: jest.Mock;
  let mockOnMessage: ((event: { data: string }) => void) | null = null;

  beforeEach(() => {
    // Mock WebSocket
    mockSend = jest.fn();
    mockWebSocket = {
      send: mockSend,
      addEventListener: jest.fn((event, callback) => {
        if (event === 'message') {
          mockOnMessage = callback;
        }
      }),
      removeEventListener: jest.fn(),
      close: jest.fn(),
    } as unknown as WebSocket;

    // Mock WebSocket constructor
    global.WebSocket = jest.fn(() => mockWebSocket) as any;

    engine = new ChessEngineService();
  });

  afterEach(() => {
    engine.disconnect();
  });

  describe('analyzePosition', () => {
    it('should parse evaluation and best move from Stockfish response', async () => {
      const fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';
      const depth = 20;

      // Simulate Stockfish response
      const mockResponse = [
        'info depth 1 seldepth 1 multipv 1 score cp 31 nodes 20 nps 20000 tbhits 0 time 1 pv e7e6',
        'info depth 2 seldepth 2 multipv 1 score cp 28 nodes 40 nps 40000 tbhits 0 time 1 pv e7e6 d2d4',
        'info depth 3 seldepth 3 multipv 1 score cp 35 nodes 60 nps 60000 tbhits 0 time 1 pv e7e6 d2d4 d7d5',
        'bestmove e7e6 ponder d2d4'
      ].join('\n');

      // Start the analysis
      const analysisPromise = engine.analyzePosition(fen, depth);

      // Simulate WebSocket connection
      const onOpenCallback = (mockWebSocket as any).onopen;
      onOpenCallback();

      // Simulate receiving the response
      if (mockOnMessage) {
        mockOnMessage({ data: mockResponse });
      }

      // Wait for the analysis to complete
      const result = await analysisPromise;

      // Verify the command was sent correctly
      expect(mockSend).toHaveBeenCalledWith(`position fen ${fen}\ngo depth ${depth}`);

      // Verify the result
      expect(result).toEqual({
        evaluation: 0.35, // From the last info line with score cp 35
        bestMove: 'e7e6'  // From the bestmove line
      });
    });

    it('should handle negative evaluations', async () => {
      const fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';
      const depth = 20;

      // Simulate Stockfish response with negative evaluation
      const mockResponse = [
        'info depth 1 seldepth 1 multipv 1 score cp -31 nodes 20 nps 20000 tbhits 0 time 1 pv e7e6',
        'info depth 2 seldepth 2 multipv 1 score cp -28 nodes 40 nps 40000 tbhits 0 time 1 pv e7e6 d2d4',
        'info depth 3 seldepth 3 multipv 1 score cp -35 nodes 60 nps 60000 tbhits 0 time 1 pv e7e6 d2d4 d7d5',
        'bestmove e7e6 ponder d2d4'
      ].join('\n');

      // Start the analysis
      const analysisPromise = engine.analyzePosition(fen, depth);

      // Simulate WebSocket connection
      const onOpenCallback = (mockWebSocket as any).onopen;
      onOpenCallback();

      // Simulate receiving the response
      if (mockOnMessage) {
        mockOnMessage({ data: mockResponse });
      }

      // Wait for the analysis to complete
      const result = await analysisPromise;

      // Verify the result
      expect(result).toEqual({
        evaluation: -0.35, // From the last info line with score cp -35
        bestMove: 'e7e6'   // From the bestmove line
      });
    });
  });
}); 