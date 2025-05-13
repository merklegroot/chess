'use client';

import { chessGameModel } from '@/models/chessGameModel';
import { Chess } from 'chess.js';
import { useState, useEffect } from 'react';
import MoveDetails from './MoveDetails';
import { useParams } from 'next/navigation';
import { evalResult } from '@/models/evalResult';

interface GameMovesProps {
  game: chessGameModel;
}

interface EvalResult extends evalResult {
  fen: string;
}

interface EvalCache {
  before: EvalResult | null;
  after: EvalResult | null;
}

const pieceSymbols: { [key: string]: { white: string; black: string } } = {
  'K': { white: '♔', black: '♚' },
  'Q': { white: '♕', black: '♛' },
  'R': { white: '♖', black: '♜' },
  'B': { white: '♗', black: '♝' },
  'N': { white: '♘', black: '♞' },
  'P': { white: '♙', black: '♟' }
};

function getPieceSymbol(move: string, isWhite: boolean): string {
  // Get the first character of the move
  const firstChar = move.charAt(0);
  
  // If it's uppercase, it's a piece move (except for O-O and O-O-O)
  if (firstChar === firstChar.toUpperCase() && !move.startsWith('O')) {
    return pieceSymbols[firstChar]?.[isWhite ? 'white' : 'black'] || '';
  }
  
  // If it's lowercase or castling, it's a pawn move
  return pieceSymbols['P'][isWhite ? 'white' : 'black'];
}

export default function GameMoves({ game }: GameMovesProps) {
  const params = useParams();
  const gameId = params.id as string;
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [fenCache, setFenCache] = useState<{[index: number]: { before: string, after: string }}>({});
  const [evalCache, setEvalCache] = useState<{[index: number]: EvalCache}>({});
  const [isEvaluatingAll, setIsEvaluatingAll] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState({ current: 0, total: 0 });

  // Create array of all moves with their details including FEN positions
  const moves = game.moves.map((move, index) => {
    // Check if FEN positions are already cached
    if (fenCache[index]) {
      return {
        number: Math.floor(index / 2) + 1,
        isWhite: index % 2 === 0,
        move,
        fenBefore: fenCache[index].before,
        fenAfter: fenCache[index].after
      };
    }

    // If not cached, calculate FEN positions
    const chess = new Chess();
    
    // Apply all moves up to this point to get the position before this move
    for (let i = 0; i < index; i++) {
      chess.move(game.moves[i]);
    }
    const fenBefore = chess.fen();
    
    // Apply this move to get the position after
    chess.move(move);
    const fenAfter = chess.fen();

    // Cache the FEN positions
    setFenCache(prev => ({
      ...prev,
      [index]: { before: fenBefore, after: fenAfter }
    }));

    return {
      number: Math.floor(index / 2) + 1,
      isWhite: index % 2 === 0,
      move,
      fenBefore,
      fenAfter
    };
  });

  // Clear caches when component unmounts
  useEffect(() => {
    return () => {
      setFenCache({});
      setEvalCache({});
    };
  }, []);

  const getQuickEvaluation = async (fen: string, type: 'before' | 'after', moveNumber: number, isWhite: boolean) => {
    if (!gameId) {
      console.error('No game ID available');
      return;
    }

    try {
      const params = new URLSearchParams({
        gameId,
        fen,
        depth: '15',
        moveTime: '1000'
      });

      const response = await fetch(`/api/eval-cache?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get evaluation: ${response.statusText}`);
      }

      const evalResult = await response.json();
      
      const evalResultWithFen: EvalResult = {
        ...evalResult,
        fen
      };

      // Calculate the correct index based on move number and color
      const moveIndex = (moveNumber - 1) * 2 + (isWhite ? 0 : 1);
      updateEvalCache(moveIndex, type, evalResultWithFen);
      return evalResultWithFen;
    } catch (err) {
      console.error('Error getting evaluation:', err);
      return null;
    }
  };

  const evaluateAll = async () => {
    setIsEvaluatingAll(true);
    const totalEvaluations = moves.length; // only evaluating after positions
    setEvaluationProgress({ current: 0, total: totalEvaluations });

    try {
      // Evaluate all moves sequentially
      for (const move of moves) {
        // Only evaluate position after move
        await getQuickEvaluation(move.fenAfter, 'after', move.number, move.isWhite);
        setEvaluationProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
    } finally {
      setIsEvaluatingAll(false);
      setEvaluationProgress({ current: 0, total: 0 });
    }
  };

  const updateEvalCache = (moveIndex: number, type: 'before' | 'after', evalResult: EvalResult) => {
    setEvalCache(prev => ({
      ...prev,
      [moveIndex]: {
        ...prev[moveIndex],
        [type]: evalResult
      }
    }));
  };

  const formatEval = (evalResult: EvalResult | null) => {
    if (!evalResult) return null;
    
    if (evalResult.mate !== undefined) {
      return `M${evalResult.mate}`;
    }

    if (evalResult.score === undefined) return null;
    
    // Just show the raw score from Stockfish
    const scoreNum = evalResult.score / 100;
    return scoreNum.toFixed(2);
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Game Moves</h2>
          <button
            onClick={evaluateAll}
            disabled={isEvaluatingAll}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isEvaluatingAll 
              ? `Evaluating ${evaluationProgress.current}/${evaluationProgress.total}...` 
              : 'Evaluate All Moves'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="py-2 px-4 font-medium text-gray-600 w-16">#</th>
                <th className="py-2 px-4 font-medium text-gray-600">Move</th>
                <th className="py-2 px-4 font-medium text-gray-600 text-right w-24">Eval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {moves.map((move, index) => {
                const moveEval = evalCache[index];
                const evaluation = moveEval?.after ? formatEval(moveEval.after) : null;

                return (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedMove === index ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedMove(selectedMove === index ? null : index)}
                  >
                    <td className="py-2 px-4 text-gray-500 font-mono">
                      {move.number}.{!move.isWhite && '..'}
                    </td>
                    <td className="py-2 px-4 font-medium font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-lg">
                          {getPieceSymbol(move.move, move.isWhite)}
                        </span>
                        <span>{move.move}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 font-mono text-right">
                      <div className="flex items-center justify-end gap-2">
                        {evaluation ? (
                          <span>
                            {evaluation}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row selection
                              getQuickEvaluation(move.fenAfter, 'after', move.number, move.isWhite);
                            }}
                            className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            Evaluate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMove !== null && (
        <MoveDetails 
          move={moves[selectedMove]}
          cachedEval={evalCache[selectedMove] || { before: null, after: null }}
          onEvalUpdate={(type, evalResult) => {
            const moveIndex = selectedMove;
            const evalResultWithFen: EvalResult = {
              ...evalResult,
              fen: type === 'before' ? moves[selectedMove].fenBefore : moves[selectedMove].fenAfter
            };
            updateEvalCache(moveIndex, type, evalResultWithFen);
          }}
        />
      )}
    </div>
  );
} 