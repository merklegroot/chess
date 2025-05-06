import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import Link from 'next/link';

function getWinner(result: string, white: string, black: string): string | null {
  switch (result) {
    case '1-0':
      return white;
    case '0-1':
      return black;
    case '1/2-1/2':
      return null;
    default:
      return null;
  }
}

export default async function GameListPage() {
  const repo = new ChessHistoryRepo();
  const games = await repo.getGames();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Games</h1>
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Game History</h2>
          <div className="text-sm text-gray-600 mb-4">
            Total games found: {games.length}
          </div>
          {games.length === 0 ? (
            <div className="text-gray-600">No games found.</div>
          ) : (
            <div className="space-y-4">
              {games.map((game, index) => {
                const winner = getWinner(game.result, game.white, game.black);
                return (
                  <Link 
                    href={`/game/details/${index}`}
                    key={index} 
                    className="block border-b border-gray-200 pb-4 last:border-0 hover:bg-gray-50 transition-colors rounded-lg p-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${winner === game.white ? 'text-xl text-green-600' : ''}`}>
                            {game.white}
                            {winner === game.white && (
                              <span className="ml-2" title="Winner">🏆</span>
                            )}
                          </span>
                          <span className="mx-2">vs</span>
                          <span className={`font-medium ${winner === game.black ? 'text-xl text-green-600' : ''}`}>
                            {game.black}
                            {winner === game.black && (
                              <span className="ml-2" title="Winner">🏆</span>
                            )}
                          </span>
                        </div>
                        {winner === null && (
                          <span className="text-gray-500 text-sm">(Draw)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(game.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Event: {game.event}</div>
                      <div>Result: {game.result}</div>
                      <div>Moves: {game.moves.length}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 