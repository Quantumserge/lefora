"""Generate the small, dependency-free PNG icons used by the PWA manifest."""

import math
import struct
import zlib
from pathlib import Path


def chunk(kind: bytes, data: bytes) -> bytes:
    body = kind + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def make_icon(size: int, path: Path) -> None:
    green = (20, 122, 75, 255)
    white = (255, 255, 255, 255)
    pixels = bytearray()

    for y in range(size):
        ny = (y + 0.5) / size
        pixels.append(0)  # PNG filter: None
        for x in range(size):
            nx = (x + 0.5) / size
            # Two leaves, shaped as tilted ellipses around the stem.
            left_x, left_y = nx - 0.39, ny - 0.47
            left_u = left_x * 0.766 + left_y * 0.643
            left_v = -left_x * 0.643 + left_y * 0.766
            right_x, right_y = nx - 0.61, ny - 0.39
            right_u = right_x * 0.766 - right_y * 0.643
            right_v = right_x * 0.643 + right_y * 0.766
            leaf = ((left_u / 0.19) ** 2 + (left_v / 0.105) ** 2 <= 1
                    or (right_u / 0.19) ** 2 + (right_v / 0.105) ** 2 <= 1)
            # Main stalk and short branch strokes.
            stalk = abs(nx - 0.5) < 0.018 and 0.42 <= ny <= 0.77
            left_branch = abs((ny - 0.57) - (nx - 0.5) * 0.75) < 0.012 and 0.40 <= nx <= 0.52
            right_branch = abs((ny - 0.49) + (nx - 0.5) * 0.75) < 0.012 and 0.48 <= nx <= 0.61
            pixels.extend(white if leaf or stalk or left_branch or right_branch else green)

    raw = bytes(pixels)
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">2I5B", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9))
           + chunk(b"IEND", b""))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


if __name__ == "__main__":
    output = Path(__file__).resolve().parents[1] / "public" / "icons"
    for dimension in (192, 512):
        make_icon(dimension, output / f"plant-{dimension}.png")
