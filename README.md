# DOORS but in Rezona

เกม 2D Side-Scrolling Horror ที่ดัดแปลงจาก Roblox **DOORS** — เขียนด้วย HTML / CSS / JavaScript ล้วน (ไม่มี build step, ไม่มี dependency) เล่นได้ทันทีผ่านหน้าเว็บ, ฝังใน `<iframe>` ได้ และรองรับทุกอัตราส่วนจอ (portrait มือถือ / Rezona, landscape, ultrawide)

> **สถานะ: Phase 02 — Core Foundation & Environment** (ยังไม่มี Entity ตามแผนงาน)

## เล่น

- GitHub Pages: `https://yahahahau.github.io/Doors-but-in-Rezona-/`
- หน้าทดสอบ iframe หลายอัตราส่วน: `…/frame-test.html`
- รันในเครื่อง: `python3 -m http.server` แล้วเปิด `http://localhost:8000` (ต้องเปิดผ่าน server เพราะใช้ ES modules)

### ฝังใน iframe / Rezona
```html
<iframe src="https://yahahahau.github.io/Doors-but-in-Rezona-/" style="width:100%;aspect-ratio:9/16;border:0" allow="autoplay; fullscreen"></iframe>
```
เกมปรับขนาดตามกล่องที่ครอบ (ResizeObserver) ไม่ใช้ `alert` / navigation, ป้องกัน localStorage ที่ถูกบล็อกใน sandbox และปลดล็อกเสียงเมื่อแตะครั้งแรก

## Deploy & ทดสอบคุณภาพ (GitHub Actions)

ทุกครั้งที่ push ขึ้น `main` workflow `.github/workflows/pages.yml` จะ:
1. ตรวจ syntax ทุกไฟล์ JS
2. รัน `tools/ci-test.mjs` ใน Chromium แบบ headless — เปิดเกม, เดิน, เก็บกุญแจ, **เล่นอัตโนมัติ Door 0→100 หลาย seed**, ตรวจว่าห้องเก่าถูก unload, เช็ค layout แนวตั้ง/แนวนอน/iframe และต้องไม่มี JS error
3. **ถ้าผ่านทั้งหมดเท่านั้น** จึง deploy ขึ้น GitHub Pages (ภาพหน้าจอจากการทดสอบดูได้ใน Artifacts ของแต่ละรัน)

ตั้งค่าครั้งแรก: Settings → Pages → Source = **GitHub Actions**
รันทดสอบในเครื่อง: `npm i --no-save playwright && npx playwright install chromium && node tools/ci-test.mjs`

## การควบคุม

| คีย์บอร์ด | มือถือ | การกระทำ |
|---|---|---|
| A / D หรือ ← / → | ปุ่ม ◀ ▶ | เดิน |
| C / S / ↓ | ปุ่มย่อตัว (กดสลับ) | ย่อตัว (เดินเงียบ) |
| E / Space / Enter | ปุ่มมือใหญ่ | โต้ตอบ (เปิดประตู/ลิ้นชัก, เก็บของ, ซ่อนตู้, ดึงคันโยก) |
| 1–6 | แตะช่องของ | เลือกของ / แตะซ้ำ = ใช้ |
| F | แตะช่องที่เลือกซ้ำ | เปิด/ปิดไฟแช็ก–ไฟฉาย |
| Esc / P | ปุ่ม ❚❚ | หยุดชั่วคราว |

## สิ่งที่มีใน Phase 02

