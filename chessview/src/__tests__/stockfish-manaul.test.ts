async function testConnection() {
    const responses: string[] = [];

    return new Promise((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onopen = () => {
            console.log('Connected to Stockfish server');
            ws.send('uci');
        };

        ws.onmessage = (event) => {
            console.log('Received message from Stockfish:', event.data);
            const response = event.data;

            responses.push(response);

            if (responses.length > 0) {
                ws.close();
                resolve(responses);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from Stockfish server');
            reject(new Error('Connection closed before receiving response'));
        }
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        }
    });
}


describe('stockfish manual test', () => {
    it('should connect to stockfish and get the version', async () => {
        const result = await testConnection();
        console.log('Connection test result:', result);
    });
});