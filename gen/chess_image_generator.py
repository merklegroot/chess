import chess
import chess.svg
import cairosvg
from xml.etree import ElementTree as ET
import io

def generate_opening_image(name, fen, output_dir):
    """
    Generate an SVG and PNG image with the board and a semi-transparent overlay.
    
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
    
    # Use exactly the highest rank without adding an extra one
    visible_ranks = highest_rank
    
    print(f"{name}: Drawing board with overlay, showing {visible_ranks} ranks")
    
    # Create a starting position board to identify unmoved pieces
    starting_board = chess.Board()
    
    # Create a new board with only unmoved pieces
    unmoved_board = chess.Board(None)  # Empty board
    
    # Create a new board with only moved pieces
    moved_board = chess.Board(None)  # Empty board
    
    # Count moved and unmoved pieces
    unmoved_count = 0
    moved_count = 0
    
    # Find pieces that haven't moved from their starting positions
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece and piece.color == chess.WHITE:
            starting_piece = starting_board.piece_at(square)
            if starting_piece and starting_piece.piece_type == piece.piece_type and starting_piece.color == piece.color:
                # This piece hasn't moved, add it to the unmoved board
                unmoved_board.set_piece_at(square, piece)
                unmoved_count += 1
                print(f"  Unmoved piece: {piece.symbol()} at {chess.square_name(square)}")
            else:
                # This piece has moved, add it to the moved board
                moved_board.set_piece_at(square, piece)
                moved_count += 1
                print(f"  Moved piece: {piece.symbol()} at {chess.square_name(square)}")
    
    print(f"  Total: {unmoved_count} unmoved pieces, {moved_count} moved pieces")
    
    # Generate SVG with the empty board (no pieces)
    svg_board = chess.svg.board(
        chess.Board(None),  # Empty board
        size=400,
        coordinates=True,
        orientation=chess.WHITE
    )
    
    # Parse the SVG to modify it
    root = ET.fromstring(svg_board)
    
    # Calculate how much of the board to show based on highest white piece
    pixels_per_rank = 400 / 8
    y_start = 400 - (visible_ranks * pixels_per_rank)
    height = visible_ranks * pixels_per_rank
    
    # Set the new viewBox
    root.set('viewBox', f'0 {y_start} 400 {height}')
    root.set('height', str(height))
    
    # Generate SVG with only the unmoved pieces (no board)
    unmoved_svg = chess.svg.board(
        unmoved_board,
        size=400,
        coordinates=False,
        orientation=chess.WHITE,
        colors={'square light': 'rgba(0,0,0,0)', 'square dark': 'rgba(0,0,0,0)'}  # Transparent squares
    )
    unmoved_root = ET.fromstring(unmoved_svg)
    
    # Extract only the piece elements from the unmoved pieces SVG
    for element in unmoved_root.findall(".//*[@class='piece']"):
        # Add each unmoved piece to our main SVG
        root.append(element)
    
    # Create a semi-transparent gray overlay rectangle
    overlay = ET.Element('rect')
    overlay.set('x', '0')
    overlay.set('y', str(y_start))
    overlay.set('width', '400')
    overlay.set('height', str(height))
    overlay.set('fill', '#808080')  # Gray color
    overlay.set('opacity', '0.75')  # 75% opacity
    
    # Add the overlay
    root.append(overlay)
    
    # Generate SVG with only the moved pieces (no board)
    moved_svg = chess.svg.board(
        moved_board,
        size=400,
        coordinates=False,
        orientation=chess.WHITE,
        colors={'square light': 'rgba(0,0,0,0)', 'square dark': 'rgba(0,0,0,0)'}  # Transparent squares
    )
    moved_root = ET.fromstring(moved_svg)
    
    # Extract only the piece elements from the moved pieces SVG
    moved_piece_count = 0
    for element in moved_root.findall(".//*[@class='piece']"):
        # Add each moved piece to our main SVG, on top of the overlay
        root.append(element)
        moved_piece_count += 1
    
    print(f"  Added {moved_piece_count} moved piece elements to SVG")
    
    # Convert back to string
    modified_svg = ET.tostring(root, encoding='unicode')
    
    # Save as SVG
    svg_path = f"{output_dir}/{name}.svg"
    with open(svg_path, "w") as f:
        f.write(modified_svg)
    
    # Convert to PNG
    png_path = f"{output_dir}/{name}.png"
    cairosvg.svg2png(bytestring=modified_svg.encode('utf-8'), write_to=png_path)