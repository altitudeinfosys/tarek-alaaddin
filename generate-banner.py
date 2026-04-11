#!/usr/bin/env python3
"""
Neural Cartography — Twitter/X Banner Generator (Refined)
1500x500px banner for @tarekalaaddin
"""

import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Canvas
W, H = 1500, 500
FONTS_DIR = "/Users/tarekalaaddin/.claude/plugins/cache/anthropic-agent-skills/example-skills/c74d647e56e6/canvas-design/canvas-fonts"

# Palette — Neural Cartography
BG = (6, 8, 16)              # Deeper void
GRID_DIM = (16, 20, 38)      # Faint grid
CYAN = (0, 220, 255)         # Primary signal
CYAN_MID = (0, 160, 210)     # Mid cyan
CYAN_DIM = (0, 90, 140)      # Dim connections
WHITE = (230, 240, 255)      # Crisp white
WHITE_DIM = (90, 105, 135)   # Muted label
ELECTRIC = (60, 120, 255)    # Secondary blue
PURPLE_HINT = (100, 60, 200) # Subtle accent
NODE_BRIGHT = (0, 250, 255)  # Bright node core

random.seed(42)

img = Image.new("RGBA", (W, H), BG + (255,))
draw = ImageDraw.Draw(img)

# ============================================================
# LAYER 1: Radial gradient background (center glow)
# ============================================================
gradient_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(gradient_layer)
cx_grad, cy_grad = 700, 250
for r in range(500, 0, -1):
    opacity = int(18 * (1 - r / 500))
    gd.ellipse(
        [(cx_grad - r, cy_grad - r), (cx_grad + r, cy_grad + r)],
        fill=(0, 40, 80, opacity)
    )
img = Image.alpha_composite(img, gradient_layer)
draw = ImageDraw.Draw(img)

# ============================================================
# LAYER 2: Grid substrate with perspective fade
# ============================================================
for y in range(0, H, 25):
    major = y % 100 == 0
    opacity = 30 if major else 12
    # Fade opacity toward edges
    draw.line([(0, y), (W, y)], fill=(*GRID_DIM[:3], opacity), width=1)

for x in range(0, W, 25):
    major = x % 100 == 0
    opacity = 30 if major else 12
    draw.line([(x, 0), (x, H)], fill=(*GRID_DIM[:3], opacity), width=1)

# ============================================================
# LAYER 3: Neural network nodes
# ============================================================
nodes = []
# Dense left-center cluster (the "brain")
for _ in range(50):
    x = random.gauss(480, 160)
    y = random.gauss(250, 90)
    nodes.append((x, y, "primary"))

# Right cluster
for _ in range(30):
    x = random.gauss(1150, 150)
    y = random.gauss(250, 100)
    nodes.append((x, y, "secondary"))

# Bridge nodes connecting clusters
for _ in range(15):
    x = random.gauss(800, 80)
    y = random.gauss(250, 60)
    nodes.append((x, y, "bridge"))

# Scattered ambient
for _ in range(50):
    x = random.uniform(30, 1470)
    y = random.uniform(20, 480)
    nodes.append((x, y, "ambient"))

# ============================================================
# LAYER 4: Connections with depth
# ============================================================
for i, (x1, y1, t1) in enumerate(nodes):
    for j, (x2, y2, t2) in enumerate(nodes):
        if i >= j:
            continue
        dist = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        max_dist = 120 if (t1 in ("primary", "bridge") and t2 in ("primary", "bridge")) else 90
        if dist < max_dist:
            opacity = int(max(6, 55 - dist * 0.4))
            color = CYAN_DIM if t1 == "primary" or t2 == "primary" else ELECTRIC
            draw.line([(x1, y1), (x2, y2)], fill=(*color[:3], opacity), width=1)

