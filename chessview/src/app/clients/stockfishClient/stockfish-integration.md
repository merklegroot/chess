# Info about stockfish's communication protocol

## UCI Protocol Basics

Stockfish uses the Universal Chess Interface (UCI) protocol for communication. The protocol is text-based and follows a command-response pattern.

### Basic Commands

- `uci` - Initiates the UCI protocol. Stockfish responds with:
  - Engine identification (name, version)
  - Available options
  - "uciok" when ready

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

