import { ChessHistoryRepo } from '@/repo/chessHistoryRepo';
import Link from 'next/link';
import { appOptions } from '@/options/appOptions';

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

function getOpponent(white: string, black: string, username: string): string {
  return white === username ? black : white;
}

function getResultDisplay(result: string, white: string, username: string): { text: string; color: string; emoji: string } {
  if (result === '1/2-1/2') {
    return { text: 'Draw', color: 'text-gray-600', emoji: '🤝' };
  }
  const isUserWhite = white === username;
  const isWin = (isUserWhite && result === '1-0') || (!isUserWhite && result === '0-1');
  return isWin 
    ? { text: 'Won', color: 'text-green-600', emoji: '🏆' }
    : { text: 'Lost', color: 'text-red-600', emoji: '🌧️' };
}

function getColorIcon(isWhite: boolean): string {
  return isWhite ? '♔' : '♚';
}

function getRowColorClass(result: string, white: string, username: string): string {
  if (result === '1/2-1/2') {
    return 'bg-gray-50 hover:bg-gray-100';
  }
  const isUserWhite = white === username;
  const isWin = (isUserWhite && result === '1-0') || (!isUserWhite && result === '0-1');
  return isWin 
    ? 'bg-green-50 hover:bg-green-100'
    : 'bg-red-50 hover:bg-red-100';
}

export default async function GameListPage() {
  const repo = new ChessHistoryRepo();
  const games = await repo.getGames();
  const username = appOptions.getChessDotComUserName();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Games</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-3">
          <h2 className="text-xl font-semibold mb-2">Game History</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Chess.com User:</span>
            <span className="font-medium">{username}</span>
            <span className="mx-2">•</span>
            <span>Total games: {games.length}</span>
          </div>
        </div>
        
        {games.length === 0 ? (
          <div className="text-gray-600 p-3">No games found.</div>
        ) : (
          <>
            <div className="grid grid-cols-[4rem_7rem_1fr_auto] gap-4 px-4 py-2 bg-gray-50 border-y border-gray-200 font-medium text-gray-600">
              <div>Color</div>
              <div>Result</div>
              <div>Vs.</div>
              <div>Date</div>
            </div>
            <div className="divide-y divide-gray-200">
              {games.map((game, index) => {
                const winner = getWinner(game.result, game.white, game.black);
                const isDraw = winner === null;
                const opponent = getOpponent(game.white, game.black, username);
                const isUserWhite = game.white === username;
                const result = getResultDisplay(game.result, game.white, username);
                const rowColorClass = getRowColorClass(game.result, game.white, username);
                
                return (
                  <Link 
                    href={`/game/details/${index}`}
                    key={index} 
                    className={`grid grid-cols-[4rem_7rem_1fr_auto] gap-4 px-4 py-2 transition-colors items-center ${rowColorClass}`}
                  >
                    <div className="text-xl">
                      {getColorIcon(isUserWhite)}
                    </div>
                    <div className={`font-medium ${result.color} flex items-center gap-2`}>
                      <span className="w-5 text-center">{result.emoji}</span>
                      <span>{result.text}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-5 text-xl mr-3">{getColorIcon(!isUserWhite)}</span>
                      <span className="font-medium">{opponent}</span>
                      {isDraw && <span className="text-gray-500 text-sm ml-2">(Draw)</span>}
                    </div>
                    <div className="text-sm text-gray-600 tabular-nums">
                      {new Date(game.date).toISOString().split('T')[0]}
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