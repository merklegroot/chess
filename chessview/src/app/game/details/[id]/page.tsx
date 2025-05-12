import Link from 'next/link';
import AnalyzeButton from './AnalyzeButton';
import GameSummary from './GameSummary';
import GameMoves from './GameMoves';
import { apiClient } from '@/app/clients/apiClient/apiClient';

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/game/list" className="text-blue-600 hover:text-blue-800">
          ← Back to Games
        </Link>
      </div>

      <div className="space-y-6">
        {/* Game Summary */}
        <GameSummary game={game} />

        {/* Game Moves */}
        <GameMoves game={game} />

        {/* Game Analysis */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Game Analysis</h2>
          <AnalyzeButton game={game} />
        </div>

        {/* Additional Game Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Event</div>
              <div className="font-medium">{game.event}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Site</div>
              <div className="font-medium">{game.site}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Round</div>
              <div className="font-medium">{game.round || 'Not specified'}</div>
            </div>
            {game.termination && (
              <div>
                <div className="text-gray-600 mb-1">Termination</div>
                <div className="font-medium">{game.termination}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}