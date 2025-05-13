'use client';

import ChessBoard from '@/components/ChessBoard';
import { Chess } from 'chess.js';
import { useState } from 'react';
import { evalResult } from '@/models/evalResult';

interface evalResultWithFen extends evalResult {
    fen: string;
}

interface GameMove {
  number: number;
  isWhite: boolean;
  fenBefore: string;
  fenAfter: string;
  move: string;
}

interface MoveDetailsProps {
  move: GameMove;
  cachedEval: {
    before: evalResultWithFen | null;
    after: evalResultWithFen | null;
  };
  onEvalUpdate: (type: 'before' | 'after', evalResult: evalResult) => void;
}

export default function MoveDetails({ move, cachedEval, onEvalUpdate }: MoveDetailsProps) {
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

  const formatEval = (evalResult: evalResultWithFen | null) => {
    if (!evalResult) return null;

    // Check if it's Black's turn
    const isBlackToMove = evalResult.fen.includes(' b ');
    
    if (evalResult.mate !== undefined) {
      const mateScore = isBlackToMove ? -evalResult.mate : evalResult.mate;
      return `Mate in ${Math.abs(mateScore)} for ${mateScore > 0 ? 'White' : 'Black'}`;
    }

    if (evalResult.score === undefined) return null;
    
    // If it's Black's turn, flip the score to show White's perspective
    const scoreNum = (isBlackToMove ? -evalResult.score : evalResult.score) / 100;
    
    return `${scoreNum > 0 ? '+' : ''}${scoreNum.toFixed(2)} pawns${scoreNum > 0 ? ' advantage for White' : scoreNum < 0 ? ' advantage for Black' : ' (equal)'}`;
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
            <span className="text-xs text-gray-600">
              {formatEval(cachedEval.before)} {cachedEval.before && `(depth ${cachedEval.before.depth})`}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <ChessBoard 
            fen={move.fenAfter} 
            width={250}
            lastMove={getLastMove(move.move)}
          />
          <h3 className="text-sm font-medium text-gray-500">Position After Move</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-xs font-mono break-all">
              {move.fenAfter}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {formatEval(cachedEval.after)} {cachedEval.after && `(depth ${cachedEval.after.depth})`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 