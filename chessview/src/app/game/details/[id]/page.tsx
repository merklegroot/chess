import Link from 'next/link';
import AnalyzeButton from './AnalyzeButton';
import GameSummary from './GameSummary';
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
      </div>
    </div>
  );
}