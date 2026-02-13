"""
WINi Bottle Image Processor
Removes backgrounds, normalizes to 400x800px, splits into left/right halves.
"""

from rembg import remove
from PIL import Image
import os
import sys

INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "wine-bottles")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "bottles", "processed")
TARGET_SIZE = (400, 800)

# Map original filenames -> clean output names
# Note: Pngtree files use em-dashes (—) not underscores
BOTTLE_MAP = {
    "\u2014Pngtree\u2014brown wine bottle illustration_4673479.png": "chardonnay",
    "\u2014Pngtree\u2014wine bottle_5987023.png": "silver-reserve",
    "lloyd-kearney-RycZY-SLefE-unsplash.jpg": "costieres-red",
    "arshla-jindal-JTPrf0at-6I-unsplash.jpg": "shiraz-cabernet",
    "mockup-free-I3vIA3CPU7o-unsplash.jpg": "red-label",
}

# This image contains TWO bottles side by side
PAIR_IMAGE = "mockup-free-kJp843ucZ1I-unsplash.jpg"


def process_bottle(input_path: str, output_name: str) -> None:
    """Remove background, resize to fit 400x800 canvas, split into halves."""
    print(f"  Loading {os.path.basename(input_path)}...")
    img = Image.open(input_path)

    # Convert to RGBA if needed
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    print(f"  Removing background...")
    img_nobg = remove(img)

    # Fit bottle into target canvas maintaining aspect ratio
    # Leave 20px padding on each side
    max_w = TARGET_SIZE[0] - 40
    max_h = TARGET_SIZE[1] - 40
    img_nobg.thumbnail((max_w, max_h), Image.LANCZOS)

    # Create transparent canvas and center the bottle
    canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    offset_x = (TARGET_SIZE[0] - img_nobg.width) // 2
    offset_y = (TARGET_SIZE[1] - img_nobg.height) // 2
    canvas.paste(img_nobg, (offset_x, offset_y), img_nobg)

    # Split into left and right halves
    mid = TARGET_SIZE[0] // 2
    left_half = canvas.crop((0, 0, mid, TARGET_SIZE[1]))
    right_half = canvas.crop((mid, 0, TARGET_SIZE[0], TARGET_SIZE[1]))

    # Save all three versions
    left_path = os.path.join(OUTPUT_DIR, f"{output_name}-left.png")
    right_path = os.path.join(OUTPUT_DIR, f"{output_name}-right.png")
    full_path = os.path.join(OUTPUT_DIR, f"{output_name}-full.png")

    left_half.save(left_path)
    right_half.save(right_path)
    canvas.save(full_path)
    print(f"  -> Saved {output_name}-left.png, {output_name}-right.png, {output_name}-full.png")


def process_pair_image(input_path: str) -> None:
    """Handle the two-bottle image: crop each bottle, then process individually."""
    print(f"\nProcessing pair image: {os.path.basename(input_path)}")
    img = Image.open(input_path)

    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # First remove background from the whole image
    print("  Removing background from pair...")
    img_nobg = remove(img)

    # Find the bounding boxes of each bottle by analyzing alpha channel
    # Split roughly at the center, but be smart about it
    w, h = img_nobg.size
    mid_x = w // 2

    # Crop left bottle (with some overlap margin)
    left_bottle = img_nobg.crop((0, 0, mid_x + 20, h))
    # Crop right bottle
    right_bottle = img_nobg.crop((mid_x - 20, 0, w, h))

    # Save temp files and process each
    temp_left = os.path.join(OUTPUT_DIR, "_temp_left.png")
    temp_right = os.path.join(OUTPUT_DIR, "_temp_right.png")

    left_bottle.save(temp_left)
    right_bottle.save(temp_right)

    # Process each bottle individually (background already removed)
    process_bottle_nobg(temp_left, "red-label-pair")
    process_bottle_nobg(temp_right, "gold-label")

    # Clean up temp files
    os.remove(temp_left)
    os.remove(temp_right)
    print(f"  -> Pair processed: red-label-pair + gold-label")


def process_bottle_nobg(input_path: str, output_name: str) -> None:
    """Process a bottle that already has background removed."""
    img = Image.open(input_path)
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # Trim transparent edges to find the actual bottle
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    # Fit into target canvas
    max_w = TARGET_SIZE[0] - 40
    max_h = TARGET_SIZE[1] - 40
    img.thumbnail((max_w, max_h), Image.LANCZOS)

    canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    offset_x = (TARGET_SIZE[0] - img.width) // 2
    offset_y = (TARGET_SIZE[1] - img.height) // 2
    canvas.paste(img, (offset_x, offset_y), img)

    mid = TARGET_SIZE[0] // 2
    left_half = canvas.crop((0, 0, mid, TARGET_SIZE[1]))
    right_half = canvas.crop((mid, 0, TARGET_SIZE[0], TARGET_SIZE[1]))

    left_half.save(os.path.join(OUTPUT_DIR, f"{output_name}-left.png"))
    right_half.save(os.path.join(OUTPUT_DIR, f"{output_name}-right.png"))
    canvas.save(os.path.join(OUTPUT_DIR, f"{output_name}-full.png"))
    print(f"  -> Saved {output_name}-left.png, {output_name}-right.png, {output_name}-full.png")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Input: {os.path.abspath(INPUT_DIR)}")
    print(f"Output: {os.path.abspath(OUTPUT_DIR)}")
    print(f"Target size: {TARGET_SIZE[0]}x{TARGET_SIZE[1]}px\n")

    # Process single-bottle images
    for filename, clean_name in BOTTLE_MAP.items():
        path = os.path.join(INPUT_DIR, filename)
        if os.path.exists(path):
            print(f"\nProcessing: {filename} -> {clean_name}")
            process_bottle(path, clean_name)
        else:
            print(f"\nWARNING: Not found: {filename}")
            # Try to find similar file
            for f in os.listdir(INPUT_DIR):
                if clean_name.split("-")[0].lower() in f.lower() or filename[-20:] in f:
                    print(f"  Did you mean: {f}?")

    # Process the pair image
    pair_path = os.path.join(INPUT_DIR, PAIR_IMAGE)
    if os.path.exists(pair_path):
        process_pair_image(pair_path)
    else:
        print(f"\nWARNING: Pair image not found: {PAIR_IMAGE}")

    print("\n--- Processing complete ---")
    processed = [f for f in os.listdir(OUTPUT_DIR) if f.endswith(".png") and not f.startswith("_")]
    print(f"Generated {len(processed)} images:")
    for f in sorted(processed):
        print(f"  {f}")


if __name__ == "__main__":
    main()
