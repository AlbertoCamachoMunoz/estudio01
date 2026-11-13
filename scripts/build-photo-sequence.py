import os
from PIL import Image

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera-sequence')

TW, TH = 1280, 720
TOTAL_FRAMES = 60
SCALE = 0.88 # Calibrated scale for generous margins on all sides

print(f"🎬 Building {TOTAL_FRAMES} calibrated frames with dynamic camera panning & zero clipping...")

im1_raw = Image.open(os.path.join(ASSETS_DIR, 'camera-1-assembled.jpg')).convert('RGB')
im2_raw = Image.open(os.path.join(ASSETS_DIR, 'camera-2-detached.jpg')).convert('RGB')
im3_raw = Image.open(os.path.join(ASSETS_DIR, 'camera-3-exploded.jpg')).convert('RGB')

sw, sh = int(1376 * SCALE), int(768 * SCALE) # 1210 x 675

im1_s = im1_raw.resize((sw, sh), Image.Resampling.LANCZOS)
im2_s = im2_raw.resize((sw, sh), Image.Resampling.LANCZOS)
im3_s = im3_raw.resize((sw, sh), Image.Resampling.LANCZOS)

def make_canvas(img, px, py):
    """Pastes img onto a 1280x720 canvas with seamless background extension on borders."""
    c = Image.new('RGB', (TW, TH), (8, 10, 16))
    c.paste(img, (px, py))
    
    # Extend bottom if py + img.height < TH
    bottom_y = py + img.height
    if bottom_y < TH:
        strip = img.crop((0, img.height - 10, img.width, img.height))
        for y_fill in range(bottom_y, TH, 10):
            c.paste(strip, (px, y_fill))
            
    # Extend left if px > 0
    if px > 0:
        left_strip = img.crop((0, 0, 10, img.height))
        for x_fill in range(0, px, 10):
            c.paste(left_strip, (x_fill, py))
            
    # Extend right if px + img.width < TW
    if px + img.width < TW:
        right_strip = img.crop((img.width - 10, 0, img.width, img.height))
        for x_fill in range(px + img.width, TW, 10):
            c.paste(right_strip, (x_fill, py))
            
    return c

# Build the master state 3 composite (at shift_x=215 for im2, shift_x=20 for im3)
c2_final = make_canvas(im2_s, 215, 22)
c3_final = make_canvas(im3_s, 20, 22)

mask = Image.new('L', (TW, TH), 0)
pix_m = mask.load()
for y in range(TH):
    for x in range(TW):
        if x < 730:
            pix_m[x, y] = 255
        elif x > 790:
            pix_m[x, y] = 0
        else:
            pix_m[x, y] = int((1.0 - (x - 730) / 60.0) * 255)

state3_composite = Image.composite(c3_final, c2_final, mask)
state3_composite.save(os.path.join(ASSETS_DIR, 'camera-3-exploded-aligned.jpg'), 'JPEG', quality=95)

# Smooth ease in-out
def ease_in_out(t):
    return t * t * (3 - 2 * t)

# Camera body trajectory:
# Start position: px = 0 (perfectly centered assembled camera in Frame 0)
# End position: px = 215 (camera body shifted right in Frame 59, making 140px margin on left for exploded optics)
START_PX = 0
END_PX = 215

for i in range(TOTAL_FRAMES):
    progress = i / (TOTAL_FRAMES - 1.0)
    
    # Calculate smooth camera pan across all 60 frames
    pan_t = ease_in_out(progress)
    current_px = int(START_PX + (END_PX - START_PX) * pan_t)
    
    if progress <= 0.35:
        # Phase 1: Assembled -> Detached
        sub_t = ease_in_out(progress / 0.35)
        c1 = make_canvas(im1_s, current_px, 22)
        c2 = make_canvas(im2_s, current_px, 22)
        frame = Image.blend(c1, c2, sub_t)
    else:
        # Phase 2: Detached -> Full Exploded View
        sub_t = ease_in_out((progress - 0.35) / 0.65)
        
        # c2 at current_px
        c2 = make_canvas(im2_s, current_px, 22)
        
        # State 3 is aligned to END_PX (215). To align its camera body with current_px:
        # shift it by (current_px - END_PX)
        dx_shift = current_px - END_PX
        c3_cur = Image.new('RGB', (TW, TH), (8, 10, 16))
        c3_cur.paste(state3_composite, (dx_shift, 0))
        
        # If dx_shift < 0, extend right edge smoothly
        if dx_shift < 0:
            right_strip = state3_composite.crop((TW - 15, 0, TW, TH))
            for rx in range(TW + dx_shift, TW, 10):
                c3_cur.paste(right_strip, (rx, 0))
                
        frame = Image.blend(c2, c3_cur, sub_t)
        
    frame_name = f"frame_{i:03d}.webp"
    frame_path = os.path.join(OUTPUT_DIR, frame_name)
    frame.save(frame_path, 'WEBP', quality=90)
    
    if i % 15 == 0 or i == TOTAL_FRAMES - 1:
        print(f"   📸 Saved {frame_name} (progress={progress:.2f}, pan_px={current_px})")

print("✨ All 60 calibrated, unclipped frames generated successfully!")
