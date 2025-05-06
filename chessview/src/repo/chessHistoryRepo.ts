import { promises as fsPromises } from 'fs';
import { chessGameModel } from '../models';

const historyFile = 'data/chess_com_games_2025-05-06.pgn';

function parsePgnContents(contents: string): chessGameModel[] {
    throw new Error('Not implemented');
}

export const chessHistoryRepo = {
    listGames: async (): Promise<chessGameModel[]> => {
        const contents = (await fsPromises.readFile(historyFile, 'utf8')).toString();
        return parsePgnContents(contents);
    }
}