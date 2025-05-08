export default function DevPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Stockfish Operations</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Position Analysis</h3>
                <p className="text-gray-600 mb-2">Command: <code className="bg-gray-200 px-2 py-1 rounded">{"position fen ${fen}\\ngo depth ${depth}"}</code></p>
                <p className="text-gray-600">Analyzes a specific chess position at a given depth, returning evaluation score and best move.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Book Moves</h3>
                <p className="text-gray-600 mb-2">Command: <code className="bg-gray-200 px-2 py-1 rounded">{"position fen ${fen}\\ngo book"}</code></p>
                <p className="text-gray-600">Retrieves theory moves (book moves) for a given position.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Game Analysis</h3>
                <p className="text-gray-600 mb-2">Uses position analysis for each move in the game to:</p>
                <ul className="list-disc list-inside text-gray-600 ml-4">
                  <li>Compare evaluations before and after each move</li>
                  <li>Identify blunders (moves that significantly worsen the position)</li>
                  <li>Get book moves for each position</li>
                </ul>
                <p className="text-gray-600 mt-2">Returns analysis results including move number, move played, evaluation, best move, blunder status, and available book moves.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Service Implementation</h3>
                <p className="text-gray-600 mb-2">The Stockfish operations are wrapped in a WebSocket-based service that:</p>
                <ul className="list-disc list-inside text-gray-600 ml-4">
                  <li>Connects to local Stockfish server at <code className="bg-gray-200 px-2 py-1 rounded">ws://localhost:8080</code></li>
                  <li>Maintains a message queue for commands</li>
                  <li>Handles automatic reconnection if connection is lost</li>
                  <li>Processes responses asynchronously</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 