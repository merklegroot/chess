# Chess Openings Database

This directory contains chess opening data sourced from the [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings) repository.

## Data Format
The data is stored in TSV (tab-separated values) files, with the following columns:
- `eco`: ECO classification code
- `name`: Opening name in English
- `pgn`: Sequence of moves in PGN format
- `uci`: Same moves in UCI notation
- `epd`: Extended Position Description (FEN without move numbers)

## License
This data is released under the CC0-1.0 license (Public Domain). See the main project's [ATTRIBUTION.md](../../ATTRIBUTION.md) for more details.

## Usage
This data is used in our application for:
- Opening identification
- Move sequence analysis
- Opening name display
- Position evaluation

## Updates
The data should be updated periodically from the source repository to ensure we have the latest opening information and corrections. 