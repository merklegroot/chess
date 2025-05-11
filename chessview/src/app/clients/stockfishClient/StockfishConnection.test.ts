import { StockfishConnection } from './StockfishConnection';

describe('StockfishConnection', () => {
    let connection: StockfishConnection;
    const port = 8080;

    beforeEach(() => {
        connection = new StockfishConnection(port);
    });

    afterEach(() => {
        connection.disconnect();
    });

    it('should connect and get UCI response', async () => {
        // Send UCI command and verify response
        const responses = await connection.sendCommand('uci');
        
        // Verify we got some response
        expect(responses.length).toBeGreaterThan(0);
        
        // The response should contain 'uciok' somewhere in the array
        expect(responses.some(response => response.includes('uciok'))).toBe(true);
        
        // The response should contain Stockfish version information
        expect(responses.some(response => response.includes('Stockfish'))).toBe(true);
    }, 10000); // Set timeout to 10 seconds since network operations take time

    it('should handle isready command', async () => {
        // First send UCI command to initialize
        await connection.sendCommand('uci');
        
        // Then check if engine is ready
        const responses = await connection.sendCommand('isready');
        
        // Verify we got some response
        expect(responses.length).toBeGreaterThan(0);
        
        // The response should contain 'readyok'
        expect(responses.some(response => response.includes('readyok'))).toBe(true);
    }, 10000);
}); 