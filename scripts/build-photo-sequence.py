import os
import cv2
import numpy as np

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'camera-sequence')
os.makedirs(OUTPUT_DIR, exist_ok=True)

TW, TH = 1280, 720
TOTAL_FRAMES = 60

print(f"🎬 Building {TOTAL_FRAMES} high-precision 3D elliptical layer teardown frames...")

bg_clean = cv2.imread(os.path.join(ASSETS_DIR, 'camera-3-body-clean.jpg'))
im3 = cv2.imread(os.path.join(ASSETS_DIR, 'camera-3-exploded.jpg'))
if bg_clean is None or im3 is None:
    raise FileNotFoundError("Missing camera-3-body-clean.jpg or camera-3-exploded.jpg")

h, w = im3.shape[:2]  # 768 x 1376

# 1. Build wide studio stage (width = 1376 + 220 = 1596) using ONLY clean background/floor from x=180..440 (no camera body!)
EXT_W = 220
stage_open = np.zeros((h, w + EXT_W, 3), dtype=np.uint8)
stage_open[:, :w] = bg_clean

# Clean background + floor patch from x=180..180+EXT_W+40 (completely free of camera body)
clean_ext_patch = bg_clean[:, 180:180 + EXT_W + 40].astype(np.float32)
# Smoothly match vertical luminance profile of right border (x = w-20..w)
right_border_profile = cv2.GaussianBlur(np.mean(bg_clean[:, w - 20:w].astype(np.float32), axis=1, keepdims=True), (1, 101), 0)
patch_border_profile = cv2.GaussianBlur(np.mean(clean_ext_patch[:, :20], axis=1, keepdims=True), (1, 101), 0)
right_ext = np.clip(clean_ext_patch + (right_border_profile - patch_border_profile), 0, 255)

# Smoothly blend across the 40px transition seam at x = w - 40 .. w
for dx in range(40):
    alpha = dx / 40.0
    x_d = w - 40 + dx
    stage_open[:, x_d] = ((1.0 - alpha) * bg_clean[:, x_d].astype(np.float32) + alpha * right_ext[:, dx]).astype(np.uint8)
stage_open[:, w:] = right_ext[:, 40:].astype(np.uint8)

# 2. Build stage_mounted (where the open chrome mount reflection on the floor is replaced by clean shadowed carbon weave)
stage_mounted = stage_open.copy()
clean_floor_patch = bg_clean[520:768, 380:660].astype(np.float32) * 0.68
refl_mask = np.zeros((768 - 520, 280), dtype=np.float32)
cv2.ellipse(refl_mask, (140, 130), (125, 115), 0, 0, 360, 1.0, -1)
refl_mask = cv2.GaussianBlur(refl_mask, (41, 41), 0)[:, :, None]
roi_f = stage_mounted[520:768, 835:1115].astype(np.float32)
stage_mounted[520:768, 835:1115] = (roi_f * (1.0 - refl_mask) + clean_floor_patch * refl_mask).astype(np.uint8)


def make_cylinder_mask(shape, c1, axes1, c2, axes2, angle, inner_c=None, inner_axes=None):
    pts1 = cv2.ellipse2Poly(c1, axes1, angle, 0, 360, 1)
    pts2 = cv2.ellipse2Poly(c2, axes2, angle, 0, 360, 1)
    all_pts = np.vstack([pts1, pts2])
    hull = cv2.convexHull(all_pts)
    mask = np.zeros(shape[:2], dtype=np.uint8)
    cv2.fillConvexPoly(mask, hull, 255, cv2.LINE_AA)
    if inner_c is not None and inner_axes is not None:
        cv2.ellipse(mask, inner_c, inner_axes, angle, 0, 360, 0, -1, cv2.LINE_AA)
    return mask


