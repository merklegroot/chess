import chess
import chess.svg
import cairosvg
from xml.etree import ElementTree as ET

def generate_opening_image(name, fen, output_dir="chess_openings"):
    """
    Generate an SVG and PNG image for a chess opening position.
    
    Args:
        name (str): Name of the opening (used for filename)
        fen (str): FEN string representing the position
        output_dir (str): Directory to save the images
    """
    # Create board from FEN
    board = chess.Board(fen)
    
    # Find the highest rank (1-8) where white has a piece
    highest_rank = 1
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece and piece.color == chess.WHITE:
            rank = chess.square_rank(square) + 1  # Convert 0-7 to 1-8
            highest_rank = max(highest_rank, rank)
    
    # Generate SVG
    svg_board = chess.svg.board(
        board,
        size=400,
        coordinates=True,
        orientation=chess.WHITE  # Ensure board is oriented from White's perspective
    )
    
    # Parse the SVG to modify it
    root = ET.fromstring(svg_board)
    
    # Calculate how much of the board to show based on highest white piece
    # Each rank is 50 pixels (400px / 8 ranks)
    pixels_per_rank = 400 / 8
    
    # Add one rank above the highest piece for better visibility
    visible_ranks = min(highest_rank + 1, 8)
    
    # Calculate the y-coordinate for the viewBox (from bottom)
    # For example, if highest_rank is 5, we want to show ranks 1-5 plus one extra
    # So we'd show 6 ranks out of 8, starting at y=100 (skipping ranks 7-8)
    y_start = 400 - (visible_ranks * pixels_per_rank)
    height = visible_ranks * pixels_per_rank
    
    # Set the new viewBox
    root.set('viewBox', f'0 {y_start} 400 {height}')
    root.set('height', str(height))
    
    # Convert back to string
    modified_svg = ET.tostring(root, encoding='unicode')
    
    # Save as SVG
    svg_path = f"{output_dir}/{name}.svg"
    with open(svg_path, "w") as f:
        f.write(modified_svg)
    
    # Convert to PNG
    png_path = f"{output_dir}/{name}.png"
    cairosvg.svg2png(bytestring=modified_svg.encode('utf-8'), write_to=png_path) 