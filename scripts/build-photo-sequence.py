import os
import cv2
import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera-sequence')
PARTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera', 'teardown-parts')
os.makedirs(OUTPUT_DIR, exist_ok=True)

TW, TH = 1280, 720
TOTAL_FRAMES = 60

print(f"🎬 Generating {TOTAL_FRAMES} physically continuous optical teardown frames...")

# Load background plate
bg_plate = cv2.imread(os.path.join(PARTS_DIR, 'bg_plate.jpg'))
if bg_plate is None:
    raise FileNotFoundError(f"bg_plate.jpg not found in {PARTS_DIR}")

names = ['front_glass', 'focus_barrel', 'aperture_iris', 'rear_optics', 'bayonet_flange']
pieces = []

for i in range(1, 6):
    fname = os.path.join(PARTS_DIR, f'piece_{i}_{names[i-1]}.png')
    img = cv2.imread(fname)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, alpha = cv2.threshold(gray, 5, 255, cv2.THRESH_BINARY)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    
    y_idx, x_idx = np.where(alpha > 10)
    x1, x2 = x_idx.min(), x_idx.max()
    y1, y2 = y_idx.min(), y_idx.max()
    
    crop_rgb = img[y1:y2+1, x1:x2+1]
    crop_a = alpha[y1:y2+1, x1:x2+1]
    
    pieces.append({
        'name': names[i-1],
        'rgb': crop_rgb,
        'alpha': (crop_a.astype(np.float32) / 255.0)[:, :, np.newaxis],
        'exploded_x': int(x1),
        'exploded_y': int(y1),
        'w': int(x2 - x1 + 1),
        'h': int(y2 - y1 + 1)
    })

# Optical axis slope
SLOPE = -0.232

# Key positions along optical axis
# 1. Packed at mount (Frame 0)
packed_positions = {
    'bayonet_flange': (675, int(pieces[4]['exploded_y'] + SLOPE * (675 - pieces[4]['exploded_x']))),
    'rear_optics':    (650, int(pieces[3]['exploded_y'] + SLOPE * (650 - pieces[3]['exploded_x']))),
    'aperture_iris':  (620, int(pieces[2]['exploded_y'] + SLOPE * (620 - pieces[2]['exploded_x']))),
    'focus_barrel':   (560, int(pieces[1]['exploded_y'] + SLOPE * (560 - pieces[1]['exploded_x']))),
    'front_glass':    (480, int(pieces[0]['exploded_y'] + SLOPE * (480 - pieces[0]['exploded_x'])))
}

# 2. Detached as solid group (Frame 18, t = 0.30)
detached_positions = {
    name: (pos[0] - 70, int(pos[1] + SLOPE * (-70)))
    for name, pos in packed_positions.items()
}

# 3. Exploded teardown (Frame 59, t = 1.0)
exploded_positions = {
    p['name']: (p['exploded_x'], p['exploded_y'])
    for p in pieces
}

def ease_in_out(t):
    return t * t * (3.0 - 2.0 * t)

def render_frame_composite(positions, pan_x):
    bw = bg_plate.shape[1]
    bh = bg_plate.shape[0]
    canvas = np.zeros_like(bg_plate)
    
    # Base background plate shifted by pan_x
    if pan_x >= 0:
        canvas[:, pan_x:min(bw, pan_x + bw)] = bg_plate[:, :max(0, bw - pan_x)]
        left_col = bg_plate[:, 0:1]
        canvas[:, :pan_x] = left_col
    else:
        canvas[:, :bw + pan_x] = bg_plate[:, -pan_x:]
    
    render_order = ['bayonet_flange', 'rear_optics', 'aperture_iris', 'focus_barrel', 'front_glass']
    piece_map = {p['name']: p for p in pieces}
    
    for name in render_order:
        p = piece_map[name]
        px, py = positions[name]
        px += pan_x
        
        x1_src = max(0, -px)
        y1_src = max(0, -py)
        x2_src = min(p['w'], bw - px)
        y2_src = min(p['h'], bh - py)
        
        if x2_src <= x1_src or y2_src <= y1_src:
            continue
            
        x1_dst = max(0, px)
        y1_dst = max(0, py)
        x2_dst = x1_dst + (x2_src - x1_src)
        y2_dst = y1_dst + (y2_src - y1_src)
        
        rgb_crop = p['rgb'][y1_src:y2_src, x1_src:x2_src]
        a_crop = p['alpha'][y1_src:y2_src, x1_src:x2_src]
        
        target = canvas[y1_dst:y2_dst, x1_dst:x2_dst].astype(np.float32)
        blended = target * (1.0 - a_crop) + rgb_crop.astype(np.float32) * a_crop
        canvas[y1_dst:y2_dst, x1_dst:x2_dst] = blended.astype(np.uint8)
        
    return canvas

MAX_PAN = 120

for i in range(TOTAL_FRAMES):
    progress = i / (TOTAL_FRAMES - 1.0)
    pan_t = ease_in_out(progress)
    current_pan = int(round(MAX_PAN * pan_t))
    
    cur_positions = {}
    if progress <= 0.30:
        # Phase 1: Unlocking and sliding forward as solid group
        phase_t = ease_in_out(progress / 0.30)
        for name in packed_positions:
            x0, y0 = packed_positions[name]
            x1, y1 = detached_positions[name]
            cur_positions[name] = (
                int(round(x0 + (x1 - x0) * phase_t)),
                int(round(y0 + (y1 - y0) * phase_t))
            )
    else:
        # Phase 2: Separating into individual optical elements
        phase_t = ease_in_out((progress - 0.30) / 0.70)
        for name in detached_positions:
            x0, y0 = detached_positions[name]
            x1, y1 = exploded_positions[name]
            cur_positions[name] = (
                int(round(x0 + (x1 - x0) * phase_t)),
                int(round(y0 + (y1 - y0) * phase_t))
            )
            
    frame = render_frame_composite(cur_positions, current_pan)
    
    # Save as high quality WebP
    out_file = os.path.join(OUTPUT_DIR, f"frame_{i:03d}.webp")
    # OpenCV encode to webp
    cv2.imwrite(out_file, frame, [cv2.IMWRITE_WEBP_QUALITY, 90])
    
    if i % 10 == 0 or i == TOTAL_FRAMES - 1:
        fg_pos = cur_positions['front_glass']
        print(f"  📸 Frame {i:02d}/59: pan={current_pan:3d}px, front_glass=({fg_pos[0]:3d}, {fg_pos[1]:3d})")

print("✨ All 60 continuous physical frames successfully generated!")
