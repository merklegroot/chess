'use client';

import { chessGameModel } from '@/models/chessGameModel';
import { Chess } from 'chess.js';
import { useState } from 'react';

interface GameMovesProps {
  game: chessGameModel;
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
  const [selectedMove, setSelectedMove] = useState<number | null>(null);

  // Create array of all moves with their details including FEN positions
  const moves = game.moves.map((move, index) => {
    // Create a chess instance to calculate FEN positions
    const chess = new Chess();
    
    // Apply all moves up to this point to get the position before this move
    for (let i = 0; i < index; i++) {
      chess.move(game.moves[i]);
    }
    const fenBefore = chess.fen();
    
    // Apply this move to get the position after
    chess.move(move);
    const fenAfter = chess.fen();

    return {
      number: Math.floor(index / 2) + 1,
      isWhite: index % 2 === 0,
      move,
      fenBefore,
      fenAfter
    };
  });

  return (
    <div className="flex gap-6">
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Game Moves</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="py-2 px-4 font-medium text-gray-600 w-16">#</th>
                <th className="py-2 px-4 font-medium text-gray-600">Move</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {moves.map((move, index) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMove !== null && (
        <div className="w-96 bg-white rounded-lg shadow p-6 sticky top-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">
            Move {moves[selectedMove].number}{!moves[selectedMove].isWhite && '...'} Details
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Position Before Move</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <code className="text-xs font-mono break-all">
                  {moves[selectedMove].fenBefore}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Position After Move</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <code className="text-xs font-mono break-all">
                  {moves[selectedMove].fenAfter}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 