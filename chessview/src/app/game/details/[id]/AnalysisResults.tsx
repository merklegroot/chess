'use client';

import { Chess } from 'chess.js';

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

export default function AnalysisResults({ analysis, game }: AnalysisResultsProps) {
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

  // Get opening information
  const chessGame = new Chess();
  const pgn = game.moves.join(' ');
  if (pgn) {
    chessGame.loadPgn(pgn);
  }
  const opening = chessGame.history({ verbose: true }).slice(0, 10); // Get first 10 moves for opening detection
  const openingMoves = opening.map(move => move.san).join(' ');
  
  // Common opening patterns
  const openings: { [key: string]: string } = {
    'e4 e5': 'Open Game',
    'e4 c5': 'Sicilian Defense',
    'e4 e6': 'French Defense',
    'e4 d6': 'Pirc Defense',
    'e4 d5': 'Scandinavian Defense',
    'd4 d5': 'Queen\'s Gambit',
    'd4 Nf6': 'Indian Defense',
    'd4 d6': 'Old Indian Defense',
    'c4 e5': 'English Opening',
    'Nf3 d5': 'Reti Opening',
    'b3 e5': 'Nimzo-Larsen Attack',
    'g3 d5': 'King\'s Indian Attack',
    'f4 d5': 'Bird\'s Opening',
    'e4 g6': 'Modern Defense',
    'd4 g6': 'King\'s Indian Defense',
    'c4 Nf6': 'English Opening',
    'Nf3 c5': 'Sicilian Defense',
    'e4 Nf6': 'Alekhine\'s Defense',
    'd4 e6': 'Queen\'s Indian Defense',
    'c4 e6': 'English Defense',
  };

  // Find the matching opening
  let detectedOpening = 'Unknown Opening';
  for (const [pattern, name] of Object.entries(openings)) {
    if (openingMoves.startsWith(pattern)) {
      detectedOpening = name;
      break;
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Analysis Results</h3>
      
      {/* Opening information */}
      <div className="mb-4 text-sm text-gray-600">
        Opening: {detectedOpening}
      </div>
      
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
          
          return (
            <div 
              key={index}
              className="p-2 rounded bg-white font-mono text-sm"
            >
              <div className="grid grid-cols-[3rem_1fr_1fr] gap-4 items-center">
                {/* Move number */}
                <span className="text-gray-500">{pair.whiteMove.moveNumber}.</span>
                
                {/* White's move */}
                <div className="flex items-center gap-2">
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
                </div>
                
                {/* Black's move */}
                {pair.blackMove && blackSymbol && (
                  <div className="flex items-center gap-2">
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