import { chessGameModel } from '@/models/chessGameModel';
import { analysisResult } from '@/models/analysisResult';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  async getGameById(id: string): Promise<chessGameModel> {
    const response = await fetch(`${baseUrl}/api/games/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch game');
    }

    const data = await response.json();
    return data.game;
  },

  async analyzeGame(id: string): Promise<analysisResult[]> {
    const response = await fetch(`${baseUrl}/api/games/${id}/analyze`, {
      method: 'POST',
      cache: 'no-store'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze game');
    }

    return response.json();
  }
}; 