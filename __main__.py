import chess
import chess.svg
import cairosvg
import os
import shutil

# Dictionary of opening positions (only white pieces)
openings = {
    "Ruy_Lopez_white": "8/8/8/1B2P3/8/5N2/PPPP1PPP/RNBQK2R w - - 0 1",
    "Italian_Game_white": "8/8/8/4P3/2B5/5N2/PPPP1PPP/RNBQK2R w - - 0 1",
    "Sicilian_Defense_white": "8/8/8/8/4P3/8/PPPP1PPP/RNBQKBNR w - - 0 1",
    "Queens_Gambit_white": "8/8/8/8/2PP4/8/PP2PPPP/RNBQKBNR w - - 0 1",
    "English_Opening_white": "8/8/8/8/2P5/8/PP1PPPPP/RNBQKBNR w - - 0 1"
}

# Clean and recreate the output directory
if os.path.exists("chess_openings"):
    shutil.rmtree("chess_openings")
os.makedirs("chess_openings")

# Generate images for each opening
for name, fen in openings.items():
    # Create board from FEN
    board = chess.Board(fen)
    
    # Generate SVG
    svg_board = chess.svg.board(
        board,
        size=400,
        coordinates=True,
        orientation=chess.WHITE  # Ensure board is oriented from White's perspective
    )
    
    # Save as SVG
    svg_path = f"chess_openings/{name}.svg"
    with open(svg_path, "w") as f:
        f.write(svg_board)
    
    # Convert to PNG
    png_path = f"chess_openings/{name}.png"
    cairosvg.svg2png(bytestring=svg_board.encode('utf-8'), write_to=png_path)

print("White-only images generated in the 'chess_openings' directory!")