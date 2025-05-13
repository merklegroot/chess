'use client';

import ChessBoard from '@/components/ChessBoard';
import { Chess } from 'chess.js';
import { useState } from 'react';
import { StockfishConnection } from '@/app/clients/stockfishClient/StockfishConnection';

interface MoveDetailsProps {
  move: {
    number: number;
    isWhite: boolean;
    fenBefore: string;
    fenAfter: string;
    move: string;
  };
}

interface EvalResult {
  score?: number;
  mate?: number;
  depth: number;
}

export default function MoveDetails({ move }: MoveDetailsProps) {
  const [beforeEval, setBeforeEval] = useState<EvalResult | null>(null);
  const [afterEval, setAfterEval] = useState<EvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<{ before: boolean; after: boolean }>({ before: false, after: false });

  // Get the from and to squares for the arrow
  const getLastMove = (moveStr: string): string | undefined => {
    try {
      const chess = new Chess(move.fenBefore);
      const moveObj = chess.move(moveStr);
      if (moveObj) {
        return moveObj.from + moveObj.to;
      }
    } catch (e) {
      console.error('Error getting move squares:', e);
    }
    return undefined;
  };

  const getQuickEvaluation = async (fen: string, type: 'before' | 'after') => {
    setIsEvaluating(prev => ({ ...prev, [type]: true }));
    const connection = new StockfishConnection();

    try {
      await connection.sendUci();
      await connection.sendIsReady();
      await connection.setPosition({ fen });
      await connection.sendIsReady();
      
      const evalResult = await connection.sendSearchMoves();
      if (type === 'before') {
        setBeforeEval(evalResult);
      } else {
        setAfterEval(evalResult);
      }
    } catch (err) {
      console.error('Error getting evaluation:', err);
    } finally {
      setIsEvaluating(prev => ({ ...prev, [type]: false }));
      connection.disconnect();
    }
  };

  const formatEval = (evalResult: EvalResult | null) => {
    if (!evalResult) return null;
    if (evalResult.mate !== undefined) {
      return `Mate in ${Math.abs(evalResult.mate)} ${evalResult.mate > 0 ? 'moves' : 'against'}`;
    }
    if (evalResult.score === undefined) return null;
    
    const scoreNum = evalResult.score / 100;
    return `${scoreNum > 0 ? '+' : ''}${scoreNum.toFixed(2)} pawns${scoreNum > 0 ? ' advantage' : scoreNum < 0 ? ' disadvantage' : ''}`;
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow p-6 sticky top-6 h-fit">
      <h2 className="text-xl font-semibold mb-4">
        Move {move.number}{!move.isWhite && '...'} Details
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Position Before Move</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-xs font-mono break-all">
              {move.fenBefore}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => getQuickEvaluation(move.fenBefore, 'before')}
              disabled={isEvaluating.before}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isEvaluating.before ? 'Evaluating...' : 'Evaluate'}
            </button>
            {beforeEval && (
              <span className="text-xs text-gray-600">
                {formatEval(beforeEval)} (depth {beforeEval.depth})
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <ChessBoard 
            fen={move.fenAfter} 
            width={300}
            lastMove={getLastMove(move.move)}
          />
          <h3 className="text-sm font-medium text-gray-500">Position After Move</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-xs font-mono break-all">
              {move.fenAfter}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => getQuickEvaluation(move.fenAfter, 'after')}
              disabled={isEvaluating.after}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isEvaluating.after ? 'Evaluating...' : 'Evaluate'}
            </button>
            {afterEval && (
              <span className="text-xs text-gray-600">
                {formatEval(afterEval)} (depth {afterEval.depth})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 