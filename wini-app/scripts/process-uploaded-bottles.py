"""Process uploaded bottle images into normalized 400x800 transparent PNGs.

Handles:
- Single-bottle PNGs: rembg background removal + normalize
- Multi-bottle JPGs/PNGs: rembg + column-split into individual bottles + normalize

Dependencies: pip install rembg[cpu] Pillow numpy
"""
import sys
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
    from rembg import remove
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Run: pip install rembg[cpu] Pillow numpy")
    sys.exit(1)

ROOT = Path("C:/Dev/Wini/wini-app")
NORM_DIR = ROOT / "public" / "bottles" / "normalized"

CANVAS_W, CANVAS_H = 400, 800
TARGET_FILL = 0.72
ALPHA_THRESHOLD = 10
MIN_BOTTLE_WIDTH = 30  # minimum pixel width to consider a split region a bottle

# ── Single-bottle files: { source_filename: output_slug } ──
SINGLES = {
    "Colheita.png": "colheita",
    "Cotes du Rhone Villages.png": "cotes-du-rhone-villages",
    "dolcito pasti.png": "dolcetto-dasti",
    "minarete.png": "minarete",
    "yarra valley.png": "yarra-valley-pinot-noir",
    "hj Fabre.png": "hj-fabre-malbec",
    "Rodolfo Sadler.png": "rodolfo-sadler-malbec",
}

# ── Multi-bottle files: { source_filename: [list of output slugs, left to right] } ──
MULTIS = {
    "81awneusjhl._ac_sl1500_.jpg": [
        "telegraph-road",
        "auction-house-chardonnay",
        "joey-brown",
    ],
    "white-half-bottle-wine-case-2.jpg": [
        "el-coto-blanco",
        "gavi-di-gavi",
        "kim-crawford",
        "dandelion-riesling",
        "perrin-cdr-reserve",
        "cannonball-chardonnay",
    ],
    "Screenshot 2026-02-11 132056.png": [
        "blason-dargent",
        "delamotte",
        "gobillard",
        "alfred-gratien",
        "cazals",
    ],
    "Screenshot 2026-02-11 132111.png": [
        "hattingley-reserve",
        "hattingley-rose",
        "hattingley-blanc-de-blancs",
    ],
    "Screenshot 2026-02-11 132219.png": [
        "moet-brut-imperial",
        "moet-rose-imperial",
    ],
}

# Skip list (duplicates)
SKIP = {"Screenshot 2026-02-11 132024.png"}


def clean_alpha(img: Image.Image, threshold: int = ALPHA_THRESHOLD) -> Image.Image:
    """Zero out near-transparent pixels."""
    arr = np.array(img)
    mask = arr[:, :, 3] < threshold
    arr[mask] = [0, 0, 0, 0]
    return Image.fromarray(arr)


def normalize_bottle(img: Image.Image) -> Image.Image:
    """Center bottle on 400x800 canvas at ~72% fill."""
    bbox = img.getbbox()
    if not bbox:
        raise ValueError("Image is empty after processing")

    cropped = img.crop(bbox)
    cw, ch = cropped.size

    target_h = int(CANVAS_H * TARGET_FILL)
    scale = target_h / ch
    new_w = int(cw * scale)
    new_h = target_h

    if new_w > CANVAS_W:
        scale_w = CANVAS_W / cw
        new_w = CANVAS_W
        new_h = int(ch * scale_w)

    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    paste_x = (CANVAS_W - new_w) // 2
    paste_y = (CANVAS_H - new_h) // 2
    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas


