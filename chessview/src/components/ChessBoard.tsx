'use client';

import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  fen: string;
  width?: number;
}

export default function ChessBoard({ fen, width = 400 }: ChessBoardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: width, height: width }}>
        <Chessboard 
          position={fen}
          boardWidth={width}
          arePiecesDraggable={false}
          boardOrientation="white"
        />
      </div>
      <div className="text-xs text-gray-500">FEN: {fen}</div>
    </div>
  );
} 