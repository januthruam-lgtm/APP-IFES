import sys
import math
import subprocess

WIDTH = 768
HEIGHT = 768
FPS = 30
TOTAL_FRAMES = 150 # 5.0 seconds

LOGO_W = 1376
LOGO_H = 768

# Extract raw RGBA of public/logo_clean.png if not already there
subprocess.run(['ffmpeg', '-i', 'public/logo_clean.png', '-f', 'rawvideo', '-pix_fmt', 'rgba', '/tmp/logo_raw.rgba', '-y'],
               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

with open('/tmp/logo_raw.rgba', 'rb') as f:
    raw_logo_data = f.read()

# Crop center 768x768 from 1376x768
x_start = (LOGO_W - WIDTH) // 2 # 304

logo_pixels = bytearray(WIDTH * HEIGHT * 4)
for y in range(HEIGHT):
    src_row_start = (y * LOGO_W + x_start) * 4
    dst_row_start = (y * WIDTH) * 4
    logo_pixels[dst_row_start : dst_row_start + WIDTH * 4] = raw_logo_data[src_row_start : src_row_start + WIDTH * 4]

# Fingerprint Spiral Whorl geometry (Center at x=384, y=250)
FP_CX = 384
FP_CY = 248

def get_fingerprint_paths():
    arcs = []
    # Arc 1: Outer crescent (left)
    pts1 = []
    for deg in range(110, 270, 3):
        rad = math.radians(deg)
        r = 138 + 15 * math.sin(deg * 0.02)
        pts1.append((FP_CX + r * math.cos(rad) * 0.82, FP_CY + r * math.sin(rad) * 1.15))
    arcs.append(pts1)

    # Arc 2: Second ridge
    pts2 = []
    for deg in range(50, 290, 3):
        rad = math.radians(deg)
        r = 108 + 12 * math.cos(deg * 0.015)
        pts2.append((FP_CX + r * math.cos(rad) * 0.85, FP_CY + r * math.sin(rad) * 1.12))
    arcs.append(pts2)

    # Arc 3: Mid ridge
    pts3 = []
    for deg in range(20, 320, 3):
        rad = math.radians(deg)
        r = 78 + 10 * math.sin(deg * 0.02)
        pts3.append((FP_CX + r * math.cos(rad) * 0.88, FP_CY + r * math.sin(rad) * 1.1))
    arcs.append(pts3)

    # Arc 4: Inner loop
    pts4 = []
    for deg in range(-10, 340, 3):
        rad = math.radians(deg)
        r = 50 + 6 * math.sin(deg * 0.03)
        pts4.append((FP_CX + r * math.cos(rad) * 0.9, FP_CY + r * math.sin(rad) * 1.08))
    arcs.append(pts4)

    # Arc 5: Vortex center spiral curl
    pts5 = []
    for t in range(0, 180, 2):
        rad = math.radians(t * 3.5)
        r = 5 + t * 0.16
        pts5.append((FP_CX + r * math.cos(rad), FP_CY + r * math.sin(rad)))
    arcs.append(pts5)

    return arcs

FP_ARCS = get_fingerprint_paths()

def draw_thick_segment(buf, x0, y0, x1, y1, r, g, b, radius):
    dx = x1 - x0
    dy = y1 - y0
    dist = math.hypot(dx, dy)
    if dist < 0.5:
        return
    steps = max(1, int(dist))
    for s in range(steps + 1):
        t = s / steps
        cx = int(x0 + dx * t)
        cy = int(y0 + dy * t)
        rad = int(radius)
        for gy in range(max(0, cy - rad), min(HEIGHT, cy + rad + 1)):
            row_idx = gy * WIDTH * 4
            for gx in range(max(0, cx - rad), min(WIDTH, cx + rad + 1)):
                d = math.hypot(gx - cx, gy - cy)
                if d <= radius:
                    factor = 1.0 - (d / radius)
                    idx = row_idx + gx * 4
                    buf[idx] = min(255, int(buf[idx] + r * factor))
                    buf[idx+1] = min(255, int(buf[idx+1] + g * factor))
                    buf[idx+2] = min(255, int(buf[idx+2] + b * factor))

# Pre-render fingerprint layer on top of dark background with typography from logo
fp_layer = bytearray(WIDTH * HEIGHT * 4)
for i in range(0, len(fp_layer), 4):
    fp_layer[i] = 3
    fp_layer[i+1] = 5
    fp_layer[i+2] = 16
    fp_layer[i+3] = 255

# Copy typography (y >= 460) from logo_pixels to fp_layer
for y in range(460, HEIGHT):
    row_idx = y * WIDTH * 4
    fp_layer[row_idx : row_idx + WIDTH * 4] = logo_pixels[row_idx : row_idx + WIDTH * 4]

# Draw glowing cyan fingerprint
for arc in FP_ARCS:
    for i in range(len(arc) - 1):
        p0 = arc[i]
        p1 = arc[i+1]
        # Wide cyan outer bloom
        draw_thick_segment(fp_layer, p0[0], p0[1], p1[0], p1[1], 0, 180, 255, radius=10)
        # Medium bright cyan
        draw_thick_segment(fp_layer, p0[0], p0[1], p1[0], p1[1], 63, 230, 255, radius=4.5)
        # Crisp white core
        draw_thick_segment(fp_layer, p0[0], p0[1], p1[0], p1[1], 255, 255, 255, radius=1.8)

# Pre-render base logo layer with dark background
logo_layer = bytearray(WIDTH * HEIGHT * 4)
for i in range(0, len(logo_layer), 4):
    logo_layer[i] = 3
    logo_layer[i+1] = 5
    logo_layer[i+2] = 16
    logo_layer[i+3] = 255

for i in range(0, len(logo_layer), 4):
    lr = logo_pixels[i]
    lg = logo_pixels[i+1]
    lb = logo_pixels[i+2]
    if lr > 4 or lg > 4 or lb > 4:
        logo_layer[i] = min(255, logo_layer[i] + lr)
        logo_layer[i+1] = min(255, logo_layer[i+1] + lg)
        logo_layer[i+2] = min(255, logo_layer[i+2] + lb)

# Render frames
for frame_idx in range(TOTAL_FRAMES):
    time_sec = frame_idx / FPS
    frame = bytearray(logo_layer) # fast copy

    # Morphing phase: 3.2s to 4.2s
    if time_sec >= 3.2:
        if time_sec < 4.2:
            t = (time_sec - 3.2) / 1.0 # 0.0 to 1.0
            # Blend brain area (y < 460) from logo_layer to fp_layer
            for y in range(460):
                row = y * WIDTH * 4
                for x in range(WIDTH):
                    idx = row + x * 4
                    r0, g0, b0 = logo_layer[idx], logo_layer[idx+1], logo_layer[idx+2]
                    r1, g1, b1 = fp_layer[idx], fp_layer[idx+1], fp_layer[idx+2]
                    frame[idx] = int(r0 * (1.0 - t) + r1 * t)
                    frame[idx+1] = int(g0 * (1.0 - t) + g1 * t)
                    frame[idx+2] = int(b0 * (1.0 - t) + b1 * t)
        else:
            # Full fingerprint layer
            frame = bytearray(fp_layer)

    # Laser Streaks (0.0s to 1.5s)
    if time_sec < 1.5:
        lt = time_sec / 1.3
        lx = -80 + lt * 960
        ly = 130 + 240 * math.sin(lt * math.pi * 0.85)

        # Draw laser line tail
        tail_steps = 25
        for s in range(tail_steps):
            st = s / tail_steps
            tx = lx - st * 220
            ty = ly - st * 80 + 25 * math.sin(st * math.pi)
            draw_thick_segment(frame, tx, ty, tx+3, ty+1, 0, 230, 255, radius=7 * (1.0 - st))
            draw_thick_segment(frame, tx, ty, tx+3, ty+1, 255, 255, 255, radius=2 * (1.0 - st))

        # Starburst flare at tip
        if 0 <= lx < WIDTH and 0 <= ly < HEIGHT:
            for sp_x in range(max(0, int(lx - 90)), min(WIDTH, int(lx + 90))):
                alpha = max(0.0, 1.0 - abs(sp_x - lx) / 90.0) ** 2
                sp_idx = (int(ly) * WIDTH + sp_x) * 4
                frame[sp_idx] = min(255, int(frame[sp_idx] + 255 * alpha))
                frame[sp_idx+1] = min(255, int(frame[sp_idx+1] + 240 * alpha))
                frame[sp_idx+2] = min(255, int(frame[sp_idx+2] + 255 * alpha))

    # Glow Pulse (1.5s to 3.2s)
    if 1.5 <= time_sec <= 3.2:
        pulse = 0.15 * math.sin((time_sec - 1.5) * math.pi * 2.5)
        if pulse > 0:
            for y in range(HEIGHT):
                row = y * WIDTH * 4
                for x in range(WIDTH):
                    idx = row + x * 4
                    r, g, b = frame[idx], frame[idx+1], frame[idx+2]
                    if r > 10 or g > 10 or b > 10:
                        frame[idx] = min(255, int(r * (1.0 + pulse)))
                        frame[idx+1] = min(255, int(g * (1.0 + pulse * 1.2)))
                        frame[idx+2] = min(255, int(b * (1.0 + pulse * 1.2)))

    # Master Fade Out (4.7s to 5.0s)
    if time_sec > 4.7:
        fade = max(0.0, 1.0 - (time_sec - 4.7) / 0.3)
        for i in range(0, len(frame), 4):
            frame[i] = int(frame[i] * fade)
            frame[i+1] = int(frame[i+1] * fade)
            frame[i+2] = int(frame[i+2] * fade)

    # Output RGBA frame to stdout
    sys.stdout.buffer.write(frame)