def split_bottles(img: Image.Image, expected_count: int) -> list[Image.Image]:
    """Split a multi-bottle image into individual bottles by finding vertical gaps."""
    arr = np.array(img)
    alpha = arr[:, :, 3]

    # Column presence: sum of alpha per column
    col_sum = alpha.sum(axis=0)

    # Threshold: columns with very little content are "gaps"
    threshold = col_sum.max() * 0.02
    is_content = col_sum > threshold

    # Find contiguous content regions
    regions = []
    in_region = False
    start = 0
    for x in range(len(is_content)):
        if is_content[x] and not in_region:
            start = x
            in_region = True
        elif not is_content[x] and in_region:
            if x - start >= MIN_BOTTLE_WIDTH:
                regions.append((start, x))
            in_region = False
    if in_region and len(is_content) - start >= MIN_BOTTLE_WIDTH:
        regions.append((start, len(is_content)))

    print(f"    Found {len(regions)} content regions (expected {expected_count})")

    # If we found more regions than expected, merge the smallest gaps
    while len(regions) > expected_count and len(regions) > 1:
        # Find the smallest gap between adjacent regions
        min_gap = float("inf")
        min_idx = 0
        for i in range(len(regions) - 1):
            gap = regions[i + 1][0] - regions[i][1]
            if gap < min_gap:
                min_gap = gap
                min_idx = i
        # Merge regions[min_idx] and regions[min_idx + 1]
        merged = (regions[min_idx][0], regions[min_idx + 1][1])
        regions = regions[:min_idx] + [merged] + regions[min_idx + 2 :]

    # If we found fewer regions than expected, try splitting the widest regions
    while len(regions) < expected_count:
        # Find the widest region
        widths = [(r[1] - r[0], i) for i, r in enumerate(regions)]
        widths.sort(reverse=True)
        widest_idx = widths[0][1]
        r = regions[widest_idx]
        mid = (r[0] + r[1]) // 2
        # Split at midpoint
        left = (r[0], mid)
        right = (mid, r[1])
        regions = regions[:widest_idx] + [left, right] + regions[widest_idx + 1 :]

    # Crop each region
    bottles = []
    h = img.height
    for x_start, x_end in regions:
        # Find vertical bounds for this column range
        region_alpha = alpha[:, x_start:x_end]
        row_sum = region_alpha.sum(axis=1)
        row_thresh = row_sum.max() * 0.01
        rows_with_content = np.where(row_sum > row_thresh)[0]
        if len(rows_with_content) == 0:
            continue
        y_start = max(0, rows_with_content[0] - 5)
        y_end = min(h, rows_with_content[-1] + 5)
        crop = img.crop((x_start, y_start, x_end, y_end))
        bottles.append(crop)

    return bottles


def process_single(filename: str, slug: str) -> bool:
    """Process a single-bottle image."""
    src = NORM_DIR / filename
    out = NORM_DIR / f"{slug}-full.png"

    if out.exists():
        print(f"  SKIP {slug} — already exists")
        return True

    if not src.exists():
        print(f"  SKIP {filename} — source not found")
        return False

    print(f"  Processing {filename} -> {slug}-full.png ...")
    img = Image.open(src).convert("RGBA")
    print(f"    Original: {img.size}")

    img_nobg = remove(img)
    print("    Background removed")

    img_clean = clean_alpha(img_nobg)
    result = normalize_bottle(img_clean)
    result.save(out, "PNG")
    print(f"    Saved: {out.name}")
    return True


def process_multi(filename: str, slugs: list[str]) -> int:
    """Process a multi-bottle image, splitting into individual bottles."""
    src = NORM_DIR / filename
    if not src.exists():
        print(f"  SKIP {filename} — source not found")
        return 0

    # Check if all outputs already exist
    all_exist = all((NORM_DIR / f"{s}-full.png").exists() for s in slugs)
    if all_exist:
        print(f"  SKIP {filename} — all {len(slugs)} bottles already processed")
        return len(slugs)

    print(f"  Processing {filename} -> {len(slugs)} bottles ...")
    img = Image.open(src).convert("RGBA")
    print(f"    Original: {img.size}")

    img_nobg = remove(img)
    print("    Background removed")

    img_clean = clean_alpha(img_nobg)

    bottles = split_bottles(img_clean, len(slugs))

    count = 0
    for i, (slug, bottle_img) in enumerate(zip(slugs, bottles)):
        out = NORM_DIR / f"{slug}-full.png"
        if out.exists():
            print(f"    SKIP {slug} — already exists")
            count += 1
            continue

        result = normalize_bottle(bottle_img)
        result.save(out, "PNG")
        print(f"    Saved: {slug}-full.png")
        count += 1

    return count


def cleanup_raw_files() -> None:
    """Delete raw uploaded files from normalized directory."""
    raw_files = set(SINGLES.keys()) | set(MULTIS.keys()) | SKIP
    for filename in raw_files:
        path = NORM_DIR / filename
        if path.exists():
            path.unlink()
            print(f"  Deleted: {filename}")


def main() -> None:
    print("=== Processing Single-Bottle Images ===")
    single_count = 0
    for filename, slug in SINGLES.items():
        if process_single(filename, slug):
            single_count += 1

    print(f"\n=== Processing Multi-Bottle Images ===")
    multi_count = 0
    for filename, slugs in MULTIS.items():
        multi_count += process_multi(filename, slugs)

    print(f"\n=== Summary ===")
    print(f"  Singles: {single_count}/{len(SINGLES)}")
    print(f"  Multi-splits: {multi_count}")
    total = single_count + multi_count
    print(f"  Total: {total} bottles processed")

    if "--cleanup" in sys.argv:
        print(f"\n=== Cleaning Up Raw Files ===")
        cleanup_raw_files()


if __name__ == "__main__":
    main()
