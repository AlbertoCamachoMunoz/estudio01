import os
from PIL import Image

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera-sequence')

img1_path = os.path.join(ASSETS_DIR, 'camera-1-assembled.jpg')
img2_path = os.path.join(ASSETS_DIR, 'camera-2-detached.jpg')
img3_path = os.path.join(ASSETS_DIR, 'camera-3-exploded-aligned.jpg')

img1 = Image.open(img1_path).convert('RGB')
img2 = Image.open(img2_path).convert('RGB')
img3 = Image.open(img3_path).convert('RGB')

# Target size (optimized 16:9 for canvas: 1280x720)
TARGET_SIZE = (1280, 720)
img1 = img1.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
img2 = img2.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
img3 = img3.resize(TARGET_SIZE, Image.Resampling.LANCZOS)

TOTAL_FRAMES = 60

# Ease in-out curve
def ease_in_out(t):
    return t * t * (3 - 2 * t)

print(f"🎬 Generating {TOTAL_FRAMES} photorealistic sequence frames...")

for i in range(TOTAL_FRAMES):
    progress = i / (TOTAL_FRAMES - 1)
    
    if progress <= 0.45:
        # Phase 1: Assembled -> Lens Detached
        sub_t = progress / 0.45
        alpha = ease_in_out(sub_t)
        blended = Image.blend(img1, img2, alpha)
    else:
        # Phase 2: Lens Detached -> Full Exploded Teardown
        sub_t = (progress - 0.45) / 0.55
        alpha = ease_in_out(sub_t)
        blended = Image.blend(img2, img3, alpha)
        
    frame_name = f"frame_{i:03d}.webp"
    frame_path = os.path.join(OUTPUT_DIR, frame_name)
    blended.save(frame_path, 'WEBP', quality=90)
    
    if i % 15 == 0 or i == TOTAL_FRAMES - 1:
        print(f"   📸 Saved {frame_name} (progress={progress:.2f})")

print("✨ All 60 photorealistic frames generated successfully!")
