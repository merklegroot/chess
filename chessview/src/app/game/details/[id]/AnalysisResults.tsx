'use client';

import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/ChessBoard';

interface AnalysisResult {
  moveNumber: number;
  move: string;
  evaluation: number;
  bestMove: string;
  isBlunder: boolean;
  bookMoves: string[];
}

interface AnalysisResultsProps {
  analysis: AnalysisResult[];
  game: {
    moves: string[];
    white: string;
    black: string;
  };
}

export default function AnalysisResults({ analysis, game }: AnalysisResultsProps) {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
  const [currentFen, setCurrentFen] = useState<string>('');
  const [openingCache, setOpeningCache] = useState<Record<string, string>>({});

  const handleMoveClick = (moveIndex: number) => {
    setSelectedMoveIndex(moveIndex);
    const chessGame = new Chess();
    const moves = game.moves.slice(0, moveIndex + 1);
    if (moves.length > 0) {
      chessGame.loadPgn(moves.join(' '));
      setCurrentFen(chessGame.fen());
    }
  };

  const getLastMove = (moveIndex: number) => {
    if (moveIndex < 0 || moveIndex >= game.moves.length) return undefined;
    const chessGame = new Chess();
    const moves = game.moves.slice(0, moveIndex + 1);
    if (moves.length > 0) {
      chessGame.loadPgn(moves.join(' '));
      const lastMove = chessGame.history({ verbose: true }).pop();
      if (lastMove) {
        return lastMove.from + lastMove.to;
      }
    }
    return undefined;
  };

  const getOpeningAtMove = useCallback(async (moveIndex: number) => {
    const moves = game.moves.slice(0, moveIndex + 1);
    const pgn = moves.join(' ');
    
    // Check cache first
    if (openingCache[pgn]) {
      return openingCache[pgn];
    }

    try {
      const response = await fetch('/api/openings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pgn }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch opening');
      }

      const data = await response.json();
      const openingName = data.openings.length > 0 ? data.openings[0].name : '';
      
      // Update cache
      setOpeningCache(prev => ({
        ...prev,
        [pgn]: openingName
      }));

      return openingName;
    } catch (error) {
      console.error('Error fetching opening:', error);
      return '';
    }
  }, [game.moves, openingCache]);

  const getPieceSymbol = (move: string, chessGame: Chess, moveIndex: number) => {
    try {
      // Load the game state up to this move
      const pgn = game.moves.slice(0, moveIndex).join(' ');
      if (pgn) {
        chessGame.loadPgn(pgn);
      }
      
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

  // Group moves into pairs (white and black)
  const movePairs = [];
  for (let i = 0; i < analysis.length; i += 2) {
    const whiteMove = analysis[i];
    const blackMove = analysis[i + 1];
    movePairs.push({ whiteMove, blackMove });
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Analysis Results</h3>
      
      {/* Opening information */}
      <div className="mb-4 text-sm text-gray-600">
        Opening: {openingCache[game.moves.join(' ')] || 'Loading...'}
      </div>

      {/* Chess board */}
      {selectedMoveIndex !== null && (
        <div className="mb-4">
          <ChessBoard 
            fen={currentFen} 
            width={300} 
            lastMove={getLastMove(selectedMoveIndex)}
          />
        </div>
      )}
      
      {/* Column headers */}
      <div className="grid grid-cols-[3rem_1fr_1fr] gap-4 mb-2 px-2">
        <div></div> {/* Empty cell for move number column */}
        <div className="text-sm font-medium text-gray-700">{game.white}</div>
        <div className="text-sm font-medium text-gray-700">{game.black}</div>
      </div>
      
      <div className="space-y-1">
        {movePairs.map((pair, index) => {
          const chessGame = new Chess();
          
          const whiteSymbol = getPieceSymbol(pair.whiteMove.move, chessGame, index * 2);
          const blackSymbol = pair.blackMove ? getPieceSymbol(pair.blackMove.move, chessGame, index * 2 + 1) : null;
          
          const whitePgn = game.moves.slice(0, index * 2 + 1).join(' ');
          const blackPgn = pair.blackMove ? game.moves.slice(0, index * 2 + 2).join(' ') : '';
          
          return (
            <div 
              key={index}
              className="p-2 rounded bg-white font-mono text-sm"
            >
              <div className="grid grid-cols-[3rem_1fr_1fr] gap-4 items-center">
                {/* Move number */}
                <span className="text-gray-500">{pair.whiteMove.moveNumber}.</span>
                
                {/* White's move */}
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                  onClick={() => handleMoveClick(index * 2)}
                >
                  <span className={`inline-block w-6 text-center ${whiteSymbol.color === 'w' ? 'text-gray-800' : 'text-gray-600'}`}>
                    {whiteSymbol.symbol}
                  </span>
                  <span className="w-16">{pair.whiteMove.move}</span>
                  {pair.whiteMove.isBlunder && (
                    <span className="text-red-600">⚠️</span>
                  )}
                  <span className={`w-16 text-right ${pair.whiteMove.evaluation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pair.whiteMove.evaluation > 0 ? '+' : ''}{pair.whiteMove.evaluation.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{openingCache[whitePgn] || 'Loading...'}</span>
                </div>
                
                {/* Black's move */}
                {pair.blackMove && blackSymbol && (
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onClick={() => handleMoveClick(index * 2 + 1)}
                  >
                    <span className={`inline-block w-6 text-center ${blackSymbol.color === 'w' ? 'text-gray-800' : 'text-gray-600'}`}>
                      {blackSymbol.symbol}
                    </span>
                    <span className="w-16">{pair.blackMove.move}</span>
                    {pair.blackMove.isBlunder && (
                      <span className="text-red-600">⚠️</span>
                    )}
                    <span className={`w-16 text-right ${pair.blackMove.evaluation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pair.blackMove.evaluation > 0 ? '+' : ''}{pair.blackMove.evaluation.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{openingCache[blackPgn] || 'Loading...'}</span>
                  </div>
                )}
              </div>
              
              {/* Blunder information */}
              {(pair.whiteMove.isBlunder || (pair.blackMove && pair.blackMove.isBlunder)) && (
                <div className="text-xs text-gray-600 mt-1 ml-12">
                  {pair.whiteMove.isBlunder && (
                    <div>Best: {pair.whiteMove.bestMove}</div>
                  )}
                  {pair.blackMove?.isBlunder && (
                    <div>Best: {pair.blackMove.bestMove}</div>
                  )}
                </div>
              )}
              
              {/* Book moves information */}
              {(pair.whiteMove.bookMoves?.length > 0 || (pair.blackMove && pair.blackMove.bookMoves?.length > 0)) && (
                <div className="text-xs text-blue-600 mt-1 ml-12">
                  {pair.whiteMove.bookMoves?.length > 0 && (
                    <div>Book: {pair.whiteMove.bookMoves.join(', ')}</div>
                  )}
                  {pair.blackMove?.bookMoves?.length > 0 && (
                    <div>Book: {pair.blackMove.bookMoves.join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 