def radial_valid_complete(img, target_mask, valid_mask, center, axes, angle_deg):
    out = img.copy()
    cx, cy = center
    a, b = axes
    theta = np.deg2rad(angle_deg)
    cos_t, sin_t = np.cos(theta), np.sin(theta)

    bad_mask = cv2.subtract(target_mask, valid_mask)
    ys_bad, xs_bad = np.where(bad_mask > 0)
    if len(xs_bad) == 0:
        return out

    ys_val, xs_val = np.where(valid_mask > 0)

    def to_polar(xs, ys):
        dx = xs - cx
        dy = ys - cy
        rx = dx * cos_t + dy * sin_t
        ry = -dx * sin_t + dy * cos_t
        r = np.sqrt((rx / float(a)) ** 2 + (ry / float(b)) ** 2)
        phi = np.arctan2(ry / float(b), rx / float(a))
        return r, phi

    val_r, val_phi = to_polar(xs_val, ys_val)
    bad_r, bad_phi = to_polar(xs_bad, ys_bad)
    val_colors = img[ys_val, xs_val]

    for i in range(len(xs_bad)):
        ri = bad_r[i]
        # Offset angle by 40 deg (9-blade symmetry) so we sample interior crisp texture, not edge pixels!
        target_phi = bad_phi[i] + 0.70
        dr = np.abs(val_r - ri)
        cand = np.where(dr < 0.03)[0]
        if len(cand) == 0:
            cand = np.argsort(dr)[:15]
        dphi = np.abs(np.arctan2(np.sin(val_phi[cand] - target_phi), np.cos(val_phi[cand] - target_phi)))
        best = cand[np.argmin(dphi)]
        out[ys_bad[i], xs_bad[i]] = val_colors[best]

    # Feather ONLY the 2px boundary seam of bad_mask, keeping interior 100% sharp!
    blur = cv2.GaussianBlur(out, (3, 3), 0)
    seam = cv2.dilate(bad_mask, np.ones((3, 3), np.uint8)) - cv2.erode(bad_mask, np.ones((3, 3), np.uint8))
    out[seam > 0] = blur[seam > 0]
    return out


b_ch, g_ch, r_ch = cv2.split(im3)
gray3 = cv2.cvtColor(im3, cv2.COLOR_BGR2GRAY)

# Prepare the 6 precision optical component layers
# 1. Front Ring & Aspherical Glass (OPTICA CINE 35mm T1.5)
m1 = make_cylinder_mask(im3.shape, (228, 512), (91, 164), (290, 495), (98, 166), -8)
p1_img = im3.copy()

# 2. Geared Focus Barrel
m2_front = make_cylinder_mask(im3.shape, (378, 474), (92, 158), (425, 462), (104, 165), -10)
m2_rear = make_cylinder_mask(im3.shape, (425, 462), (104, 165), (484, 448), (108, 163), -10)
m2_hole = make_cylinder_mask(im3.shape, (362, 476), (52, 95), (372, 474), (54, 96), -10)
m2 = cv2.subtract(cv2.bitwise_or(m2_front, m2_rear), m2_hole)
is_not_red = ((r_ch.astype(int) - g_ch.astype(int)) < 15).astype(np.uint8) * 255
valid_m2 = cv2.bitwise_and(m2, is_not_red)
valid_m2 = cv2.subtract(valid_m2, cv2.dilate(m1, np.ones((9, 9), np.uint8)))
p2_img = radial_valid_complete(im3, m2, valid_m2, (425, 462), (104, 165), -10)

# 3. Crimson Red Anodized Cine Ring
m3_outer = make_cylinder_mask(im3.shape, (574, 426), (106, 147), (602, 422), (110, 147), -13)
m3_inner = make_cylinder_mask(im3.shape, (574, 427), (82, 115), (590, 424), (86, 116), -13)
m3 = cv2.subtract(m3_outer, m3_inner)
is_red = ((r_ch.astype(int) - g_ch.astype(int)) > 22).astype(np.uint8) * 255
valid_m3 = cv2.bitwise_and(m3, cv2.subtract(is_red, cv2.dilate(m2_rear, np.ones((7, 7), np.uint8))))
p3_img = radial_valid_complete(im3, m3, valid_m3, (588, 424), (108, 147), -13)

