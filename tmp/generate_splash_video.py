import sys
import math
import struct

# Dimensions
WIDTH = 768
HEIGHT = 768
FPS = 30
TOTAL_FRAMES = 150 # 5.0 seconds

# Load logo_raw.rgba (1376 x 768)
LOGO_W = 1376
LOGO_H = 768

with open('/tmp/logo_raw.rgba', 'rb') as f:
    raw_logo_data = f.read()

# Crop center 768x768 from 1376x768
x_start = (LOGO_W - WIDTH) // 2 # 304

logo_pixels = bytearray(WIDTH * HEIGHT * 4)
for y in range(HEIGHT):
    src_row_start = (y * LOGO_W + x_start) * 4
    dst_row_start = (y * WIDTH) * 4
    logo_pixels[dst_row_start : dst_row_start + WIDTH * 4] = raw_logo_data[src_row_start : src_row_start + WIDTH * 4]

# Identify brain vs text regions
# In 768x768:
# Brain center is around y=240, text is around y=540 to y=640
# Let's verify by finding the text baseline and brain bounds

def draw_line(buf, x0, y0, x1, y1, r, g, b, thickness=2, glow=10):
    # Bresenham or sampling with glow
    dx = x1 - x0
    dy = y1 - y0
    dist = math.hypot(dx, dy)
    if dist == 0:
        return
    steps = int(dist * 2)
    for step in range(steps + 1):
        t = step / steps
        cx = int(x0 + dx * t)
        cy = int(y0 + dy * t)
        for gx in range(max(0, cx - glow), min(WIDTH, cx + glow + 1)):
            for gy in range(max(0, cy - glow), min(HEIGHT, cy + glow + 1)):
                d = math.hypot(gx - cx, gy - cy)
                if d <= glow:
                    alpha = math.exp(-(d * d) / (thickness * thickness * 2.0))
                    idx = (gy * WIDTH + gx) * 4
                    buf[idx] = min(255, int(buf[idx] + r * alpha))
                    buf[idx+1] = min(255, int(buf[idx+1] + g * alpha))
                    buf[idx+2] = min(255, int(buf[idx+2] + b * alpha))

# Fingerprint Spiral Whorl geometry
# 5 concentric curved ridge arcs forming the iconic fingerprint vortex
# Center at (384, 250), radius ~ 140
FP_CX = 384
FP_CY = 245

def get_fingerprint_paths():
    # Return list of points for each arc
    arcs = []
    # Arc 1: Outer crescent (left)
    pts1 = []
    for deg in range(110, 270, 3):
        rad = math.radians(deg)
        r = 135 + 15 * math.sin(deg * 0.02)
        pts1.append((FP_CX + r * math.cos(rad) * 0.82, FP_CY + r * math.sin(rad) * 1.15))
    arcs.append(pts1)

    # Arc 2: Second ridge (wrapping top around to right)
    pts2 = []
    for deg in range(50, 290, 3):
        rad = math.radians(deg)
        r = 105 + 12 * math.cos(deg * 0.015)
        pts2.append((FP_CX + r * math.cos(rad) * 0.85, FP_CY + r * math.sin(rad) * 1.12))
    arcs.append(pts2)

    # Arc 3: Mid ridge
    pts3 = []
    for deg in range(20, 320, 3):
        rad = math.radians(deg)
        r = 75 + 10 * math.sin(deg * 0.02)
        pts3.append((FP_CX + r * math.cos(rad) * 0.88, FP_CY + r * math.sin(rad) * 1.1))
    arcs.append(pts3)

    # Arc 4: Inner loop
    pts4 = []
    for deg in range(-10, 340, 3):
        rad = math.radians(deg)
        r = 48 + 6 * math.sin(deg * 0.03)
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

