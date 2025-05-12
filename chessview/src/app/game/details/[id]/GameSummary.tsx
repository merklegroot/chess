import { chessGameModel } from '@/models/chessGameModel';
import { appOptions } from '@/options/appOptions';

interface GameSummaryProps {
  game: chessGameModel;
}

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

function getResultDisplay(result: string, white: string, username: string): { text: string; color: string; emoji: string; bgColor: string } {
  if (result === '1/2-1/2') {
    return { text: 'Draw', color: 'text-gray-600', emoji: '🤝', bgColor: 'bg-gray-50' };
  }
  const isUserWhite = white === username;
  const isWin = (isUserWhite && result === '1-0') || (!isUserWhite && result === '0-1');
  return isWin 
    ? { text: 'Won', color: 'text-green-600', emoji: '🏆', bgColor: 'bg-green-50' }
    : { text: 'Lost', color: 'text-red-600', emoji: '🌧️', bgColor: 'bg-red-50' };
}

export default function GameSummary({ game }: GameSummaryProps) {
  const username = appOptions.getChessDotComUserName();
  const opponent = getOpponent(game.white, game.black, username);
  const isUserWhite = game.white === username;
  const result = getResultDisplay(game.result, game.white, username);

  return (
    <div className={`rounded-lg shadow p-6 ${result.bgColor}`}>
      <h2 className="text-xl font-semibold mb-4">Game Summary</h2>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Opponent Section */}
        <div className="col-span-2 bg-white/75 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="text-xl">{isUserWhite ? '♚' : '♔'}</div>
            <div>
              <div className="font-medium">
                {opponent}
                <span className="text-gray-500 text-sm ml-2">
                  ({isUserWhite ? game.blackElo : game.whiteElo})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Result</div>
          <div className={`font-medium flex items-center gap-2 ${result.color}`}>
            <span className="w-5 text-center">{result.emoji}</span>
            <span>{result.text}</span>
          </div>
        </div>

        {/* Date Section */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Date</div>
          <div className="font-medium">
            {new Date(game.date).toISOString().split('T')[0]}
          </div>
        </div>

        {/* Moves Section */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Moves</div>
          <div className="font-medium">{game.moves.length}</div>
        </div>

        {/* Time Control Section */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Time Control</div>
          <div className="font-medium">{game.timeControl || 'Not specified'}</div>
        </div>
      </div>
    </div>
  );
} 