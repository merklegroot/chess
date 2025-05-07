'use client';

import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  fen: string;
  width?: number;
  lastMove?: string;
}

type Square = "a8" | "b8" | "c8" | "d8" | "e8" | "f8" | "g8" | "h8" | "a7" | "b7" | "c7" | "d7" | "e7" | "f7" | "g7" | "h7" | "a6" | "b6" | "c6" | "d6" | "e6" | "f6" | "g6" | "h6" | "a5" | "b5" | "c5" | "d5" | "e5" | "f5" | "g5" | "h5" | "a4" | "b4" | "c4" | "d4" | "e4" | "f4" | "g4" | "h4" | "a3" | "b3" | "c3" | "d3" | "e3" | "f3" | "g3" | "h3" | "a2" | "b2" | "c2" | "d2" | "e2" | "f2" | "g2" | "h2" | "a1" | "b1" | "c1" | "d1" | "e1" | "f1" | "g1" | "h1";
type Arrow = [Square, Square, string?];

export default function ChessBoard({ fen, width = 400, lastMove }: ChessBoardProps) {
  // Convert lastMove to arrow format if provided
  const arrows: Arrow[] = lastMove ? [[
    lastMove.slice(0, 2) as Square,
    lastMove.slice(2, 4) as Square,
    '#0000ff'
  ]] : [];

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: width, height: width }}>
        <Chessboard 
          position={fen}
          boardWidth={width}
          arePiecesDraggable={false}
          boardOrientation="white"
          customArrows={arrows}
        />
      </div>
      <div className="text-xs text-gray-500">FEN: {fen}</div>
    </div>
  );
} 