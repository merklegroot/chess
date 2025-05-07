'use client';

import { useState } from 'react';
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
  game: any; // TODO: Type this properly
}

// Comprehensive opening database
const openings: { [key: string]: string } = {
  // First moves
  'e4': 'King\'s Pawn Game',
  'd4': 'Queen\'s Pawn Game',
  'c4': 'English Opening',
  'Nf3': 'Reti Opening',
  'b3': 'Nimzo-Larsen Attack',
  'g3': 'King\'s Indian Attack',
  'f4': 'Bird\'s Opening',
  
  // King's Pawn responses
  'e4 e5': 'Open Game',
  'e4 c5': 'Sicilian Defense',
  'e4 e6': 'French Defense',
  'e4 d6': 'Pirc Defense',
  'e4 d5': 'Scandinavian Defense',
  'e4 g6': 'Modern Defense',
  'e4 Nf6': 'Alekhine\'s Defense',
  
  // Queen's Pawn responses
  'd4 d5': 'Queen\'s Gambit',
  'd4 Nf6': 'Indian Defense',
  'd4 d6': 'Old Indian Defense',
  'd4 g6': 'King\'s Indian Defense',
  'd4 e6': 'Queen\'s Indian Defense',
  
  // Open Game continuations
  'e4 e5 Nf3': 'King\'s Knight Opening',
  'e4 e5 Bc4': 'Bishop\'s Opening',
  'e4 e5 d4': 'Center Game',
  'e4 e5 f4': 'King\'s Gambit',
  
  // Ruy Lopez and variations
  'e4 e5 Nf3 Nc6 Bb5': 'Ruy Lopez',
  'e4 e5 Nf3 Nc6 Bb5 a6': 'Ruy Lopez, Morphy Defense',
  'e4 e5 Nf3 Nc6 Bb5 d6': 'Ruy Lopez, Steinitz Defense',
  'e4 e5 Nf3 Nc6 Bb5 Nf6': 'Ruy Lopez, Berlin Defense',
  'e4 e5 Nf3 Nc6 Bb5 f5': 'Ruy Lopez, Schliemann Defense',
  'e4 e5 Nf3 Nc6 Bb5 Bc5': 'Ruy Lopez, Classical Defense',
  'e4 e5 Nf3 Nc6 Bb5 d5': 'Ruy Lopez, Open Defense',
  
  // Italian Game and variations
  'e4 e5 Nf3 Nc6 Bc4': 'Italian Game',
  'e4 e5 Nf3 Nc6 Bc4 Bc5': 'Italian Game, Giuoco Piano',
  'e4 e5 Nf3 Nc6 Bc4 Bc5 b4': 'Italian Game, Evans Gambit',
  'e4 e5 Nf3 Nc6 Bc4 Nf6': 'Italian Game, Two Knights Defense',
  
  // Scotch Game
  'e4 e5 Nf3 Nc6 d4': 'Scotch Game',
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4': 'Scotch Game, Classical Variation',
  
  // Other common openings
  'c4 e5': 'English Opening',
  'Nf3 d5': 'Reti Opening',
  'b3 e5': 'Nimzo-Larsen Attack',
  'g3 d5': 'King\'s Indian Attack',
  'f4 d5': 'Bird\'s Opening',
};

export default function AnalysisResults({ analysis, game }: AnalysisResultsProps) {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
  const [currentFen, setCurrentFen] = useState<string>('');

  const handleMoveClick = (moveIndex: number) => {
    setSelectedMoveIndex(moveIndex);
    const chessGame = new Chess();
    const moves = game.moves.slice(0, moveIndex + 1);
    if (moves.length > 0) {
      chessGame.loadPgn(moves.join(' '));
      setCurrentFen(chessGame.fen());
    }
  };

  const getOpeningAtMove = (moveIndex: number): string => {
    const chessGame = new Chess();
    const moves = game.moves.slice(0, moveIndex + 1);
    if (moves.length > 0) {
      chessGame.loadPgn(moves.join(' '));
    }
    const history = chessGame.history({ verbose: true });
    const moveSequence = history.map(move => move.san).join(' ');
    
    // Find the longest matching opening
    let longestMatch = '';
    let longestMatchName = '';
    
    for (const [pattern, name] of Object.entries(openings)) {
      if (moveSequence.startsWith(pattern) && pattern.length > longestMatch.length) {
        longestMatch = pattern;
        longestMatchName = name;
      }
    }
    
    return longestMatchName || 'Unknown Opening';
  };

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
        Opening: {getOpeningAtMove(game.moves.length - 1)}
      </div>

      {/* Chess board */}
      {selectedMoveIndex !== null && (
        <div className="mb-4">
          <ChessBoard fen={currentFen} width={300} />
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
          
          const whiteOpening = getOpeningAtMove(index * 2);
          const blackOpening = pair.blackMove ? getOpeningAtMove(index * 2 + 1) : null;
          
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
                  <span className="text-xs text-gray-500 ml-2">{whiteOpening}</span>
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
                    <span className="text-xs text-gray-500 ml-2">{blackOpening}</span>
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