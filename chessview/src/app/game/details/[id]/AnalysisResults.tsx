'use client';

import { Chess } from 'chess.js';

interface AnalysisResult {
  moveNumber: number;
  move: string;
  evaluation: number;
  bestMove: string;
  isBlunder: boolean;
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

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Analysis Results</h3>
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
            </div>
          );
        })}
      </div>
    </div>
  );
} 