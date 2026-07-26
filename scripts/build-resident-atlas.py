"""Normalize a selected AI-generated resident sheet into Phaser frame cells.

This script performs local mechanical processing only. It makes no ownership,
license, originality, or Phase 3 completion claim about its input.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


COLUMNS = 5
ROWS = 2
FRAME_WIDTH = 24
FRAME_HEIGHT = 32
INNER_WIDTH = 22
INNER_HEIGHT = 29
BASELINE_Y = 30


def validate_atlas(image: Image.Image) -> None:
    expected_size = (COLUMNS * FRAME_WIDTH, ROWS * FRAME_HEIGHT)
    if image.size != expected_size:
        raise ValueError(f"Expected atlas size {expected_size}, found {image.size}")

    colors = image.getcolors(maxcolors=17)
    if colors is None or len(colors) > 16:
        raise ValueError("Atlas must contain at most 16 RGBA colors")

    alpha_values = set(image.getchannel("A").tobytes())
    if not alpha_values.issubset({0, 255}):
        raise ValueError("Atlas contains partially transparent pixels")

    for index in range(COLUMNS * ROWS):
        cell_x = (index % COLUMNS) * FRAME_WIDTH
        cell_y = (index // COLUMNS) * FRAME_HEIGHT
        frame = image.crop(
            (cell_x, cell_y, cell_x + FRAME_WIDTH, cell_y + FRAME_HEIGHT)
        )
        bbox = frame.getchannel("A").getbbox()
        if bbox is None:
            raise ValueError(f"Frame {index} contains no visible pixels")
        if bbox[3] != BASELINE_Y:
            raise ValueError(
                f"Frame {index} baseline ends at {bbox[3]}, expected {BASELINE_Y}"
            )


def contiguous_spans(active: list[bool], minimum_length: int) -> list[tuple[int, int]]:
    spans: list[tuple[int, int]] = []
    start: int | None = None
    for index, value in enumerate([*active, False]):
        if value and start is None:
            start = index
        elif not value and start is not None:
            if index - start >= minimum_length:
                spans.append((start, index))
            start = None
    return spans


def projected_spans(
    alpha: Image.Image,
    *,
    axis: str,
    threshold: int,
    minimum_length: int,
) -> list[tuple[int, int]]:
    if axis == "y":
        projection = alpha.resize((1, alpha.height), Image.Resampling.BOX)
    elif axis == "x":
        projection = alpha.resize((alpha.width, 1), Image.Resampling.BOX)
    else:
        raise ValueError(f"Unsupported projection axis: {axis}")
    return contiguous_spans(
        [value >= threshold for value in projection.tobytes()],
        minimum_length,
    )


def visible_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A").point(lambda value: 255 if value >= 32 else 0)
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("Frame contains no visible pixels")
    return bbox


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()

    source = Image.open(args.input).convert("RGBA")
    alpha = source.getchannel("A")
    row_spans = projected_spans(
        alpha,
        axis="y",
        threshold=6,
        minimum_length=32,
    )
    if len(row_spans) != ROWS:
        raise ValueError(f"Expected {ROWS} visible rows, found {row_spans}")

    frames: list[Image.Image] = []
    bboxes: list[tuple[int, int, int, int]] = []
    for top, bottom in row_spans:
        row_alpha = alpha.crop((0, top, source.width, bottom))
        column_spans = projected_spans(
            row_alpha,
            axis="x",
            threshold=6,
            minimum_length=24,
        )
        if len(column_spans) != COLUMNS:
            raise ValueError(
                f"Expected {COLUMNS} visible columns in row {top}:{bottom}, "
                f"found {column_spans}"
            )
        for left, right in column_spans:
            frame = source.crop((left, top, right, bottom))
            frames.append(frame)
            bboxes.append(visible_bbox(frame))

    max_width = max(right - left for left, _, right, _ in bboxes)
    max_height = max(bottom - top for _, top, _, bottom in bboxes)
    scale = min(INNER_WIDTH / max_width, INNER_HEIGHT / max_height)

    atlas = Image.new(
        "RGBA",
        (COLUMNS * FRAME_WIDTH, ROWS * FRAME_HEIGHT),
        (0, 0, 0, 0),
    )

    for index, (frame, bbox) in enumerate(zip(frames, bboxes, strict=True)):
        cropped = frame.crop(bbox)
        width = max(1, round(cropped.width * scale))
        height = max(1, round(cropped.height * scale))
        resized = cropped.resize((width, height), Image.Resampling.NEAREST)

        cell_x = (index % COLUMNS) * FRAME_WIDTH
        cell_y = (index // COLUMNS) * FRAME_HEIGHT
        paste_x = cell_x + (FRAME_WIDTH - width) // 2
        paste_y = cell_y + BASELINE_Y - height
        atlas.alpha_composite(resized, (paste_x, paste_y))

    quantized = atlas.quantize(
        colors=16,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.NONE,
    ).convert("RGBA")
    alpha = quantized.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    quantized.putalpha(alpha)
    validate_atlas(quantized)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    quantized.save(args.output, optimize=True)

    if args.preview:
        args.preview.parent.mkdir(parents=True, exist_ok=True)
        quantized.resize(
            (quantized.width * 8, quantized.height * 8),
            Image.Resampling.NEAREST,
        ).save(args.preview, optimize=True)


if __name__ == "__main__":
    main()