- **ฉาก** วาดแบบ procedural ตามภาพอ้างอิงจากเกมจริง: วอลเปเปอร์ลายข้าวหลามตัด (แดง/ม่วง/เขียว/น้ำเงิน/โรส/มะกอก), wainscot ไม้, เพดานโค้งมีคาน, โคมผนังทองเหลือง, โคมระย้า, ตู้เสื้อผ้า, ชั้นหนังสือ, เตาผิงอิฐ, หน้าต่างฝนตก/ฟ้าแลบ, ต้นไม้กระถางดินเผา, ตู้กุญแจหลังเคาน์เตอร์ ฯลฯ พร้อมเลเยอร์ foreground แบบ parallax
- **ห้อง**: Reception (Door 0), Hallway, Guest Room, Lounge, Study, Small Basement (ปริศนาคันโยก), Library (Door 50 ปริศนาหนังสือ), The Basement (61), Greenhouse (90–98), Door 100 (ลิฟต์จบ) — สุ่มแบบ seed ตามกฎจาก Phase 01 (ห้องมืดตั้งแต่ Door 9, ห้องล็อกพร้อมกุญแจในห้อง ฯลฯ)
- **ระบบประตู 0000–0100**: เลขประตู, เปิด/ปิดมีแอนิเมชัน, ล็อก/กุญแจ/ที่สะเดาะ, ประตูปิดตามหลังและ unload ห้องเก่า (โหลดแค่ห้องปัจจุบัน + ห้องถัดไป)
- **ผู้เล่น (placeholder)**: เร่ง/ชะลอ, ชน, ตรวจพื้น, ย่อตัว, state machine แอนิเมชัน, กล้องตามแบบนุ่ม
- **Gameplay**: ลิ้นชัก/หีบ/ของ, ทอง, กระเป๋า 6 ช่อง (+กุญแจ/หนังสือแยกไม่กินช่อง), ไฟแช็ก (60 วิ), ไฟฉาย (120 วิ, แบต +50%), วิตามิน (8 วิ), ซ่อนในตู้, ระบบ hint สีฟ้าแบบ Guiding Light, เซฟอัตโนมัติทุกประตู
- **บรรยากาศ**: light-map แบบ multiply, ไฟกะพริบ/ไฟใกล้ดับ, ห้องมืด, กรวยไฟฉาย, bloom, ฝุ่นในแสง, ถ่านไฟ, ฟ้าแลบ, vignette, film grain
- **เสียง**: สังเคราะห์ด้วย Web Audio ทั้งหมด (ไม่มีไฟล์เสียง) — ฝีเท้า, ประตูเอี๊ยด, ลิ้นชัก, เหรียญ, ฝน, ฟ้าร้อง, ไฟแตกเปรี๊ยะ, เสียงฮัมไฟฟ้า; แพนซ้าย-ขวาตามตำแหน่ง
- **UI**: เมนูหลัก (เริ่มใหม่ / เล่นต่อ), หยุดชั่วคราว, ตั้งค่า (เสียง 3 ระดับ, ความสว่าง, กราฟิก อัตโนมัติ/ต่ำ/สูง, ปุ่มบนจอ, จอสั่น, FPS), ป้ายเลขประตู, ทอง, hotbar, คำแนะนำการโต้ตอบ, ปุ่มสัมผัส; layout แยก portrait/landscape ไม่บังพื้นที่เล่น

## URL parameters (สำหรับทดสอบ)

| พารามิเตอร์ | ผล |
|---|---|
| `?debug=1` | แสดง FPS + คีย์ทดสอบ: **N** ข้ามไปห้องถัดไป, **L** ไฟกะพริบ (ทดสอบสัญญาณ Rush ในอนาคต), **K** ได้ที่สะเดาะ |
| `?door=50&seed=123` | เริ่มที่ประตูที่กำหนด |
| `?seed=123&autostart=1` | เริ่มเกมใหม่ทันทีด้วย seed นี้ |
| `?touch=1` | บังคับแสดงปุ่มบนจอ |

## โครงสร้าง

```
index.html            จุดเริ่ม (DOM UI + canvas)
frame-test.html       ทดสอบ iframe หลายอัตราส่วน
css/style.css         UI
src/main.js           boot, loop, state (menu/play/pause/end), resize, iframe/visibility
src/core/             const, util (seeded RNG), events (bus), input, audio, save
src/world/            roomGen (กฎสุ่มห้อง), room, roomManager (load/unload), objects (registry)
src/render/           art (วาดฉาก procedural), renderer (layout/camera/tile cache), lighting, particles
src/game/             game (ระบบ gameplay), player, inventory, items
src/ui/ui.js          เมนู HUD hotbar ปุ่มสัมผัส
src/data/doors_rules.js   ตัวเลข/กฎจาก Phase 01
docs/                 เอกสารวิจัย Phase 01 + สถาปัตยกรรม
```

รายละเอียดการต่อยอด (เพิ่มห้อง/ของ/Entity) ดู [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---
โปรเจกต์แฟนเมดเพื่อการเรียนรู้ — DOORS เป็นของ LSPLASH; ไม่มีการใช้ asset ของเกมต้นฉบับ (ภาพและเสียงสร้างด้วยโค้ดทั้งหมด)