# ============================================================
# LAYER 5: Concentric signal rings
# ============================================================
# Primary ring system — left focal point
ring_cx, ring_cy = 420, 250
for r in range(30, 280, 22):
    opacity = max(6, 55 - r // 5)
    arc_start = random.randint(0, 40)
    for angle in range(arc_start, 360 + arc_start, 2):
        # More gaps in outer rings
        gap_chance = 0.08 + (r / 280) * 0.2
        if random.random() < gap_chance:
            continue
        rad = math.radians(angle)
        rad2 = math.radians(angle + 1.5)
        x1 = ring_cx + r * math.cos(rad)
        y1 = ring_cy + r * math.sin(rad)
        x2 = ring_cx + r * math.cos(rad2)
        y2 = ring_cy + r * math.sin(rad2)
        c = CYAN if r < 100 else CYAN_MID
        draw.line([(x1, y1), (x2, y2)], fill=(*c[:3], opacity), width=1)

# Secondary ring — right area
ring_cx2, ring_cy2 = 1200, 220
for r in range(20, 140, 18):
    opacity = max(5, 40 - r // 4)
    for angle in range(0, 360, 3):
        if random.random() < 0.18:
            continue
        rad = math.radians(angle)
        rad2 = math.radians(angle + 2)
        x1 = ring_cx2 + r * math.cos(rad)
        y1 = ring_cy2 + r * math.sin(rad)
        x2 = ring_cx2 + r * math.cos(rad2)
        y2 = ring_cy2 + r * math.sin(rad2)
        draw.line([(x1, y1), (x2, y2)], fill=(*ELECTRIC[:3], opacity), width=1)

# Tiny tertiary ring
ring_cx3, ring_cy3 = 850, 380
for r in range(10, 60, 15):
    opacity = max(4, 25 - r // 3)
    for angle in range(0, 360, 4):
        if random.random() < 0.25:
            continue
        rad = math.radians(angle)
        rad2 = math.radians(angle + 3)
        x1 = ring_cx3 + r * math.cos(rad)
        y1 = ring_cy3 + r * math.sin(rad)
        x2 = ring_cx3 + r * math.cos(rad2)
        y2 = ring_cy3 + r * math.sin(rad2)
        draw.line([(x1, y1), (x2, y2)], fill=(*PURPLE_HINT[:3], opacity), width=1)

# ============================================================
# LAYER 6: Node rendering with proper glow
# ============================================================
# Create a separate glow layer for additive blending
glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)

for x, y, ntype in nodes:
    if ntype == "primary":
        size = random.choice([2, 2, 3, 3, 4])
        glow_radius = 14
    elif ntype == "bridge":
        size = random.choice([2, 3])
        glow_radius = 10
    elif ntype == "secondary":
        size = random.choice([1, 2, 2, 3])
        glow_radius = 10
    else:
        size = random.choice([1, 1, 1, 2])
        glow_radius = 6

    brightness = random.randint(160, 255)

    # Glow halo
    if size >= 2:
        for gr in range(glow_radius, 1, -1):
            glow_opacity = int(20 * (1 - gr / glow_radius))
            color = CYAN if ntype != "secondary" else ELECTRIC
            glow_draw.ellipse(
                [(x - gr, y - gr), (x + gr, y + gr)],
                fill=(*color[:3], glow_opacity)
            )

    # Core
    draw.ellipse(
        [(x - size, y - size), (x + size, y + size)],
        fill=(*NODE_BRIGHT[:3], brightness)
    )

    # Bright center pixel for larger nodes
    if size >= 3:
        draw.point((int(x), int(y)), fill=(255, 255, 255, 255))

img = Image.alpha_composite(img, glow_layer)
draw = ImageDraw.Draw(img)

# ============================================================
# LAYER 7: Signal flow traces
# ============================================================
flow_configs = [
    (100, 5, "left"),
    (250, 4, "center"),
    (400, 5, "left"),
    (150, 3, "right"),
    (350, 3, "right"),
]
for fy, count, start in flow_configs:
    x_pos = random.randint(60, 300) if start == "left" else random.randint(800, 1100)
    for _ in range(count):
        seg_len = random.randint(40, 200)
        opacity = random.randint(20, 60)
        width = 1 if random.random() > 0.3 else 2
        draw.line(
            [(x_pos, fy), (x_pos + seg_len, fy)],
            fill=(*CYAN[:3], opacity), width=width
        )
        # Bright endpoint dot
        if random.random() > 0.5:
            draw.ellipse(
                [(x_pos + seg_len - 1, fy - 1), (x_pos + seg_len + 1, fy + 1)],
                fill=(*CYAN[:3], opacity + 30)
            )
        x_pos += seg_len + random.randint(8, 50)

# ============================================================
# LAYER 8: Star field / fine data points
# ============================================================
for _ in range(500):
    x = random.randint(0, W)
    y = random.randint(0, H)
    opacity = random.randint(15, 90)
    size = 0 if random.random() > 0.1 else 1
    if size == 0:
        draw.point((x, y), fill=(*WHITE[:3], opacity))
    else:
        draw.ellipse([(x, y), (x + 1, y + 1)], fill=(*WHITE[:3], opacity // 2))

# ============================================================
# LAYER 9: Coordinate markers
# ============================================================
try:
    font_coord = ImageFont.truetype(f"{FONTS_DIR}/GeistMono-Regular.ttf", 9)
except:
    font_coord = ImageFont.load_default()

coords = [
    (65, 55, "SYS.0x7A"),
    (280, 435, "NODE.127"),
    (680, 55, "FREQ.44.1k"),
    (950, 445, "v2.4.1"),
    (1330, 65, "SIGNAL.OK"),
    (1380, 420, "30.2674N"),
]
for cx, cy, label in coords:
    draw.text((cx + 8, cy - 4), label, font=font_coord, fill=(*WHITE_DIM[:3], 55))
    # Crosshair
    csize = 5
    draw.line([(cx - csize, cy), (cx - 2, cy)], fill=(*CYAN[:3], 50), width=1)
    draw.line([(cx + 2, cy), (cx + csize, cy)], fill=(*CYAN[:3], 50), width=1)
    draw.line([(cx, cy - csize), (cx, cy - 2)], fill=(*CYAN[:3], 50), width=1)
    draw.line([(cx, cy + 2), (cx, cy + csize)], fill=(*CYAN[:3], 50), width=1)

# ============================================================
# LAYER 10: Minimal typography (no name — already on profile)
# ============================================================
try:
    font_sub = ImageFont.truetype(f"{FONTS_DIR}/Jura-Medium.ttf", 26)
    font_slash = ImageFont.truetype(f"{FONTS_DIR}/Jura-Light.ttf", 26)
    font_url = ImageFont.truetype(f"{FONTS_DIR}/GeistMono-Regular.ttf", 14)
except:
    font_sub = ImageFont.load_default()
    font_slash = ImageFont.load_default()
    font_url = ImageFont.load_default()

# Subtitle — centered vertically, positioned right of center
text_x = 750
text_y = 220

# Separator line with gradient effect (above subtitle)
line_y = text_y - 14
line_width = 520
for i in range(line_width):
    opacity = int(90 * math.sin(math.pi * i / line_width))
    draw.point((text_x + i, line_y), fill=(*CYAN[:3], opacity))
    if opacity > 20:
        draw.point((text_x + i, line_y + 1), fill=(*CYAN[:3], opacity // 4))

# Subtitle with letter spacing — larger, bolder, full white for legibility
sub_parts = ["AI ENGINEERING", "/", "AUTOMATION", "/", "SELF DEVELOPMENT"]
sx = text_x
for part in sub_parts:
    if part == "/":
        draw.text((sx, text_y), part, font=font_slash, fill=(*CYAN_MID[:3], 100))
        sx += 30
    else:
        # Subtle glow behind text for pop
        glow_sub = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gs_draw = ImageDraw.Draw(glow_sub)
        gs_draw.text((sx, text_y), part, font=font_sub, fill=(*CYAN[:3], 30))
        glow_sub = glow_sub.filter(ImageFilter.GaussianBlur(radius=6))
        img = Image.alpha_composite(img, glow_sub)
        draw = ImageDraw.Draw(img)
        # Crisp text
        draw.text((sx, text_y), part, font=font_sub, fill=(*WHITE[:3], 240))
        bbox = font_sub.getbbox(part)
        sx += bbox[2] - bbox[0] + 26

# Second separator line (below subtitle)
line_y2 = text_y + 40
for i in range(line_width):
    opacity = int(90 * math.sin(math.pi * i / line_width))
    draw.point((text_x + i, line_y2), fill=(*CYAN[:3], opacity))
    if opacity > 20:
        draw.point((text_x + i, line_y2 + 1), fill=(*CYAN[:3], opacity // 4))

# URL — slightly larger
draw.text((text_x, line_y2 + 16), "tarekalaaddin.com", font=font_url, fill=(*WHITE_DIM[:3], 120))

# ============================================================
# LAYER 11: Accent geometry
# ============================================================
# Left-edge accent bars
for i in range(6):
    bar_w = 15 + i * 12
    bar_y = 15 + i * 7
    opacity = 20 + i * 10
    draw.line([(15, bar_y), (15 + bar_w, bar_y)], fill=(*CYAN[:3], opacity), width=1)

# Bottom-right accent bars
for i in range(5):
    bar_w = 12 + i * 10
    bar_y = H - 55 + i * 7
    opacity = 15 + i * 8
    draw.line([(W - 20 - bar_w, bar_y), (W - 20, bar_y)], fill=(*ELECTRIC[:3], opacity), width=1)

# Diamond marker near subtitle
dm_x, dm_y = text_x - 20, text_y + 8
dm_s = 5
draw.polygon(
    [(dm_x, dm_y - dm_s), (dm_x + dm_s, dm_y), (dm_x, dm_y + dm_s), (dm_x - dm_s, dm_y)],
    outline=(*CYAN[:3], 140)
)

# Small corner brackets
bracket_len = 20
bracket_c = (*WHITE_DIM[:3], 40)
# Top-left
draw.line([(25, 25), (25 + bracket_len, 25)], fill=bracket_c, width=1)
draw.line([(25, 25), (25, 25 + bracket_len)], fill=bracket_c, width=1)
# Top-right
draw.line([(W - 25 - bracket_len, 25), (W - 25, 25)], fill=bracket_c, width=1)
draw.line([(W - 25, 25), (W - 25, 25 + bracket_len)], fill=bracket_c, width=1)
# Bottom-left
draw.line([(25, H - 25), (25 + bracket_len, H - 25)], fill=bracket_c, width=1)
draw.line([(25, H - 25 - bracket_len), (25, H - 25)], fill=bracket_c, width=1)
# Bottom-right
draw.line([(W - 25 - bracket_len, H - 25), (W - 25, H - 25)], fill=bracket_c, width=1)
draw.line([(W - 25, H - 25 - bracket_len), (W - 25, H - 25)], fill=bracket_c, width=1)

# ============================================================
# FLATTEN & FINALIZE
# ============================================================
final = Image.new("RGB", (W, H), BG)
final.paste(img, (0, 0), img)

# Very subtle overall glow for cohesion
glow = final.copy().filter(ImageFilter.GaussianBlur(radius=2))
final = Image.blend(final, glow, alpha=0.1)

output_path = "/Users/tarekalaaddin/Projects/code/tarek-alaaddin/twitter-banner.png"
final.save(output_path, "PNG", quality=100)
print(f"Banner saved to: {output_path}")
print(f"Dimensions: {W}x{H}")