# 4. Grey Metallic 9-Blade Aperture Iris
m4 = make_cylinder_mask(im3.shape, (656, 412), (72, 114), (674, 408), (74, 114), -13)
m3_obstacle = cv2.dilate(m3, np.ones((9, 9), np.uint8))
valid_m4 = cv2.subtract(m4, cv2.bitwise_or(m3_obstacle, cv2.dilate(m2_rear, np.ones((7, 7), np.uint8))))
p4_img = radial_valid_complete(im3, m4, valid_m4, (665, 410), (73, 114), -13)
p4_gray = cv2.cvtColor(p4_img, cv2.COLOR_BGR2GRAY)
p4_neutral = cv2.merge([p4_gray, p4_gray, p4_gray])
reconstructed_band = cv2.subtract(m4, valid_m4)
p4_img[reconstructed_band > 0] = p4_neutral[reconstructed_band > 0]

# 5. Blue-Green Biconvex Rear Glass
m5 = make_cylinder_mask(im3.shape, (792, 390), (50, 79), (802, 388), (52, 79), -12)
p5_img = im3.copy()

# 6. Chrome Stainless Steel Bayonet Flange
m6_outer = make_cylinder_mask(im3.shape, (870, 372), (84, 124), (888, 370), (86, 124), -14)
m6_inner = make_cylinder_mask(im3.shape, (868, 374), (56, 87), (878, 372), (56, 87), -14)
m6 = cv2.subtract(m6_outer, m6_inner)
valid_m6 = cv2.subtract(m6, cv2.dilate(m5, np.ones((9, 9), np.uint8)))
p6_img = radial_valid_complete(im3, m6, valid_m6, (880, 371), (85, 124), -14)

# Extract additive floor reflection layer from im3 vs bg_clean (for y = 520..768)
refl_diff_full = cv2.subtract(im3, bg_clean)
# Zero out above y=525 and right of x=920 so only the floating pieces' floor reflections are included
refl_diff_full[:525, :] = 0
refl_diff_full[:, 920:] = 0
refl_diff_full = cv2.GaussianBlur(refl_diff_full, (5, 5), 0)

