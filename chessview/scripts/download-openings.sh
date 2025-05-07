#!/bin/bash

# Create the directory if it doesn't exist
mkdir -p data/chess-openings

# Download the TSV files
curl -o data/chess-openings/a.tsv https://raw.githubusercontent.com/lichess-org/chess-openings/master/a.tsv
curl -o data/chess-openings/b.tsv https://raw.githubusercontent.com/lichess-org/chess-openings/master/b.tsv
curl -o data/chess-openings/c.tsv https://raw.githubusercontent.com/lichess-org/chess-openings/master/c.tsv
curl -o data/chess-openings/d.tsv https://raw.githubusercontent.com/lichess-org/chess-openings/master/d.tsv
curl -o data/chess-openings/e.tsv https://raw.githubusercontent.com/lichess-org/chess-openings/master/e.tsv

echo "Downloaded chess openings data to data/chess-openings/" 