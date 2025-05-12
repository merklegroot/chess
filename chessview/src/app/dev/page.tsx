'use client';

import { useState } from 'react';
import { Chess } from 'chess.js';
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
  const [ponderMove, setPonderMove] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [engineLogs, setEngineLogs] = useState<Array<{type: 'sent' | 'received', message: string}>>([]);
  const [evaluation, setEvaluation] = useState<{score?: number, depth?: number, mate?: number} | null>(null);
  const [quickEval, setQuickEval] = useState<{score: number, mate?: number, depth: number} | null>(null);
  const [gettingQuickEval, setGettingQuickEval] = useState(false);

  const addToLog = (type: 'sent' | 'received', message: string) => {
    setEngineLogs(logs => [...logs, { type, message }]);
  };

  const clearLogs = () => {
    setEngineLogs([]);
  };

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
    setPonderMove(null);
    setEvaluation(null);
    clearLogs();
    const connection = new StockfishConnection();

    try {
      // Create a chess instance to get the side to move
      const chess = new Chess(fen);

      // Initialize engine
      addToLog('sent', 'uci');
      const uciResponses = await connection.sendUci();
      uciResponses.forEach(response => addToLog('received', response));

      addToLog('sent', 'isready');
      const readyResponses = await connection.sendIsReady();
      readyResponses.forEach(response => addToLog('received', response));
      
      // Set position
      const positionCmd = `position fen ${fen}`;
      addToLog('sent', positionCmd);
      await connection.setPosition({ fen });

      addToLog('sent', 'isready');
      const readyResponses2 = await connection.sendIsReady();
      readyResponses2.forEach(response => addToLog('received', response));

      // Get evaluation
      const goCmd = `go movetime ${moveTimeMs}${depth ? ` depth ${depth}` : ''}`;
      addToLog('sent', goCmd);
      
      // Get structured evaluation data
      const evaluationResult = await connection.sendFindBestMove({
        moveTimeMs,
        depth
      });
      
      // Log raw responses to the UI for debugging
      evaluationResult.infoLines.forEach(line => addToLog('received', line));
      addToLog('received', `bestmove ${evaluationResult.bestMove.move}${evaluationResult.bestMove.ponder ? ` ponder ${evaluationResult.bestMove.ponder}` : ''}`);
      
      // Update state with structured data
      setBestMove(evaluationResult.bestMove.move);
      setPonderMove(evaluationResult.bestMove.ponder || null);
      setEvaluation({
        score: evaluationResult.bestMove.score,
        depth: evaluationResult.bestMove.depth,
        mate: evaluationResult.bestMove.mate
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addToLog('sent', '(error) ' + (err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      setAnalyzing(false);
      connection.disconnect();
      addToLog('sent', '(disconnected)');
    }
  };

  const getQuickEvaluation = async () => {
    setGettingQuickEval(true);
    setError(null);
    setQuickEval(null);
    clearLogs();
    const connection = new StockfishConnection();

    try {
      // Initialize engine
      addToLog('sent', 'uci');
      const uciResponses = await connection.sendUci();
      uciResponses.forEach(response => addToLog('received', response));

      addToLog('sent', 'isready');
      const readyResponses = await connection.sendIsReady();
      readyResponses.forEach(response => addToLog('received', response));
      
      // Set position
      const positionCmd = `position fen ${fen}`;
      addToLog('sent', positionCmd);
      await connection.setPosition({ fen });

      addToLog('sent', 'isready');
      const readyResponses2 = await connection.sendIsReady();
      readyResponses2.forEach(response => addToLog('received', response));

      // Get quick evaluation
      addToLog('sent', 'go depth 1 movetime 100');
      const evalResult = await connection.getQuickEvaluation();
      
      // Update state with evaluation
      setQuickEval(evalResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addToLog('sent', '(error) ' + (err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      setGettingQuickEval(false);
      connection.disconnect();
      addToLog('sent', '(disconnected)');
    }
  };

  const applyBestMove = () => {
    if (!bestMove) return;
    
    try {
      const chess = new Chess(fen);
      chess.move({
        from: bestMove.slice(0, 2),
        to: bestMove.slice(2, 4),
        promotion: bestMove.length > 4 ? bestMove[4] : undefined
      });
      setFen(chess.fen());
      setBestMove(null);
      setPonderMove(null);
      setEvaluation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply move');
    }
  };

  const applyPonderMove = () => {
    if (!ponderMove) return;
    
    try {
      const chess = new Chess(fen);
      // First apply best move
      if (bestMove) {
        chess.move({
          from: bestMove.slice(0, 2),
          to: bestMove.slice(2, 4),
          promotion: bestMove.length > 4 ? bestMove[4] : undefined
        });
      }
      // Then apply ponder move
      chess.move({
        from: ponderMove.slice(0, 2),
        to: ponderMove.slice(2, 4),
        promotion: ponderMove.length > 4 ? ponderMove[4] : undefined
      });
      setFen(chess.fen());
      setBestMove(null);
      setPonderMove(null);
      setEvaluation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply ponder move');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
              <div className="flex gap-8">
                <div className="flex-none">
                  <div className="mb-4">
                    <ChessBoard 
                      fen={fen} 
                      width={320}
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
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
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

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={analyzeBestMove}
                      disabled={analyzing || gettingQuickEval}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {analyzing ? 'Finding Best Move...' : 'Find Best Move'}
                    </button>
                    
                    <button
                      onClick={getQuickEvaluation}
                      disabled={analyzing || gettingQuickEval}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {gettingQuickEval ? 'Getting Evaluation...' : 'Quick Position Evaluation'}
                    </button>
                  </div>

                  {quickEval !== null && !error && !analyzing && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                      <div>
                        {quickEval.mate !== undefined ? (
                          <span>Quick evaluation: <span className="font-medium">Mate in {Math.abs(quickEval.mate)} {quickEval.mate > 0 ? 'moves' : 'against you'}</span></span>
                        ) : (
                          <span>Quick evaluation: <span className="font-medium">{(quickEval.score / 100).toFixed(2)} pawns</span>
                            {quickEval.score > 0 ? ' (advantage to side to move)' : quickEval.score < 0 ? ' (disadvantage to side to move)' : ' (equal position)'}
                          </span>
                        )}
                        <span className="ml-2 text-xs">(depth {quickEval.depth})</span>
                      </div>
                    </div>
                  )}

                  {bestMove && !error && (
                    <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                      <div className="flex items-center">
                        <div className="mr-2">Best move:</div>
                        <code className="bg-green-100 px-2 py-1 rounded">{bestMove}</code>
                        <button
                          onClick={applyBestMove}
                          className="ml-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Apply
                        </button>
                      </div>
                      
                      {ponderMove && (
                        <div className="flex items-center mt-2">
                          <div className="mr-2">Expected reply:</div>
                          <code className="bg-green-100 px-2 py-1 rounded">{ponderMove}</code>
                          <button
                            onClick={applyPonderMove}
                            className="ml-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Apply Both
                          </button>
                        </div>
                      )}
                      
                      {evaluation && (
                        <div className="mt-2 text-sm">
                          {evaluation.mate !== undefined ? (
                            <span>Mate in {Math.abs(evaluation.mate)} {evaluation.mate > 0 ? 'moves' : 'against you'}</span>
                          ) : evaluation.score !== undefined ? (
                            <span>Evaluation: {(evaluation.score / 100).toFixed(2)} pawns</span>
                          ) : null}
                          {evaluation.depth && <span className="ml-2">(depth {evaluation.depth})</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Engine Communication Log</h3>
                      <button 
                        onClick={clearLogs}
                        className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        Clear
                      </button>
                    </div>
                    {engineLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`mb-1 ${log.type === 'sent' ? 'text-blue-600' : 'text-green-600'}`}
                      >
                        {log.type === 'sent' ? '→' : '←'} {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 