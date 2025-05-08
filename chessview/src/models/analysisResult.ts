export interface analysisResult {
    moveNumber: number;
    move: string;
    evaluation: number;
    bestMove: string;
    isBlunder: boolean;
    bookMoves: string[]; // List of book moves at this position
}
