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

    it('should evaluate starting position', async () => {
        console.log('Test starting...');
        
        // Initialize engine
        console.log('Sending UCI command...');
        const uciResponses = await connection.sendCommand('uci');
        console.log('UCI responses:', uciResponses);
        
        console.log('Sending isready command...');
        const readyResponses = await connection.sendCommand('isready');
        console.log('Ready responses:', readyResponses);
        
        try {
            // Set up starting position - note: this command doesn't return a response
            console.log('Sending position command...');
            await connection.sendCommand('position startpos');
            console.log('Position command sent successfully');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log('Position command failed, but continuing with default position:', error.message);
            } else {
                console.log('Position command failed with unknown error, continuing with default position');
            }
        }
        
        // Get a quick evaluation with a bit more time to think
        console.log('Sending evaluation command...');
        const responses = await connection.sendCommand('go movetime 100');
        console.log('Evaluation responses:', responses);
        
        // Verify we got a response with an evaluation
        console.log('Checking response...');
        expect(responses.length).toBeGreaterThan(0);
        
        // Should include a bestmove
        expect(responses.some(response => response.includes('bestmove'))).toBe(true);
        console.log('Test completed successfully');
    }, 5000);
});
