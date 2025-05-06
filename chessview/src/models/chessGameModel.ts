// this should match the data for an individual game in a pgn file

/*
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2025.04.12"]
[Round "-"]
[White "dorkdorkgoose"]
[Black "omar11991199"]
[Result "0-1"]
[WhiteElo "618"]
[BlackElo "622"]
[TimeControl "600"]
[EndTime "14:46:20 GMT+0000"]
[Termination "omar11991199 won by resignation"]

1. e4 {[%clk 0:09:59.8]} 1... e5 {[%clk 0:09:59]} 2. Nf3 {[%clk 0:09:58.6]} 2...
Nc6 {[%clk 0:09:56.8]} 3. Bb5 {[%clk 0:09:57.1]} 3... Nf6 {[%clk 0:09:50.1]} 4.
Bxc6 {[%clk 0:09:54]} 4... bxc6 {[%clk 0:09:41]} 5. O-O {[%clk 0:09:46.6]} 5...
Nxe4 {[%clk 0:09:36.7]} 6. Nxe5 {[%clk 0:09:44.6]} 6... Bc5 {[%clk 0:09:34.1]}
7. d3 {[%clk 0:09:33.5]} 7... Nxf2 {[%clk 0:09:31.7]} 8. Rxf2 {[%clk 0:09:32.4]}
8... Bxf2+ {[%clk 0:09:30.8]} 9. Kxf2 {[%clk 0:09:30.8]} 9... Qh4+ {[%clk
0:09:28.7]} 10. g3 {[%clk 0:09:28.6]} 10... Qxh2+ {[%clk 0:09:25.1]} 11. Kf3
{[%clk 0:09:24.1]} 11... d6 {[%clk 0:09:22.2]} 12. Ng4 {[%clk 0:09:12.8]} 12...
Qh3 {[%clk 0:09:14.7]} 13. Be3 {[%clk 0:09:10]} 13... Bxg4+ {[%clk 0:09:13.2]}
14. Kf4 {[%clk 0:09:06.2]} 14... Bxd1 {[%clk 0:09:12.4]} 0-1
*/

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