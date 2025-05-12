'use client';

import ChessBoard from '@/components/ChessBoard';
import { Chess } from 'chess.js';

interface MoveDetailsProps {
  move: {
    number: number;
    isWhite: boolean;
    fenBefore: string;
    fenAfter: string;
    move: string;
  };
}

export default function MoveDetails({ move }: MoveDetailsProps) {
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
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Position After Move</h3>
          <ChessBoard 
            fen={move.fenAfter} 
            width={300}
            lastMove={getLastMove(move.move)}
          />
          <div className="bg-gray-50 p-3 rounded-md mt-2">
            <code className="text-xs font-mono break-all">
              {move.fenAfter}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
} 