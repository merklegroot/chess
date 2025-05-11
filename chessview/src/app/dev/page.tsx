'use client';

import { useState } from 'react';
import { StockfishConnection } from '../clients/stockfishClient/StockfishConnection';
import ChessBoard from '@/components/ChessBoard';

export default function DevPage() {
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Position analysis state
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [moveTimeMs, setMoveTimeMs] = useState(1000);
  const [depth, setDepth] = useState(15);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const checkVersion = async () => {
    setLoading(true);
    setError(null);
    const connection = new StockfishConnection();

    try {
      const version = await connection.getVersion();
      setVersion(version);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      connection.disconnect();
    }
  };

  const analyzeBestMove = async () => {
    setAnalyzing(true);
    setError(null);
    setBestMove(null);
    const connection = new StockfishConnection();

    try {
      // Initialize engine
      await connection.sendUci();
      await connection.sendIsReady();
      
      // Set position and get evaluation
      await connection.setPosition({ fen });
      const responses = await connection.sendEvaluate({ 
        moveTimeMs, 
        depth 
      });

      // Find the bestmove response
      const bestMoveResponse = responses.find(response => response.startsWith('bestmove'));
      if (!bestMoveResponse) {
        throw new Error('No best move found in engine response');
      }

      // Extract the move
      const match = bestMoveResponse.match(/bestmove\s+(\S+)/);
      if (!match) {
        throw new Error('Could not parse best move from response');
      }

      setBestMove(match[1]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAnalyzing(false);
      connection.disconnect();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Stockfish Engine Info</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <button
                  onClick={checkVersion}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Checking Version...' : 'Check Stockfish Version'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {version && !error && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    Connected to {version}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Position Analysis</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <ChessBoard 
                    fen={fen} 
                    width={400}
                    lastMove={bestMove || undefined}
                  />
                </div>

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
                    Current position: Starting position
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="moveTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Think Time (ms)
                    </label>
                    <input
                      type="number"
                      id="moveTime"
                      value={moveTimeMs}
                      onChange={(e) => setMoveTimeMs(Number(e.target.value))}
                      min="100"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Depth
                    </label>
                    <input
                      type="number"
                      id="depth"
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  onClick={analyzeBestMove}
                  disabled={analyzing}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing Position...' : 'Find Best Move'}
                </button>

                {bestMove && !error && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    Best move: <code className="bg-green-100 px-2 py-1 rounded">{bestMove}</code>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 