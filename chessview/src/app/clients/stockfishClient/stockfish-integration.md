# Info about stockfish's communication protocol

The official documentation is at the link:
<https://official-stockfish.github.io/docs/stockfish-wiki/UCI-&-Commands.html>

## UCI Protocol Basics

Stockfish uses the Universal Chess Interface (UCI) protocol for communication. The protocol is text-based and follows a command-response pattern.

### Basic Commands

- `uci` - Initiates the UCI protocol. Stockfish responds with:
  - Engine identification (name, version)
  - Available options
  - "uciok" when ready

### Position Analysis

To analyze a position, you need to:
1. Set up the position
2. Start the analysis

#### Setting up a position:
```
position [fen <fenstring> | startpos ] moves <move1> ... <movei>
```

For example:
```
position startpos moves e2e4 e7e5
```

#### Starting analysis:
```
go [searchmoves <move1> ... <movei>] [ponder] [wtime <x>] [btime <x>] [winc <x>] [binc <x>] [movestogo <x>] [depth <x>] [nodes <x>] [movetime <x>] [infinite]
```

Common parameters:
- `depth <x>` - Search to depth x
- `movetime <x>` - Search for x milliseconds
- `infinite` - Search until stopped

Stockfish responds with:
- `info` lines containing search information
- `bestmove` when analysis is complete

Example response:
```json
{
  "type": "uci:response",
  "payload": "info depth 20 seldepth 25 multipv 1 score cp 45 nodes 1234567 nps 2500000 hashfull 100 tbhits 0 time 500 pv e2e4 e7e5 g1f3"
}
```

### Response Format

Our Stockfish server wraps UCI responses in JSON with the following structure:
```json
{
  "type": "uci:response",
  "payload": "Stockfish 15.1 by the Stockfish developers (see AUTHORS file)"
}
```

### Version Information

The engine version can be extracted from the UCI response using the pattern:
```
Stockfish (\d+\.\d+)
```

For example, from the response:
```
Stockfish 15.1 by the Stockfish developers (see AUTHORS file)
```
The version is "15.1"

## WebSocket Connection

- Server runs on `ws://localhost:8080`
- Connection is established when needed (no persistent connection)
- Responses are received asynchronously
- Connection should be closed after receiving the expected response

## Error Handling

- Connection timeouts after 5 seconds
- Invalid responses throw errors
- Missing version information throws errors
- WebSocket errors are propagated

