import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';

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
              {games.map((game, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{game.white}</span>
                      <span className="mx-2">vs</span>
                      <span className="font-medium">{game.black}</span>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 