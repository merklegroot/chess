import { chessGameModel } from '@/models/chessGameModel';

interface GameMovesProps {
  game: chessGameModel;
}

export default function GameMoves({ game }: GameMovesProps) {
  // Group moves into pairs (white and black)
  const movePairs = [];
  for (let i = 0; i < game.moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: game.moves[i],
      black: i + 1 < game.moves.length ? game.moves[i + 1] : null
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Game Moves</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="py-2 px-4 font-medium text-gray-600 w-16">#</th>
              <th className="py-2 px-4 font-medium text-gray-600">White</th>
              <th className="py-2 px-4 font-medium text-gray-600">Black</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movePairs.map((pair) => (
              <tr key={pair.number} className="hover:bg-gray-50">
                <td className="py-2 px-4 text-gray-500 font-mono">{pair.number}.</td>
                <td className="py-2 px-4 font-medium font-mono">{pair.white}</td>
                <td className="py-2 px-4 font-medium font-mono">{pair.black || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 