# Generates chess opening images
# This is mostly AI code.

import os
import shutil
from chess_image_generator import generate_opening_image

# Dictionary of opening positions (only white pieces)
openings = {
    "Ruy_Lopez_white": "8/8/8/1B2P3/8/5N2/PPPP1PPP/RNBQK2R w - - 0 1",
    "Italian_Game_white": "8/8/8/4P3/2B5/5N2/PPPP1PPP/RNBQK2R w - - 0 1",
    "Sicilian_Defense_white": "8/8/8/8/4P3/8/PPPP1PPP/RNBQKBNR w - - 0 1",
    "Queens_Gambit_white": "8/8/8/8/2PP4/8/PP2PPPP/RNBQKBNR w - - 0 1",
    "English_Opening_white": "8/8/8/8/2P5/8/PP1PPPPP/RNBQKBNR w - - 0 1"
}

image_path = "../chess_openings"

# Clean and recreate the output directory
if os.path.exists(image_path):
    shutil.rmtree(image_path)

os.makedirs(image_path)

# Generate images for each opening
for name, fen in openings.items():
    generate_opening_image(name, fen, image_path)

print("White-only images generated in the 'chess_openings' directory!")
