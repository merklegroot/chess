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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Games</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-3">
          <h2 className="text-xl font-semibold mb-2">Game History</h2>
          <div className="text-sm text-gray-600 mb-2">
            Total games found: {games.length}
          </div>
        </div>
        
        {games.length === 0 ? (
          <div className="text-gray-600 p-3">No games found.</div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2 bg-gray-50 border-y border-gray-200 font-medium text-gray-600">
              <div>Winner</div>
              <div>Loser</div>
              <div>Date</div>
            </div>
            <div className="divide-y divide-gray-200">
              {games.map((game, index) => {
                const winner = getWinner(game.result, game.white, game.black);
                const isDraw = winner === null;
                const loser = isDraw ? null : winner === game.white ? game.black : game.white;
                
                return (
                  <Link 
                    href={`/game/details/${index}`}
                    key={index} 
                    className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2 hover:bg-gray-50 transition-colors items-center"
                  >
                    <div className="flex items-center gap-1">
                      {isDraw ? (
                        <span className="text-gray-500">Draw</span>
                      ) : (
                        <>
                          <span className="font-medium text-green-600">
                            {winner}
                            <span className="ml-1" title="Winner">🏆</span>
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isDraw ? (
                        <span className="text-gray-500">Draw</span>
                      ) : (
                        <span className="font-medium text-gray-600">{loser}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 tabular-nums">
                      {new Date(game.date).toLocaleDateString()}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 