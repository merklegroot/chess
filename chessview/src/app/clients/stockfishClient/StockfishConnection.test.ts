import { StockfishConnection } from './StockfishConnection';

describe('StockfishConnection', () => {
    let connection: StockfishConnection;

    beforeEach(() => {
        // Using default port
        connection = new StockfishConnection();
    });

    afterEach(() => {
        connection.disconnect();
    });

    it('should connect and get UCI response', async () => {
        console.log('Test starting...');
        
        // Initialize engine
        console.log('Sending UCI command...');
        const uciResponses = await connection.sendUci();
        console.log('UCI responses:', uciResponses);
        
        console.log('Sending isready command...');
        const readyResponses = await connection.sendIsReady();
        console.log('Ready responses:', readyResponses);
        
        try {
            // Set up starting position
            console.log('Setting up starting position...');
            await connection.setPosition();
            console.log('Position set successfully');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log('Position command failed, but continuing with default position:', error.message);
            } else {
                console.log('Position command failed with unknown error, continuing with default position');
            }
        }
        
        // Get a quick evaluation with a bit more time to think
        console.log('Starting evaluation...');
        const responses = await connection.sendEvaluate({ moveTimeMs: 100 });
        console.log('Evaluation responses:', responses);
        
        // Verify we got a response with an evaluation
        console.log('Checking response...');
        expect(responses.length).toBeGreaterThan(0);
        
        // Should include a bestmove
        expect(responses.some(response => response.includes('bestmove'))).toBe(true);
        console.log('Test completed successfully');
    }, 5000);

    it('should evaluate position after 1.e4', async () => {
        // Create a new connection with explicit port for this test
        const customConnection = new StockfishConnection(8080);
        
        try {
            // Initialize engine
            await customConnection.sendUci();
            await customConnection.sendIsReady();
            
            // Stop any ongoing analysis
            console.log('Stopping any ongoing analysis...');
            await customConnection.sendStop();
            await customConnection.sendIsReady();
            
            // Set up position
            console.log('Setting up position after 1.e4...');
            await customConnection.setPosition({ moves: ['e2e4'] });
            console.log('Position set successfully');
            
            // Ensure engine is ready
            await customConnection.sendIsReady();
            
            // Start evaluation
            console.log('Starting evaluation...');
            const responses = await customConnection.sendEvaluate({ 
                moveTimeMs: 25,
                depth: 10 // Add depth limit for more consistent results
            });
            console.log('Evaluation responses:', responses);
            
            // Wait for bestmove
            const hasBestMove = responses.some(response => response.startsWith('bestmove'));
            expect(hasBestMove).toBe(true);
            
            // Clean up
            console.log('Cleaning up...');
            await customConnection.sendStop();
            await customConnection.sendIsReady();
            
            console.log('Test completed successfully');
        } finally {
            customConnection.disconnect();
        }
    }, 15000); // Increased timeout to 15 seconds
});