# Generate 150 frames
for frame_idx in range(TOTAL_FRAMES):
    time_sec = frame_idx / FPS
    frame = bytearray(WIDTH * HEIGHT * 4)

    # Background color #030510
    for i in range(0, len(frame), 4):
        frame[i] = 3
        frame[i+1] = 5
        frame[i+2] = 16
        frame[i+3] = 255

    # Determine phase
    # Phase 1: 0.0s to 1.5s -> Laser sweep across brain logo
    # Phase 2: 1.5s to 3.2s -> Glowing pulsating brain logo
    # Phase 3: 3.2s to 4.4s -> Morph from brain to fingerprint spiral whorl
    # Phase 4: 4.4s to 4.8s -> Glowing fingerprint spiral whorl
    # Phase 5: 4.8s to 5.0s -> Fade out

    # Calculate brain vs fingerprint opacity
    brain_opacity = 1.0
    fp_opacity = 0.0

    if time_sec < 3.2:
        brain_opacity = min(1.0, time_sec * 2.0)
        fp_opacity = 0.0
    elif time_sec < 4.0:
        # Morphing phase: 3.2s to 4.0s
        t_morph = (time_sec - 3.2) / 0.8
        brain_opacity = max(0.0, 1.0 - t_morph * 1.2)
        fp_opacity = min(1.0, t_morph * 1.3)
    elif time_sec < 4.8:
        brain_opacity = 0.0
        fp_opacity = 1.0
    else:
        # Fade out phase
        fade = max(0.0, 1.0 - (time_sec - 4.8) / 0.2)
        brain_opacity = 0.0
        fp_opacity = fade

    # Pulsing glow factor (1.5s - 3.2s)
    glow_pulse = 1.0
    if 1.0 <= time_sec <= 3.2:
        glow_pulse = 1.0 + 0.25 * math.sin((time_sec - 1.0) * math.pi * 2.5)

    # Overall master fade out at the very end
    master_alpha = 1.0
    if time_sec > 4.8:
        master_alpha = max(0.0, 1.0 - (time_sec - 4.8) / 0.2)

    # 1. Render Logo (Brain + Typography)
    # Note: Typography (y > 480) always stays visible until master fade!
    for y in range(HEIGHT):
        is_typography = (y >= 460)
        y_factor = master_alpha if is_typography else (brain_opacity * glow_pulse * master_alpha)

        if y_factor <= 0.001:
            continue

        row_offset = y * WIDTH * 4
        for x in range(WIDTH):
            idx = row_offset + x * 4
            lr = logo_pixels[idx]
            lg = logo_pixels[idx+1]
            lb = logo_pixels[idx+2]
            if lr > 5 or lg > 5 or lb > 5:
                # Additive blending on top of background
                frame[idx] = min(255, int(frame[idx] + lr * y_factor))
                frame[idx+1] = min(255, int(frame[idx+1] + lg * y_factor))
                frame[idx+2] = min(255, int(frame[idx+2] + lb * y_factor))

    # 2. Render Laser Streaks (0.0s to 1.5s)
    if time_sec < 1.6:
        laser_t = time_sec / 1.4 # 0.0 to 1.14
        # Primary curved laser streak cutting across brain
        # Starts from (-80, 120) curves across (384, 250) to (840, 380)
        lx = -100 + laser_t * 980
        ly = 120 + 260 * math.sin(laser_t * math.pi * 0.9)

        # Draw laser tail
        tail_len = 180
        for i in range(tail_len):
            tt = i / tail_len
            tx = lx - tt * 220
            ty = ly - tt * 80 + 30 * math.sin(tt * math.pi)
            if 0 <= tx < WIDTH and 0 <= ty < HEIGHT:
                alpha = (1.0 - tt) * 0.95
                draw_line(frame, tx, ty, tx+3, ty+1, 0, 240, 255, thickness=2, glow=7)
                draw_line(frame, tx, ty, tx+3, ty+1, 255, 255, 255, thickness=1, glow=2)

        # Laser core starburst / lens flare
        if 0 <= lx < WIDTH and 0 <= ly < HEIGHT:
            flare_r = 35
            for fx in range(max(0, int(lx - flare_r)), min(WIDTH, int(lx + flare_r))):
                for fy in range(max(0, int(ly - flare_r)), min(HEIGHT, int(ly + flare_r))):
                    fd = math.hypot(fx - lx, fy - ly)
                    if fd < flare_r:
                        f_alpha = (1.0 - fd / flare_r) ** 1.8
                        f_idx = (fy * WIDTH + fx) * 4
                        frame[f_idx] = min(255, int(frame[f_idx] + 255 * f_alpha))
                        frame[f_idx+1] = min(255, int(frame[f_idx+1] + 245 * f_alpha))
                        frame[f_idx+2] = min(255, int(frame[f_idx+2] + 255 * f_alpha))

            # Horizontal lens spike
            for sp_x in range(max(0, int(lx - 120)), min(WIDTH, int(lx + 120))):
                sp_alpha = max(0.0, 1.0 - abs(sp_x - lx) / 120.0) ** 2
                sp_idx = (int(ly) * WIDTH + sp_x) * 4
                frame[sp_idx] = min(255, int(frame[sp_idx] + 255 * sp_alpha))
                frame[sp_idx+1] = min(255, int(frame[sp_idx+1] + 240 * sp_alpha))
                frame[sp_idx+2] = min(255, int(frame[sp_idx+2] + 255 * sp_alpha))

        # Secondary diagonal streak cutting below
        s2_t = max(0.0, min(1.0, (time_sec - 0.2) / 1.1))
        if s2_t > 0:
            s2_x = WIDTH + 80 - s2_t * 950
            s2_y = 420 - s2_t * 180
            if 0 <= s2_x < WIDTH and 0 <= s2_y < HEIGHT:
                draw_line(frame, s2_x, s2_y, s2_x - 120, s2_y + 40, 0, 220, 255, thickness=2, glow=6)

    # 3. Render Fingerprint Spiral Whorl (Morphing from 3.2s, Full 4.0s - 4.8s)
    if fp_opacity > 0.005:
        # Spiral rotation angle (slight entrance spin)
        rot_angle = math.radians((1.0 - min(1.0, fp_opacity)) * 25.0)
        cos_r = math.cos(rot_angle)
        sin_r = math.sin(rot_angle)

        for arc in FP_ARCS:
            for pt_idx in range(len(arc) - 1):
                p0 = arc[pt_idx]
                p1 = arc[pt_idx + 1]

                # Rotate around center
                rx0 = FP_CX + (p0[0] - FP_CX) * cos_r - (p0[1] - FP_CY) * sin_r
                ry0 = FP_CY + (p0[0] - FP_CX) * sin_r + (p0[1] - FP_CY) * cos_r

                rx1 = FP_CX + (p1[0] - FP_CX) * cos_r - (p1[1] - FP_CY) * sin_r
                ry1 = FP_CY + (p1[0] - FP_CX) * sin_r + (p1[1] - FP_CY) * cos_r

                # Draw glowing cyan ridge with white core
                # Outer cyan glow
                draw_line(frame, rx0, ry0, rx1, ry1,
                          int(0 * fp_opacity),
                          int(230 * fp_opacity),
                          int(255 * fp_opacity),
                          thickness=3.5, glow=12)
                # Inner bright cyan
                draw_line(frame, rx0, ry0, rx1, ry1,
                          int(120 * fp_opacity),
                          int(245 * fp_opacity),
                          int(255 * fp_opacity),
                          thickness=2.0, glow=5)
                # White-hot center filament
                draw_line(frame, rx0, ry0, rx1, ry1,
                          int(255 * fp_opacity),
                          int(255 * fp_opacity),
                          int(255 * fp_opacity),
                          thickness=1.2, glow=2)

    # 4. Electric Transition Particles during Morph (3.2s to 4.2s)
    if 3.2 <= time_sec <= 4.2:
        p_t = (time_sec - 3.2) / 1.0
        # Draw swirling energetic sparks
        num_sparks = 36
        for sp_i in range(num_sparks):
            sp_angle = sp_i * (math.pi * 2 / num_sparks) + p_t * 6.0
            sp_dist = (1.0 - p_t) * 160 + math.sin(sp_i * 2.3) * 20
            spx = int(FP_CX + math.cos(sp_angle) * sp_dist)
            spy = int(FP_CY + math.sin(sp_angle) * sp_dist * 0.9)
            if 0 <= spx < WIDTH and 0 <= spy < HEIGHT:
                draw_line(frame, spx, spy, spx + 2, spy + 2, 63, 230, 255, thickness=2, glow=6)
                draw_line(frame, spx, spy, spx + 1, spy + 1, 255, 255, 255, thickness=1, glow=2)

    # Write raw RGBA frame to stdout
    sys.stdout.buffer.write(frame)

