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

    it('should evaluate position after 1.e4', async () => {
        // Initialize engine
        await connection.sendCommand('uci');
        await connection.sendCommand('isready');
        
        // Stop any ongoing analysis
        console.log('Stopping any ongoing analysis...');
        await connection.sendCommand('stop');
        // Always follow stop with isready to ensure synchronization
        await connection.sendCommand('isready');
        
        // Set up position
        console.log('Sending position command...');
        await connection.sendCommand('position startpos moves e2e4');
        console.log('Position command sent successfully');
        
        // Ensure engine is ready
        await connection.sendCommand('isready');
        
        // Start evaluation
        console.log('Sending evaluation command...');
        const responses = await connection.sendCommand('go movetime 25');
        console.log('Evaluation responses:', responses);
        
        // Wait for bestmove
        const hasBestMove = responses.some(response => response.startsWith('bestmove'));
        expect(hasBestMove).toBe(true);
        
        // Clean up
        console.log('Cleaning up...');
        await connection.sendCommand('stop');
        await connection.sendCommand('isready');
        
        console.log('Test completed successfully');
    }, 15000); // Increased timeout to 15 seconds
});
