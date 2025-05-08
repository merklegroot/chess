'use client';

import { useState } from 'react';

export default function DevPage() {
  const [fen, setFen] = useState('rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2');
  const [depth, setDepth] = useState('2');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePosition = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze/position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          depth: parseInt(depth),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze position');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Position Analysis</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fen" className="block text-sm font-medium text-gray-700 mb-1">
                    FEN Position
                  </label>
                  <input
                    type="text"
                    id="fen"
                    value={fen}
                    onChange={(e) => setFen(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Current position: King's Gambit after 1.e4 e5 2.Nf3
                  </p>
                </div>
                <div>
                  <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
                    Analysis Depth
                  </label>
                  <input
                    type="number"
                    id="depth"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={analyzePosition}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Position'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {result && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Analysis Result</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </section>

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