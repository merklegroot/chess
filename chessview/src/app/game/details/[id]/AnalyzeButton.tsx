'use client';

import { useState } from 'react';
import { ChessEngineService } from '@/services/chessEngine';
import { Chess } from 'chess.js';

interface AnalyzeButtonProps {
  gameId: string;
  game: any; // TODO: Type this properly
}

export default function AnalyzeButton({ gameId, game }: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Create a new Chess instance and load the moves
      const chessGame = new Chess();
      
      // Load the game using PGN format
      const pgn = game.moves.join(' ');
      try {
        chessGame.loadPgn(pgn);
      } catch (e) {
        console.error('Failed to load PGN:', e);
        throw new Error('Failed to load game moves');
      }
      
      const engine = new ChessEngineService();
      const results = await engine.analyzeGame(chessGame);
      setAnalysis(results);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPieceSymbol = (move: string, chessGame: Chess) => {
    try {
      const moveObj = chessGame.move(move);
      if (moveObj) {
        const piece = moveObj.piece;
        const color = moveObj.color;
        chessGame.undo(); // Undo the move to maintain the game state
        
        // Map piece types to symbols for both colors
        const pieceSymbols: { [key: string]: { w: string, b: string } } = {
          'p': { w: '♙', b: '♟' },
          'n': { w: '♘', b: '♞' },
          'b': { w: '♗', b: '♝' },
          'r': { w: '♖', b: '♜' },
          'q': { w: '♕', b: '♛' },
          'k': { w: '♔', b: '♚' }
        };
        
        return {
          symbol: pieceSymbols[piece]?.[color] || piece,
          color: color
        };
      }
    } catch (e) {
      console.error('Error getting piece symbol:', e);
    }
    return { symbol: '?', color: 'w' };
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
      
      {analysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Analysis Results</h3>
          <div className="space-y-2">
            {analysis.map((result: any, index: number) => {
              const chessGame = new Chess();
              const pgn = game.moves.slice(0, index).join(' ');
              if (pgn) {
                chessGame.loadPgn(pgn);
              }
              const { symbol, color } = getPieceSymbol(result.move, chessGame);
              
              return (
                <div 
                  key={index}
                  className={`p-2 rounded ${
                    result.isBlunder ? 'bg-red-100' : 'bg-white'
                  }`}
                >
                  <div className="font-mono flex items-center justify-between">
                    <span>
                      {result.moveNumber}.{' '}
                      <span className={`inline-block w-6 text-center ${color === 'w' ? 'text-gray-800' : 'text-gray-600'}`}>
                        {symbol}
                      </span>{' '}
                      {result.move}
                      {result.isBlunder && (
                        <span className="ml-2 text-red-600">⚠️ Blunder</span>
                      )}
                    </span>
                    <span className={`text-sm ${result.evaluation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.evaluation > 0 ? '+' : ''}{result.evaluation.toFixed(2)}
                    </span>
                  </div>
                  {result.isBlunder && (
                    <div className="text-sm text-gray-600 mt-1">
                      Best move: {result.bestMove}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 