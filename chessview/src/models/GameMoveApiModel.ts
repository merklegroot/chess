export interface GameMoveApiModel {
    number: number;
    isWhite: boolean;
    move: string;
    fenBefore: string;
    fenAfter: string;
}