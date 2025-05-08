type Piece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

const pieceSymbols: { [key: string]: { w: string, b: string } } = {
    'p': { w: '♙', b: '♟' },
    'n': { w: '♘', b: '♞' },
    'b': { w: '♗', b: '♝' },
    'r': { w: '♖', b: '♜' },
    'q': { w: '♕', b: '♛' },
    'k': { w: '♔', b: '♚' }
  };

function getPieceSymbol(piece: Piece, color: 'w' | 'b'): string {
    return pieceSymbols[piece][color];
}

export const pieceUtil = {
    getPieceSymbol
};