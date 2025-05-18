'use client';

import Link from 'next/link';
import AnalyzeButton from './AnalyzeButton';
import GameSummary from './GameSummary';
import GameMoves from './GameMoves';
import { apiClient } from '@/app/clients/apiClient/apiClient';
import { useEffect, useState, use } from 'react';
import { chessGameModel } from '@/models/chessGameModel';
import { GameDetailsResponse } from '@/app/api/game-details/[id]/route';
import { evalResult } from '@/models/evalResult';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface EvalResult extends evalResult {
  fen: string;
}

interface EvalCache {
  before: EvalResult | null;
  after: EvalResult | null;
}

export default function GameDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const [game, setGame] = useState<chessGameModel | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetailsResponse | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<Record<number, EvalCache>>({});
  const [isEvaluatingAll, setIsEvaluatingAll] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError(true);
        return;
      }

      try {
        // Fetch basic game data
        const gameData = await apiClient.getGameById(id);
        setGame(gameData);

        // Fetch detailed game data including evaluations
        const details = await apiClient.getGameDetails(id);
        setGameDetails(details);

        // Initialize eval cache from cached evaluations
        const initialEvalCache: Record<number, EvalCache> = {};
        Object.entries(details.evaluations).forEach(([fen, eval_]) => {
          const moveIndex = details.moves.findIndex(m => m.fenAfter === fen);
          if (moveIndex !== -1) {
            initialEvalCache[moveIndex] = {
              before: null,
              after: { ...eval_, fen }
            };
          }
        });
        setEvaluations(initialEvalCache);
      } catch (error) {
        console.error('Error fetching game data:', error);
        setError(true);
      }
    };

    fetchData();
  }, [id]);

  const handleEvaluatePosition = async (fen: string, type: 'before' | 'after', moveIndex: number, isWhite: boolean) => {
    try {
      const params = new URLSearchParams({
        gameId: id,
        fen,
        depth: '15',
        moveTime: '1000'
      });

      const response = await fetch(`/api/eval-cache?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get evaluation: ${response.statusText}`);
      }

      const evalResult = await response.json();
      const evalResultWithFen: EvalResult = {
        ...evalResult,
        fen
      };

      // Update evaluations state
      setEvaluations(prev => ({
        ...prev,
        [moveIndex]: {
          ...prev[moveIndex],
          [type]: evalResultWithFen
        }
      }));
    } catch (err) {
      console.error('Error getting evaluation:', err);
    }
  };

  const handleEvaluateAll = async () => {
    if (!gameDetails) return;

    setIsEvaluatingAll(true);
    const totalEvaluations = gameDetails.moves.length;
    setEvaluationProgress({ current: 0, total: totalEvaluations });

    try {
      for (let i = 0; i < gameDetails.moves.length; i++) {
        const move = gameDetails.moves[i];
        await handleEvaluatePosition(move.fenAfter, 'after', i, i % 2 === 0);
        setEvaluationProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
    } finally {
      setIsEvaluatingAll(false);
      setEvaluationProgress({ current: 0, total: 0 });
    }
  };

  const handleUpdateEvalCache = (moveIndex: number, type: 'before' | 'after', evalResult: EvalResult) => {
    setEvaluations(prev => ({
      ...prev,
      [moveIndex]: {
        ...prev[moveIndex],
        [type]: evalResult
      }
    }));
  };

  if (error) {
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

  if (!game || !gameDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  // Debug: Log the raw data
  console.log('gameDetails:', gameDetails);
  console.log('Raw evaluations:', gameDetails.evaluations);

  // Transform evaluations into the format expected by GameMoves
  const transformedEvaluations: Record<number, EvalCache> = {};
  Object.entries(gameDetails.evaluations).forEach(([key, eval_]) => {
    // The key format is "FEN_depth_moveTime", we just want the FEN part
    const fen = key.split('_')[0];
    
    // Find the move that resulted in this position
    const moveIndex = gameDetails.moves.findIndex(m => m.fenAfter === fen);
    if (moveIndex !== -1) {
      transformedEvaluations[moveIndex] = {
        before: null,
        after: { ...eval_, fen }
      };
    }
  });

  // Merge with any new evaluations
  const finalEvaluations = {
    ...transformedEvaluations,
    ...evaluations
  };

  console.log('Transformed evaluations:', finalEvaluations);

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
        <GameMoves 
          game={game} 
          processedMoves={gameDetails.moves}
          evaluations={finalEvaluations}
          isEvaluatingAll={isEvaluatingAll}
          evaluationProgress={evaluationProgress}
          onEvaluateAllPress={handleEvaluateAll}
          onEvaluatePosition={handleEvaluatePosition}
          onUpdateEvalCache={handleUpdateEvalCache}
        />

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