layers = []
for name, pimg, pmask, dock_dx, dock_dy, rx1, rx2 in [
    ('p6_flange', p6_img, m6, 100, -2, 635, 830),
    ('p5_glass',  p5_img, m5, 169, -15, 525, 640),
    ('p4_iris',   p4_img, m4, 315, -34, 0, 0),
    ('p3_red',    p3_img, m3, 367, -46, 370, 530),
    ('p2_barrel', p2_img, m2, 456, -66, 0, 0),
    ('p1_front',  p1_img, m1, 544, -86, 120, 370),
]:
    ys, xs = np.where(pmask > 0)
    x1, x2, y1, y2 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
    alpha_f = (cv2.GaussianBlur(pmask[y1:y2 + 1, x1:x2 + 1], (3, 3), 0).astype(np.float32) / 255.0)[:, :, None]
    
    # Floor reflection patch for this piece with smooth 2D cosine feather window
    if rx2 > rx1:
        r_patch = refl_diff_full[525:768, rx1:rx2].astype(np.float32)
        rh, rw = r_patch.shape[:2]
        wy = np.ones((rh, 1), dtype=np.float32)
        wy[:45, 0] = np.linspace(0.0, 1.0, 45)
        wx = np.ones((1, rw), dtype=np.float32)
        fade_x = min(30, rw // 4)
        wx[0, :fade_x] = np.linspace(0.0, 1.0, fade_x)
        wx[0, -fade_x:] = np.linspace(1.0, 0.0, fade_x)
        r_patch = (r_patch * (wy * wx)[:, :, None]).astype(np.uint8)
    else:
        r_patch = None
    
    layers.append({
        'name': name,
        'rgb': pimg[y1:y2 + 1, x1:x2 + 1],
        'alpha': alpha_f,
        'exp_x': x1,
        'exp_y': y1,
        'dock_x': x1 + dock_dx,
        'dock_y': y1 + dock_dy,
        'w': x2 - x1 + 1,
        'h': y2 - y1 + 1,
        'refl_rgb': r_patch,
        'refl_x': rx1,
        'refl_w': rx2 - rx1
    })


def ease_in_out(t):
    return t * t * (3.0 - 2.0 * t)


# Scale factor to fit 1280x720 with balanced margins
SCALE = 0.935  # 1376 * 0.935 = 1286, 768 * 0.935 = 718

for i in range(TOTAL_FRAMES):
    progress = i / (TOTAL_FRAMES - 1.0)
    
    # Blend background floor mount reflection as the lens uncouples and separates
    refl_open_t = np.clip((progress - 0.08) / 0.35, 0.0, 1.0)
    refl_open_t = ease_in_out(refl_open_t)
    canvas = cv2.addWeighted(stage_mounted, 1.0 - refl_open_t, stage_open, refl_open_t, 0)
    bh, bw = canvas.shape[:2]

    # Render each optical component and its moving floor reflection
    for L in layers:
        det_x = L['dock_x'] - 105
        det_y = L['dock_y'] + 19
        if progress <= 0.30:
            t = ease_in_out(progress / 0.30)
            px = int(round(L['dock_x'] + (det_x - L['dock_x']) * t))
            py = int(round(L['dock_y'] + (det_y - L['dock_y']) * t))
            refl_strength = 0.25 + 0.35 * t
        else:
            t = ease_in_out((progress - 0.30) / 0.70)
            px = int(round(det_x + (L['exp_x'] - det_x) * t))
            py = int(round(det_y + (L['exp_y'] - det_y) * t))
            refl_strength = 0.60 + 0.40 * t

        # 1. Add moving floor reflection at horizontal offset (px - L['exp_x'])
        if L['refl_rgb'] is not None:
            curr_rx = L['refl_x'] + (px - L['exp_x'])
            rx1_d = max(0, curr_rx)
            rx2_d = min(bw, curr_rx + L['refl_w'])
            if rx2_d > rx1_d:
                rx1_s = rx1_d - curr_rx
                rx2_s = rx1_s + (rx2_d - rx1_d)
                r_slice = (L['refl_rgb'][:, rx1_s:rx2_s].astype(np.float32) * refl_strength).astype(np.uint8)
                canvas[525:768, rx1_d:rx2_d] = cv2.add(canvas[525:768, rx1_d:rx2_d], r_slice)

        # 2. Composite solid optical piece
        x1_s = max(0, -px)
        y1_s = max(0, -py)
        x2_s = min(L['w'], bw - px)
        y2_s = min(L['h'], bh - py)
        if x2_s > x1_s and y2_s > y1_s:
            x1_d, y1_d = max(0, px), max(0, py)
            x2_d, y2_d = x1_d + (x2_s - x1_s), y1_d + (y2_s - y1_s)
            roi = canvas[y1_d:y2_d, x1_d:x2_d].astype(np.float32)
            a = L['alpha'][y1_s:y2_s, x1_s:x2_s]
            c = L['rgb'][y1_s:y2_s, x1_s:x2_s].astype(np.float32)
            canvas[y1_d:y2_d, x1_d:x2_d] = (roi * (1.0 - a) + c * a).astype(np.uint8)

    # Smooth camera viewport pan:
    # At Frame 0 (assembled): crop starts at x_pan = 165 (centers mounted camera in 1280x720)
    # At Frame 59 (exploded): crop starts at x_pan = 5 (centers full exploded teardown in 1280x720)
    pan_t = ease_in_out(progress)
    crop_x = int(round(165 * (1.0 - pan_t) + 5 * pan_t))
    crop_w = int(round(TW / SCALE))  # 1369px
    
    cropped = canvas[:, crop_x:crop_x + crop_w]
    resized = cv2.resize(cropped, (TW, int(round(h * SCALE))), interpolation=cv2.INTER_LANCZOS4)
    
    # Pad vertically by 1px top/bottom to exact 1280x720
    final_frame = np.zeros((TH, TW, 3), dtype=np.uint8)
    y_off = (TH - resized.shape[0]) // 2
    final_frame[y_off:y_off + resized.shape[0], :] = resized
    if y_off > 0:
        final_frame[:y_off, :] = resized[0:1, :]
        final_frame[y_off + resized.shape[0]:, :] = resized[-1:, :]

    out_path = os.path.join(OUTPUT_DIR, f"frame_{i:03d}.webp")
    cv2.imwrite(out_path, final_frame, [cv2.IMWRITE_WEBP_QUALITY, 92])

    if i in (0, 18, 39, 59):
        print(f"  📸 Saved frame_{i:03d}.webp (progress={progress:.2f}, crop_x={crop_x})")

print("✨ All 60 precision frames generated!")
