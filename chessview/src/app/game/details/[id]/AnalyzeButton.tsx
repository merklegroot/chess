'use client';

import { useState } from 'react';
import AnalysisResults from './AnalysisResults';
import { chessGameModel } from '@/models/chessGameModel';
import { apiClient } from '@/api/apiClient';
import { useParams } from 'next/navigation';

interface AnalyzeButtonProps {
  game: chessGameModel;
}

export default function AnalyzeButton({ game }: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      const results = await apiClient.analyzeGame(params.id as string);
      setAnalysis(results);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <button
        className={`${
          isAnalyzing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-medium py-2 px-4 rounded-lg transition-colors`}
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Game'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      
      {analysis && <AnalysisResults analysis={analysis} game={game} />}
    </div>
  );
} 