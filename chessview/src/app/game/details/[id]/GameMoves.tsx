'use client';

import { chessGameModel } from '@/models/chessGameModel';
import { Chess } from 'chess.js';
import { useState, useEffect } from 'react';
import MoveDetails from './MoveDetails';
import { useParams } from 'next/navigation';
import { evalResult } from '@/models/evalResult';

interface GameMove {
  number: number;
  isWhite: boolean;
  move: string;
  fenBefore: string;
  fenAfter: string;
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

interface GameMovesProps {
  game: chessGameModel;
  processedMoves: GameMove[];
  evalCache: Record<number, EvalCache>;
  isEvaluatingAll: boolean;
  evaluationProgress: { current: number; total: number };
  onEvaluateAllPress: () => Promise<void>;
  onEvaluatePosition: (fen: string, type: 'before' | 'after', moveNumber: number, isWhite: boolean) => Promise<void>;
  onUpdateEvalCache: (moveIndex: number, type: 'before' | 'after', evalResult: EvalResult) => void;
}

export default function GameMoves({ 
  game, 
  processedMoves, 
  evalCache,
  isEvaluatingAll,
  evaluationProgress,
  onEvaluateAllPress,
  onEvaluatePosition,
  onUpdateEvalCache
}: GameMovesProps) {
  const params = useParams();
  const gameId = params.id as string;
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [fenCache, setFenCache] = useState<{[index: number]: { before: string, after: string }}>({});
  const [showRawMoves, setShowRawMoves] = useState(false);

  // Use processedMoves if provided, otherwise calculate them
  const moves = processedMoves || game.moves.map((move, index) => {
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
    };
  }, []);

  const formatEval = (evalResult: EvalResult | null) => {
    if (!evalResult) return null;
    
    if (evalResult.mate !== undefined) {
      return `M${evalResult.mate}`;
    }

    if (evalResult.score === undefined) return null;
    
    const scoreNum = evalResult.score / 100;
    return scoreNum.toFixed(1);
  };

  const formatDelta = (current: number | undefined, previous: number | undefined | null) => {
    if (current === undefined || previous === undefined || previous === null) return null;
    return (current - previous) / 100;
  };

  const getMoveQuality = (delta: number | null, isWhite: boolean): { text: string; color: string } => {
    if (delta === null) return { text: '...', color: 'text-gray-400' };
    
    // Invert delta for black's perspective
    const adjustedDelta = isWhite ? delta : -delta;
    
    if (adjustedDelta >= 2) return { text: 'Brilliant', color: 'text-blue-600' };
    if (adjustedDelta >= 1) return { text: 'Good', color: 'text-green-600' };
    if (adjustedDelta >= -0.5) return { text: 'Okay', color: 'text-gray-600' };
    if (adjustedDelta >= -1) return { text: 'Inaccuracy', color: 'text-yellow-600' };
    if (adjustedDelta >= -2) return { text: 'Mistake', color: 'text-orange-600' };
    return { text: 'Blunder', color: 'text-red-600' };
  };

  return (
    <>
      {/* TEMPORARY: Raw moves display */}
      <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded">
        <div className="font-bold text-yellow-800 mb-2">DEBUG: Raw Moves Array</div>
        <pre className="font-mono text-sm overflow-auto">
          {JSON.stringify(game.moves, null, 2)}
        </pre>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Game Moves</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRawMoves(!showRawMoves)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {showRawMoves ? 'Hide Raw Moves' : 'Show Raw Moves'}
            </button>
            <button
              onClick={onEvaluateAllPress}
              disabled={isEvaluatingAll}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isEvaluatingAll ? `Evaluating... ${evaluationProgress.current}/${evaluationProgress.total}` : 'Evaluate All'}
            </button>
          </div>
        </div>

        {showRawMoves && (
          <div className="mb-4 p-4 bg-gray-50 rounded overflow-auto">
            <div className="font-mono text-sm whitespace-pre-wrap">
              {JSON.stringify(game.moves, null, 2)}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left">Move</th>
                <th className="py-2 px-4 text-left">White</th>
                <th className="py-2 px-4 text-left">Eval</th>
                <th className="py-2 px-4 text-left">Quality</th>
                <th className="py-2 px-4 text-left">Black</th>
                <th className="py-2 px-4 text-left">Eval</th>
                <th className="py-2 px-4 text-left">Quality</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => {
                const whiteMove = moves[i * 2];
                const blackMove = moves[i * 2 + 1];
                const whiteMoveIndex = i * 2;
                const blackMoveIndex = i * 2 + 1;

                const whiteEval = evalCache[whiteMoveIndex]?.after;
                const prevWhiteEval = whiteMoveIndex > 0 ? evalCache[whiteMoveIndex - 1]?.after : null;
                const whiteDelta = formatDelta(whiteEval?.score, prevWhiteEval?.score);
                const whiteQuality = getMoveQuality(whiteDelta, true);

                const blackEval = blackMove ? evalCache[blackMoveIndex]?.after : null;
                const blackDelta = formatDelta(blackEval?.score, whiteEval?.score);
                const blackQuality = getMoveQuality(blackDelta, false);

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-4">{i + 1}.</td>
                    <td 
                      className={`py-2 px-4 cursor-pointer ${selectedMove === whiteMoveIndex ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedMove(whiteMoveIndex)}
                    >
                      <span>
                        <span className="mr-1">{getPieceSymbol(whiteMove.move, true)}</span>
                        {whiteMove.move}
                      </span>
                    </td>
                    <td className="py-2 px-4">{formatEval(whiteEval)}</td>
                    <td className={`py-2 px-4 ${whiteQuality.color}`}>{whiteQuality.text}</td>
                    {blackMove ? (
                      <>
                        <td 
                          className={`py-2 px-4 cursor-pointer ${selectedMove === blackMoveIndex ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedMove(blackMoveIndex)}
                        >
                          <span>
                            <span className="mr-1">{getPieceSymbol(blackMove.move, false)}</span>
                            {blackMove.move}
                          </span>
                        </td>
                        <td className="py-2 px-4">{formatEval(blackEval)}</td>
                        <td className={`py-2 px-4 ${blackQuality.color}`}>{blackQuality.text}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4"></td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              onUpdateEvalCache(moveIndex, type, evalResultWithFen);
            }}
          />
        )}
      </div>
    </>
  );
} 