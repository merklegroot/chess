import Link from 'next/link';
import AnalyzeButton from './AnalyzeButton';
import { apiClient } from '@/api/apiClient';
import GameJsonViewer from './GameJsonViewer';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GameDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  let game;
  try {
    game = await apiClient.getGameById(id);
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Link href="/game/list" className="text-blue-600 hover:text-blue-800">
            ← Back to Games
          </Link>
        </div>
      </div>
    );
  }

  const winner = getWinner(game.result, game.white, game.black);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/game/list" className="text-blue-600 hover:text-blue-800">
            ← Back to Games
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Game Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Players</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${winner === game.white ? 'text-xl text-green-600' : ''}`}>
                    {game.white}
                    {winner === game.white && <span className="ml-2">🏆</span>}
                  </span>
                  <span className="text-gray-600">(White)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${winner === game.black ? 'text-xl text-green-600' : ''}`}>
                    {game.black}
                    {winner === game.black && <span className="ml-2">🏆</span>}
                  </span>
                  <span className="text-gray-600">(Black)</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Game Information</h2>
              <div className="space-y-2 text-gray-600">
                <div>Event: {game.event}</div>
                <div>Site: {game.site}</div>
                <div>Date: {new Date(game.date).toLocaleDateString()}</div>
                <div>Round: {game.round}</div>
                <div>Result: {game.result}</div>
                {game.termination && <div>Termination: {game.termination}</div>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Player Ratings</h2>
              <div className="space-y-2 text-gray-600">
                <div>{game.white}: {game.whiteElo}</div>
                <div>{game.black}: {game.blackElo}</div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Game Details</h2>
              <div className="space-y-2 text-gray-600">
                <div>Time Control: {game.timeControl}</div>
                <div>Total Moves: {game.moves.length}</div>
                {game.endTime && <div>End Time: {game.endTime}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AnalyzeButton game={game} />
        </div>

        <GameJsonViewer game={game} />
      </div>
    </div>
  );
}