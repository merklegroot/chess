// this should match the data for an individual game in a pgn file

export interface chessGameModel {
    event: string;
    site: string;
    date: string;
    round: string;
    white: string;
    black: string;
    result: string;
    whiteElo: string;
    blackElo: string;
    timeControl: string;
    endTime: string;
    termination: string;
    moves: string[];
}