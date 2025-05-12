import { chessGameModel } from '@/models/chessGameModel';

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
  // Create array of all moves with their details
  const moves = game.moves.map((move, index) => ({
    number: Math.floor(index / 2) + 1,
    isWhite: index % 2 === 0,
    move
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
              <tr key={index} className="hover:bg-gray-50">
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
  );
} 