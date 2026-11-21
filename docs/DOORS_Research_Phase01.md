# DOORS but in Rezona — Phase 01 Research Document
**ขอบเขต:** DOORS (Roblox) ช่วง Door 0–100 (The Hotel) · **วันที่ค้นคว้า:** 21 พ.ย. 2026 · **ผู้ค้นคว้า:** Claude
**สถานะ:** Research เท่านั้น — ไม่มีการเขียนโค้ดเกม / ออกแบบฉาก / สร้างภาพ

**สัญลักษณ์ความน่าเชื่อถือที่ใช้ทั้งเอกสาร**

| สัญลักษณ์ | ความหมาย |
|---|---|
| ✔ | ยืนยันจาก DOORS Wiki (หน้าที่ดึงมาอ่านจริง) |
| ⚠ | แหล่งข้อมูลขัดแย้งกัน — แสดงทั้งสองค่า |
| ❓ | ไม่พบข้อมูล / wiki ไม่ระบุตัวเลข — **ห้ามเดา ต้องตัดสินใจเองตอนพัฒนา** |
| 🔸 | แหล่งรอง (บล็อก/เว็บไกด์) ใช้ตรวจสอบไขว้เท่านั้น |

> ข้อมูลนี้อิงเวอร์ชันล่าสุดที่ wiki บันทึก (หลัง Mines Update 30 ส.ค. 2024 และ Outdoors Update 10 ส.ค. 2025) เกมถูกปรับบ่อย ค่าเก่าใส่ไว้เป็น "(เก่า)" เมื่อ wiki ระบุ

---

## 0. รายงานความคืบหน้า Research

| หัวข้อ | สถานะ | หมายเหตุ |
|---|---|---|
| ภาพรวมเกม / โครงสร้าง Hotel | ✅ เสร็จ | |
| ห้องคงที่ Door 0–100 | ✅ เสร็จ | ห้องส่วนใหญ่ **สุ่ม** ไม่มีตาราง "Door ละห้อง" ตายตัว (ดู §2.1) |
| Entity ใน Hotel (18 ตัว + NPC 3) | ✅ เสร็จ | ตัวเลข spawn% หลายตัวไม่มีบน wiki |
| ระบบ Gameplay หลัก | ✅ เสร็จ | |
| ไอเทม | 🟡 บางส่วน | ไม่ได้ข้อมูล Crucifix/Lockpick/Battery/Bandage จากหน้าโดยตรง ใช้แหล่งรองประกอบ |
| Lore | 🟡 บางส่วน | หน้า Lore ดึงไม่ได้ (error) ได้เฉพาะหน้า Three Architects |
| ตัวเลขดิบ (studs/s ของ Figure/Seek/Halt, hitbox) | ❌ ไม่มีบน wiki | ต้องตั้งค่าเอง (ดู §13) |
| ภาพ Screenshot | 🟡 เป็นรายการหน้าอ้างอิง | ดาวน์โหลดภาพจาก shell ไม่ได้ (ดู §11) |

**แหล่งที่ใช้หลัก:** DOORS Wiki (doors-game.fandom.com) — ดูรายการ URL ทั้งหมดที่ §14

---

## 1. Game Overview

- DOORS เป็นเกมสยองขวัญบน Roblox ผู้เล่นเปิดประตูที่ไล่เลขตั้งแต่ **Door 0 (Reception) ถึง Door 100 (Electrical Room)** ✔
- แรงบันดาลใจ: Roblox Experience *Rooms* (nicorocks5555) และ Spooky's Jump Scare Mansion 🔸 — Rush มีกลไกอิงจาก A-60 ของ Rooms ✔
- Hotel เป็น floor 1 ของ DOORS; Door 100 คือลิฟต์ไป The Mines (floor 2) ✔
- ห้องถูก **สร้างแบบสุ่ม** ตามกฎ (เช่น ห้องมืดเริ่มได้ตั้งแต่ Door 9) แต่มีห้องบังคับตายตัวไม่กี่ห้อง ✔
- ผู้เล่นเริ่มด้วย HP 100, ไม่ฟื้นเลือดเอง (ยกเว้น Green Herb) ✔
- Entity "รับประกันทุกรัน" ตาม wiki: Guiding Light, Figure, Seek, Rush, Jeff, El Goblino, Bob, Snare (Greenhouse) ✔ (Seek มีโอกาสไม่เกิดน้อยมาก ⚠)

**วงจรหลักของ 1 รัน:** เปิดประตู → ห้องใหม่สุ่ม → หาของ/กุญแจ → เจอ Entity (หลบ/ผ่าน) → ประตูถัดไป → … → Door 50 Library (Figure) → Door 52 Jeff Shop → … → Greenhouse → Door 100 (หนี Figure ด้วยลิฟต์)

---

## 2. Room Database — Door 0–100

### 2.1 ข้อเท็จจริงสำคัญก่อนอ่านตาราง
Hotel **ไม่ใช่เลเวลตายตัว 100 ห้อง** ✔ — มีเพียง 4 ห้องล็อกตำแหน่งเป๊ะ (Door 0, 50, 61, 100) ส่วนที่เหลือเป็น "ช่วงที่อาจเกิด" หรือห้องทั่วไปสุ่ม ดังนั้น "ฐานข้อมูล Door 1–100" ที่ทำได้จริงคือ **ตารางช่วง + กฎ generation** ไม่ใช่รายห้อง 100 แถว

### 2.2 ห้อง/ช่วงที่กำหนดแน่นอน

| Door | ห้อง | หมายเหตุ | ความมั่นใจ |
|---|---|---|---|
| 0 | The Reception | Room Key "0001" แขวนผนังหลังเคาน์เตอร์ (เป็น key เดียวที่ตำแหน่งตายตัว) · ลิฟต์ 3 ตัวหันหน้าเคาน์เตอร์ · กระดิ่งพังหลังตี 10 ครั้ง · ตายที่นี่ revive ฟรี | ✔ |
| 3–89 | The Dining Hall (ห้อง Halt) | ⚠ ช่วงต่างกันตามหน้า: Hotel page = 3–89; Dining Hall page = Door 1–87; Halt page = เริ่มได้ตั้งแต่ Door 1 | ⚠ |
| 25– | Seek Crescendo (ตาดำเริ่มโผล่) | เริ่มเร็วสุด Door 25 ยาว 2–5 ห้อง | ✔ |
| 29–42 หรือ 30–40 | Seek Chase #1 | ⚠ Seek page: 29–42, ยาว 6 ห้อง · Hotel page: 30–40 + 5 ห้อง | ⚠ |
| 49 | Pre-Library | มี Alarm Clock บนโต๊ะ | ✔ |
| **50** | **The Library** | ล็อกที่ Door 50 เสมอ · Figure ครั้งแรก | ✔ |
| 51 | ห้องหลัง Library | ผ่านได้หลังใส่รหัสถูก | ✔ |
| 52 (หรือ 53–59) | Jeff Shop | ⚠ Hotel page ขัดแย้งในตัวเอง (บอก 52 และ 53–59) · Safe zone | ⚠ |
| 60 | ทางเข้า The Rooms (ห้องพัง มีประตูรั้ว) | เปิดด้วย lever ของ Basement · ต้องใช้ Skeleton Key ที่ประตู (the Rooms entrance) | ✔ |
| **61** | **The Basement** (มืดเสมอ) | ล็อก Door 61 · lever สุ่มบนผนัง · Guiding Light ไฮไลต์หลังรอประมาณ 1 นาที | ✔ |
| 65–69 | Pre-Infirmary | | ✔ |
| 66–70 | The Infirmary | เกิดครั้งเดียว/รัน (หน้า Infirmary ไม่ระบุช่วง 66–70 เป๊ะ ⚠) | ⚠ |
| 69–75 หรือ 70–80 | Seek Chase #2 | ⚠ ยาว 6 ห้อง (5 ห้อง maze + Grand Hallway) · ยากกว่า #1 | ⚠ |
| 70–88 | Lounge | "มักเกิด" ช่วงนี้ แต่เกิดเมื่อไรก็ได้ | ✔ |
| 82 | Ambush เกิดบ่อยสุด | "เกือบทุกครั้งตั้งแต่ Floor 2 update" | ✔ |
| 88 | Pre-Courtyard | | ✔ |
| 89 | The Courtyard | เกิดหลัง Seek #2 · safe zone เกือบสมบูรณ์ | ✔ |
| 90–98 | The Greenhouse | มืดสนิท 100% | ✔ |
| 99 | Electrical Room Entrance | ห้องพิเศษใน Greenhouse | ✔ |
| **100** | **The Electrical Room** | Circuit Breaker puzzle + Mining Elevator | ✔ |
| 101 | มีอยู่แต่เข้าถึงได้เฉพาะ exploit/Admin Panel | | ✔ |

### 2.3 ห้องสุ่ม / ห้องพิเศษ — กฎการเกิด

| ห้อง/ประเภท | Door เริ่มเร็วสุด | กฎ | ✔/⚠ |
|---|---|---|---|
| L-shape + sub-room (locked) | 1 | ล็อกได้ | ✔ |
| ทางเดินยาว + ห้องเล็ก 8 ห้อง (locked) | 4 | | ✔ |
| ทางแยกบวก + ห้องเล็ก 4 ห้อง (locked) | 5 | | ✔ |
| ทางเดิน + Window Suite (locked) | 10 | | ✔ |
| T-junction ทางกลางตัน (locked) | 18 | | ✔ |
| Small Basement | 5 | หลัง Backdoor update รับประกัน 2 ห้อง/รัน · มีประตูรั้ว+lever+vent 1 ช่อง | ✔ |
| Dark Room | 9 (Door 2 ถ้ามี modifier Electrical Work/Lights Out) | ไม่เกิดที่ Library Entrance · ไม่เกิดทันทีหลัง Seek chase ทั้งสอง | ✔ |
| Ruined Room | 53 | เกิดหลัง Library เท่านั้น | ✔ |
| Blood Room | 1–100 | ต้องมี Jack เกิดหลังประตู ≈ **1/2000** | ✔ |
| Meeting Room (Painting Puzzle) | 10 | โอกาสเกิด **2%** · ไม่เกิน 1 ครั้ง/รัน | ✔ |
| Grand Hallway | — | ปรากฏอย่างน้อย **3 ครั้ง/รัน** (ที่ท้าย chase มีเวอร์ชันแก้ไข) | ✔ |
| Room of Closets | — | เกิดตู้ **12 ใบ** ทุกครั้งที่เข้า | ✔ |
| Office, Hidden Corridor, Door Corridor, Window Suite, Skeleton Key Room | — | ไม่มีช่วงตายตัวบน wiki | ❓ |

### 2.4 รายละเอียดห้องสำคัญ

**The Reception (Door 0)** ✔
- ชื่ออื่น Room 0 / Room 0000; ธีมโรงแรมวิคตอเรียน/โกธิกต้นศตวรรษที่ 20
- เฟอร์นิเจอร์/ตู้/ของตกแต่ง **สุ่มทุกรัน**; Rift (ฝากไอเทมข้ามรัน) ปรากฏใกล้ Room Key ถ้าเคยฝากไว้
- Timothy จากลิ้นชักได้; Sally (Window) เกิดได้ในห้องนี้ ⚠ (Sally page ระบุ "ยกเว้น Reception" — wiki Reception ระบุว่า Window เกิดได้ ขัดกัน)
- ถ้า Rush ถูกเรียกใน 4 ห้องแรกแล้วกลับมาห้องนี้ จะ "ไม่เป็นอันตรายประมาณ 3 วินาที" แล้วฆ่า

**The Library (Door 50)** ✔
- ชั้นล่าง: ชั้นหนังสือเป็นแถว, โต๊ะใหญ่, โซฟา+โต๊ะพร้อมนาฬิกาปลุก, โต๊ะทำงานพร้อม Solution Paper; ชั้นบน (balcony) = ทางออก · บันไดสองข้าง **ปิดหนึ่งข้าง สุ่มซ้าย/ขวา**
- **หนังสือ 8 เล่ม** (ซ่อนบนชั้นล่างสุด 3 ชั้นของตู้หนังสือ) แต่ใช้เป็นรหัส **5 ตัวเลข**; เล่มที่ 8 ที่เก็บเป็นตัวเลขหลักสุดท้ายเสมอ · เก็บแล้วแสดงเลข+รูปทรง (shape) แล้วใส่ที่ Solution Paper
- ล็อกอยู่ปลายห้อง; ลองกดล็อกทำเสียงดึง Figure
- Cutscene: โคมไฟล้ม (Guiding Light) → Figure เดินเข้าไปทุบโคม → เริ่มเดินตรวจ
- **Super Hard Mode:** 15 เล่ม ใช้จริง 10 ตัว · Figure เร็วขึ้นเมื่อเก็บ 9–15 เล่ม
- Door 51 เปิดแล้วทุกคนที่รอดออกได้; Guiding Light ปิดประตูผนึกด้วย hexagram; คนที่ตกค้างถูก Void ย้ายไป Door 51 (หลัง Floor 2 update)
- (เก่า) ก่อน Floor 2: หลัง Door 51 เปิด Figure ไล่ล่าด้วยความเร็วประมาณ 2× เดินปกติ และฆ่าคนในตู้อัตโนมัติ

**Jeff Shop (Door 52 / 53–59)** ✔ — safe zone ที่มี NPC เป็นมิตรทั้งหมด (Jeff, El Goblino, Bob) · มีเพลงร้านดังเบา ๆ ที่ Door 51 · ถ้า Rush/Ambush เกิดขึ้น ร้านปิด (Jeff หายไป ประตูเหล็กแทน ของหายหมด) · Rush เกือบรับประกันเกิดภายในไม่กี่ประตูหลังร้าน

**The Basement (Door 61)** ✔ — เขาวงกตมืด มีประตูรั้วหลายบาน, vent 3 ช่อง, ต้องดึง lever (สุ่มผนัง มักไกลบันได) เพื่อเปิดทุกรั้วรวมทั้งรั้ว Door 60 · ซ่อนในห้องนี้กัน Rush/Ambush ได้ · Screech เกิดได้แต่ "น้อยกว่าห้องมืดปกติ"

**The Infirmary** ✔ — ห้องใหญ่ 2 โซน เตียง+ลิ้นชักสองข้าง · vitamins พบบ่อย/แทบรับประกันหลัง Mines Update · ประตูลับด้านเตียงซ้ายนำไปทางเดินยาวมีหีบเยอะ · **Skeleton Key Room**: ประตูมีสัญลักษณ์กะโหลก, ลิ้นชักมีเหรียญมาก, Green Herb บนโต๊ะ (ฟื้น HP เมื่อมีแผล) · ศัตรูอันตรายเกิดน้อย (ถือเป็น rest zone) · หลัง Hunt update ซ่อนใต้เตียงไม่ได้

**The Courtyard (Door 89)** ✔ — พื้นที่กลางแจ้ง: ทางหินมีหลังคา+โคมไฟ, สวนสองส่วน, รูปปั้นนางฟ้า+ฐานจารึก (Wingdings), ตู้ 6 ใบ + ตู้สวน (มี Shears) · Basement ลับใต้ประตูกลเถาวัลย์ต้องใช้ Shears (มีเหรียญมาก + Snare) · Eyes เกิดกลางห้องได้ · Rush/Ambush ที่ผ่านทำไฟ "ติดแต่ไม่สว่าง" ไม่แตก · พายุสงบกว่าด้านในโรงแรม

**The Greenhouse (Door 90–99)** ✔
- มืดสนิทตลอด ไม่มีไฟ; 3 layout: สี่เหลี่ยม 1 + รูปตัว L 2 (ประตูซ้าย/ขวา) · ตู้ (closet) แบบชนบท โดยมากสองใบทางขวาของทางเข้า
- ไม่มีโต๊ะ/ตู้ → **ไม่มีไอเทมเกิด** ยกเว้น Crucifix บนผนัง · ไม่มีประตูล็อก
- Rush ไม่มีแสงเตือน (ใช้เสียง+แสงที่ถือ) · ฝนตกหนักกลบเสียง Rush · Rush + Eyes เกิดบ่อยกว่าที่อื่น · Ambush **ไม่เกิด** · Snare 1–3/ห้อง · Screech เกิดได้
- หลังเปิดประตูแรกของ Greenhouse **revive ไม่ได้** (ถ้าไม่ใช้ exploit)

**The Electrical Room (Door 100)** ✔ — รายละเอียดใน §7.2

---

## 3. Entity Encyclopedia

> รูปแบบต่อ Entity: **ข้อมูลทั่วไป → การปรากฏ → วิธีรับมือ → เพิ่มเติม → กลุ่ม 2D**
> ตัวเลข `studs` = หน่วยความยาวใน Roblox (≈0.28 ม.) — **เกม 2D ต้อง map เป็นพิกเซลเอง**

### 3.1 Rush ✔
**ข้อมูลทั่วไป:** ใบหน้ายิ้มอนุภาค (particle emitter 2 ชั้น) · วิ่งผ่านหลายห้องด้วยความเร็วสูง · ทำลายไฟในห้องที่ผ่าน → ห้องมืด (Screech เกิดได้) · **ความเสียหาย 125** (ตั้งแต่ Backdoor update) · **ความเร็ว 65 studs/s** (80 เมื่อ modifier "I'm Runnin' Here") · ช้าลงเมื่อมีผู้เล่นมาก · ออร่ารัศมี 16 studs
**การปรากฏ:** เกิดได้ตั้งแต่ **Door 3** (wiki ขัดกันเอง: Behavior บอก Door 2 ⚠) ถึง **Door 97** (ไม่เกิดที่ 98–100) · มักเริ่มหลัง Door 10–15 · **รับประกันอย่างน้อยครั้งหนึ่งต่อรัน** · จำนวนตามช่วง: Reception→Seek#1: 2–4; Seek#1→Jeff: 0–2; Jeff→Seek#2: 2–3; Seek#2→Greenhouse: 1–2; Greenhouse: 2–3 · Greenhouse มี "1 ใน 5 ต่อห้อง" ตามหน้า Rush (หน้า Greenhouse ไม่ยืนยัน ⚠) · spawn % อื่นๆ: ❓ ไม่ระบุ
**สัญญาณเตือน:** ไฟกะพริบ ~2 วินาที → ไฟหรี่เมื่อใกล้ → จอสั่นเมื่อใกล้มาก · เสียงคำรามไกล (~47 วิ ช้าและเพี้ยน) / ใกล้ (~11 วิ) ได้ยินจาก ~2 ห้อง · มีเสียงหลอก (เล่นแล้วหยุด) · Greenhouse ไม่มีไฟเตือน
**การเคลื่อนที่:** เกิดหลังประตูที่ปิดล่าสุด → วิ่งผ่านห้องต่างๆ → **เปิดประตูถัดไปที่ยังไม่เปิดแล้วหายไป** (ยกเว้นประตูล็อก, Door 98–100) · ถ้าผู้เล่นไปไกลกว่า 4 ประตูจากจุดเกิด Rush หยุดที่ประตูนั้นแล้วหายไป · ใช้ **ray-casting** ตรวจผู้เล่น (ไม่เห็น = ไม่ตาย)
**วิธีรับมือ:** หลบในตู้ (wardrobe) / ใต้เตียง / มุมไกลจากเส้นทาง · หรือหลบนอกแนวสายตา (In Plain Sight) · เลี่ยงเข้าตู้เร็วเกินไป (Hide ไล่ออก) · Crucifix ขับไล่ได้ (แต่เกิดซ้ำได้) · เหรียญในลิ้นชักที่เปิดและ Snare บังได้ (bug/ช่องโหว่ hitbox) · Rush **ดับแสง Guiding Light** ได้ แต่ไม่ดับเตาผิง
**เพิ่มเติม:** การเปิดประตูของ Rush อาจกระตุ้น Void/Glitch/Jack hallway/Shadow ได้ · ใน Dining Room เปิดประตูเตาผิงก่อนแก้ปริศนาได้ · Rush ทำให้ป้ายเลขประตูของ Dupe หลุด · เกม Rush อิงจาก A-60 (Rooms) · Modifiers: Rush Hour (บ่อยขึ้น), I'm Runnin' Here, I'm Tip-Toein' Here (เงียบ)
**2D:** 🅰️ **Fully Adaptable** (วิ่งซ้าย→ขวาผ่านหลายห้อง สัญญาณเตือนด้วยเสียง+ไฟกะพริบ)

### 3.2 Ambush ✔
**ทั่วไป:** เหมือน Rush แต่ **ย้อนกลับหลายรอบ (rebound)** · ความเสียหาย **100** (ตั้งแต่ 30 มี.ค. 2024; Overheal จาก Starlight รอดได้) · ความเร็ว = Rush (หลัง Mines update ลดลง; ⚠ trivia ยังเขียนว่าเร็วที่สุด) · hitbox ใหญ่ (หลัง Mines update เล็กลงมาก)
**การปรากฏ:** เกิดเร็วสุด Door 3 · มักหลัง Door 50 · **เกือบทุกครั้งที่ Door 82** · ช่วงที่แนะนำให้คาดคะเน 82–88 · ปลายสุด ⚠ Door 99 (Behavior) vs 88 (Strategy) · Greenhouse เกิดไม่ได้ · ต่อรัน: ปกติ 1 ครั้ง (บางครั้ง 2–4 หรือไม่เกิดเลย) · โอกาสเกิดอ้างอิง 6.66% (trivia 🔸 เพิ่มตามความคืบหน้า)
**Rebound:** **2–4 ครั้ง** (เก่า 6; trivia อ้างสูงสุด 16 ⚠)
**สัญญาณ:** เสียงกรี๊ดแหลมเพี้ยน + จอสั่นก่อนโจมตี · ไฟหรี่เมื่อใกล้ · (เก่า: ไฟกะพริบตอนเกิด — ถูกถอด 28 ม.ค. 2023; เสียงคือสัญญาณหลักปัจจุบัน) · ไฟแตกตอน rebound (ถูกถอดใน Mines update)
**รับมือ:** ซ่อนตู้/เตียง · **ออกจากตู้ได้ระหว่างรอบ rebound** แล้วกลับเข้าใหม่ · เลี่ยงตู้/เตียงที่หันหน้าไปห้องก่อนหน้า (hitbox ใหญ่) · เลี่ยงเตียง (animation ยาว) · safe spot: Basement, นั่งยอง (crouch) ปลายบันไดที่ตัน, ข้างตู้/ชั้นหนังสือบางจุด, หลังรถเข็นกระเป๋า · เข้า Halt hallway → Ambush หายไป · Crucifix ขับไล่ได้
**2D:** 🅰️ **Fully Adaptable** (วิ่งไป-กลับซ้ำ ๆ ผ่านห้องเดียวกัน เข้ากับ 2D มาก)

### 3.3 Seek ✔
**ทั่วไป:** วิ่งผ่านห้อง **ไม่ได้ไล่ผู้เล่นโดยตรง** แต่วิ่งไปยังประตูถัดไป ใครอยู่ในห้องที่มันผ่านตายทันที (แม้ทะลุผนัง) · hitbox เล็กกว่า Rush เล็กน้อย
**ลำดับ chase (Hotel):** Crescendo (ตาดำบนผนัง/ภาพ เริ่ม Door 25+ ยาว 2–5 ห้อง) → Grand Hallway cutscene (Seek ผุดจากน้ำมันดำ ทุกคนถูกย้ายไปต้นทางเดิน) → **Chase #1** (Door 29–42, 6 ห้อง: crawlspace ใหญ่ → ห้อง maze แปดเหลี่ยม 3 ประตู (จริง 1) → crawlspace เล็ก → ห้อง maze #2 → Grand Hallway ท้ายเกม) · **Chase #2** (Door 69–75, 5 ห้อง maze + Grand Hallway ท้าย, ยากกว่า) ⚠ ช่วง Door/จำนวนห้อง ต่างระหว่างหน้า Seek กับ Hotel
**ห้องสุดท้ายทุก chase:** แขนดำยาวทะลุหน้าต่าง (ถูกจับ = ตายทันที ลากออกนอกโรงแรม) · **โคมระย้า 3 อันตก+ไฟลุก** (โดน 45 ดาเมจ) · Guiding Light ปิดประตูทางออก; Seek ทุบประตู 3 ครั้ง
**ความเร็ว:** ผู้เล่นได้ speed boost ระหว่าง chase ทำให้ Seek ช้ากว่าโดยปริยาย; modifier "It Can Run Too" (+5% Knobs) ทำให้เร็วมาก · ตัวเลข studs/s ❓ ไม่มี · Seek เร็วขึ้นมากเมื่อทุกคนตายเพื่อให้ revive เร็ว
**รับมือ:** วิ่งตามเส้นทางที่ Guiding Light ไฮไลต์ · หมอบลอดสิ่งกีดขวาง/ช่อง · ไม่หลบตู้ (ตายถ้าหลบ) · Vitamins ช่วยตามทัน · Crucifix **ทำให้ Seek มึนงงหลายวินาที ไม่ขับไล่** (1 ใน 3 Entity ที่หนี Crucifix ได้: Seek, Figure, Grumble) · ตายระหว่าง chase revive ไม่ได้จนกว่าจะจบ
**Eyes:** ตาในผนังไม่โจมตี (แค่มอง) ยกเว้นเมื่อมี modifier Always Watching/Seeing Double/Four Eyes
**2D:** 🅱️ **Adaptable with Modifications** — มี 3 ประเด็นที่ต้องเปลี่ยน: (1) "maze 3 ประตูแล้วมีทางจริงเดียว" → เลนประตูแนวนอน; (2) "หมอบลอด crawlspace" → ต้องมี input หมอบ; (3) "วิ่งหนีแบบ endless runner" → ตัวเลขเร็ว/ช้าต้องกำหนดเอง ❓

### 3.4 Figure ✔
**ทั่วไป:** สูง 7 ฟุต (213 ซม.) มนุษย์ผิวลอก หัวเป็นปากกลมมีฟัน 24/25 ซี่ ⚠ · **ตาบอด ใช้เสียงล้วน** (Hotel) · ใกล้ตัวไหนเสียงดังกว่า ฟังตัวนั้นก่อน ("จัดอันดับเสียงตามความดังเทียบตำแหน่งตัวเอง"; เสียงใกล้สำคัญกว่าเสียงไกลที่ดังกว่า) · ถ้าไกลเกินไปจะไม่ได้ยินเลย
**เงื่อนไขการตาย:** สัมผัสผู้เล่น = ตายทันที · ฆ่าคนในตู้เมื่อมาตรวจ · ฆ่า Entity อื่นได้ (Gloombat, Giggle, Dupe)
**เสียงที่ดึงดูด (Library):** หยุดหมอบ, กินวิตามิน, เหยียบโคมแตก, เข้าตู้ → ไปยังจุดล่าสุดที่ได้ยิน · นาฬิกาปลุก (ติ๊ก ~10 วิ แล้วดัง) ล่อได้ · เปิดประตูไม่รบกวน (ใน 1 กรณี) · เหยียบเศษไม้แค่ให้มาตรวจดูไม่ไล่
**ความเร็วใน Library:** ⚠ wiki เขียนคลุมเครือว่าเดินเร็วขึ้น "0.75× ต่อหนังสือ 1 เล่ม" · วิ่งหนีทันได้เฉพาะเก็บ < 3 เล่ม · หลัง Mines update วิ่งหนีไม่ทันแม้ 3 เล่ม · ตัวเลข studs/s ❓
**Electrical Room (Door 100):** รับรู้ **เสียงหัวใจ (heartbeat)** ในระยะไกลกว่า Library; แสงจากไฟฉาย (Shakelight/Flashlight) ทำให้เสียงดัง · หลังดึง lever Figure ไล่เดินปกติ+ผู้เล่นได้บูสต์ · หลังแก้ Circuit Breaker Figure วิ่งเร็วกว่าเดินมาก+ผู้เล่นได้บูสต์
**Crucifix:** ทำให้หยุดนิ่งไม่กี่วินาที ฆ่าผู้ที่แตะขณะมึนงงไม่ได้ · บล็อกมุมได้ (หมอบลอดช่องแขน-ตัว)
**พิเศษ:** Holy Hand Grenade ฆ่า Figure ได้ (ไม่ใช่ไอเทมหลัก)
**2D:** 🅱️ **Adaptable with Modifications** — ระบบ "เสียง=รัศมี" เข้ากับ 2D ได้ดี แต่ Library ที่มีชั้นสอง/บันได/ชั้นหนังสือ 3 มิติ ต้องออกแบบใหม่

### 3.5 Screech ✔
**ทั่วไป:** ก้อนมีหนวด 6 เส้น ตาขาวสองดวง · กัด **40 ดาเมจ**
**การปรากฏ:** เกิดใน **ห้องมืด** ตั้งแต่ Door 1 ขึ้นไป (ห้องมืดเริ่ม Door 9) · ห้องที่ Rush/Ambush ทำมืดก็นับ (หลัง Hotel+) · Basement เกิดน้อยกว่า · **ไม่เกิด** ระหว่าง Seek chase และ Halt hallway · เกิดช่วง Seek Crescendo ได้ · แสงและ Guiding Light ลดโอกาสแต่ไม่ถึง 0 · คนมากโอกาสน้อยลง
**สัญญาณ:** เสียงสถิตเบามาก + จอสั่นเล็กน้อย → เสียง "psst" (เสียงหลอกเบากว่า) · ping สูงทำให้โดนโจมตีโดยไม่มีสัญญาณ
**ตำแหน่ง:** เกิด **ด้านหลังผู้เล่น** ตรวจเพดาน/ระดับสายตา/พื้นก่อน
**รับมือ:** **หันไปมองตรง ๆ ก่อนถูกกัด** → กรี๊ดแล้วหายไป · เข้าตู้/ใต้เตียง/ปีนบันได · Crucifix กัน Screech 5 นาที
**เวลา:** ❓ ไม่ระบุวินาทีของหน้าต่างมอง
**2D:** 🅱️ **Adaptable with Modifications** — "เกิดข้างหลัง/หันไปมอง" แปลงเป็น "เกิดฝั่งตรงข้ามที่หันหน้า + กดหันกลับ (flip)" · ความมืดใน 2D ต้องมีกลไกแสงแบบ mask

### 3.6 Halt ✔
**ทั่วไป:** ดาเมจ **60** · อยู่ในห้องยาว **The Dining Hall** (Mines: The Bridges) · เข้าแล้วประตูทางเข้าปิดทันที · Rush/Ambush หายไปเมื่อเข้าห้อง (ถ้า Rush อยู่ใกล้เข้ามาก็ตายเพราะไม่มีตู้) · เสียงปรากฏซ้ำแบบ **เกิดข้างหลัง → เดินเข้าหา → วาร์ปไปข้างหน้า → วนซ้ำ** จนถึงปลายห้อง
**คำเตือน:** ไอคอน ↻ สีน้ำเงิน + ข้อความ "TURN AROUND" (หัน 180°) · "RUN AWAY" เมื่อใกล้มาก · (เก่า: ไฟกะพริบ/ตา) ปัจจุบัน ไซเรนหมุน
**รับมือ:** หันตามคำเตือน (หรือเดินถอยหลังเร็วกว่า) · วิตามินใช้ต้นห้อง (ระวังคำเตือน) · Crucifix = ถูกบังคับออกจากห้อง · โดนหลังเปิดประตูทางออกแล้ว = ไม่เสียเลือด
**อัตราเกิด:** (เก่า) 3% · (หลัง Hotel+) 0.1–0.5% · ช่วงหลัง Seek #2 ถึง Greenhouse สูงขึ้นมาก · Mines update ทำให้ "รับประกัน 1 ครั้ง/รัน" (30 ส.ค. 2024) แต่ 10 ส.ค. 2025 ยกเลิกการรับประกันใน Hotel ⚠ (หน้า Dining Hall ยังเขียนว่ารับประกัน)
**ความเร็ว:** บูสต์ทีละน้อยทั้งผู้เล่นและ Halt; Halt เร็วขึ้นเมื่อใกล้ประตูออก; ตัวเลขจริง ❓
**2D:** 🅱️ **Adaptable with Modifications** — ห้องแนวนอนยาวเหมาะ 2D มาก; "เกิดข้างหน้า/ข้างหลัง" ต้องแปลงเป็นซ้าย/ขวา; "หันหน้า" = flip

### 3.7 Eyes ✔
**ทั่วไป:** กลุ่มดวงตาเรืองแสงม่วง/น้ำเงิน (texture 38 ดวง) · ดาเมจ **3–10 ต่อ tick** ขึ้นกับตำแหน่งบนจอ (ใกล้กลางจอ = แรงกว่า) · ทำดาเมจได้ไกลสุดห้องที่ยังไม่ถูกลบ (Hotel ดาเมจแรงกว่า)
**การปรากฏ:** โอกาสพื้นฐาน **3% ต่อประตู** · Door 5–98 · ไม่เกิดที่ Reception, Library, Electrical Room, ระหว่าง Crescendo · หายเมื่อเปิดประตูถัดไป (Party Mode: 3 ประตู) · วาร์ปบ่อยขึ้นยิ่งอยู่นาน
**สัญญาณ:** เสียงเกิด+ออร่าม่วง+เสียงกระซิบ
**รับมือ:** **มองลงหรือหันหนี** ทันทีที่ได้ยินเสียงเกิด · ซ่อนในที่ซ่อน/ปีนบันได/อยู่ใน cutscene/มี Screech ใกล้ → ไม่โดน · Crucifix ไม่แนะนำ (หน่วง)
**แสง:** เป็นแหล่งแสงในห้องมืด/Greenhouse
**2D:** 🅱️ **Adaptable with Modifications (ต้องแก้หนัก)** — กลไก "มองตรงกลางจอ" ใช้ไม่ได้ใน 2D · ตัวเลือกที่ wiki รองรับเชิงตรรกะ: "หันหน้าหนี/หมอบ/ซ่อน = ปลอดภัย" แต่ต้องออกแบบเอง ❓

### 3.8 Hide ✔
**ทั่วไป:** (Mines: หน้าแดงหลายตา) · ในที่ซ่อนนานเกิน = ถูกดันออก **ดาเมจ 40**
**เวลา:** ตู้ปกติ ~**12 วินาที** · "Rent's Due" 5–6 วินาที · ห้อง Figure (ยกเว้น Electrical Room) เริ่มทันทีที่เข้า · หลังถูกไล่ออก **cooldown ~10 วิ** (ซ่อนไม่ได้) · ไม่โจมตีใน Electrical Room ·
**Heartbeat minigame:** เฉพาะ Figure ตรวจตู้ (ปุ่ม Q/E, พลาด 2 ครั้ง = โดนไล่ออก)
**Crucifix:** ปิด Hide **1 นาที**
**ไม่มี Hide:** Retro Mode, The Rooms, Backdoor, Outdoors
**Combo:** Rush/Ambush/Jack
**2D:** 🅰️ **Fully Adaptable** (ตัวจับเวลาในตู้ล้วน ๆ)

### 3.9 Jack ✔
**ทั่วไป:** ไม่ทำดาเมจ แต่ **ขวางการซ่อน** · 2 รูปแบบ: **ตู้ (closet)** โอกาส **0.5% ทุกครั้งที่พยายามเข้าตู้** (หน้า Jack มีบรรทัด "5%" เกี่ยวกับ Hotel ที่ไม่ชัด ⚠) · **ประตู (hallway)** **0.05%** ต่อห้องใหม่ · ห้องกลายเป็นแดงเลือดมีจุดดำ · ไม่เกิดที่ Reception/Adit · ไม่ทำงานระหว่าง Rush/Ambush โจมตี
**Combo:** ถ้า Rush/Ambush ฆ่าขณะ Jack อยู่ ข้อความตายเป็น "เพราะหลบไม่ได้"
**2D:** 🅰️ **Fully Adaptable**

### 3.10 Dupe ✔
**ทั่วไป:** หลอกเป็น **ประตูปลอมในห้องที่มีหลายประตูมีเลข** · เข้าไปโดน **40 ดาเมจ** (HP ≤ 40 → ถูกลากเข้ารู) · สูงสุด **8 ประตูปลอม/ห้อง**
**การปรากฏ:** เร็วสุด Door 2 (มักหลัง Door 10) · ไม่เกิดในห้องประตูเดียว (Library, Jeff Shop, Basement, Reception, Dining Room, Courtyard)
**แยกจริง/ปลอม:** (1) เลขบนป้ายผิด/ซ้ำกัน; (2) เสียงครืนเบา ๆ เมื่อยืนใกล้ (ดังมากในห้องมืด); (3) เสียง/แสงจากหลังประตูจริง · ในห้องมืดป้ายปลอมหลุดเอง · หลัง Door 50 ป้ายอาจไม่หลุด ครืนดังขึ้น
**Scramble:** เลขประตู/กุญแจก่อนหน้าสลับหลังเวลาหนึ่ง (สั้นลงเมื่อเล่นลึก)
**Rush:** ผ่านประตูจริงเสมอและเขี่ยป้ายปลอมหลุด
**Super Hard Mode:** ไม่มี Dupe (แทนด้วย Subspace Tripmine)
**Crucifix:** หยุดและปิดประตู
**2D:** 🅰️ **Fully Adaptable** (ประตูหลายบานเรียงแนวนอน ตรงกับ 2D)

### 3.11 Timothy ✔
สไปเดอร์ในลิ้นชัก/หีบ · **0.5% ต่อภาชนะ** · ดาเมจ **5** (HP ≤ 5 → เหลือ 1–4) · ฆ่าไม่ได้ถ้าไม่มี modifier "Itchy" (10 ดาเมจ) · jumpscare ล้วน ๆ · "Bug Spray" ปิด · เกิดได้ที่ Door 0, 49, 50
**2D:** 🅰️ **Fully Adaptable**

### 3.12 Snare ✔
**ทั่วไป:** กับดักหญ้า มีหนามซ่อน 19 รู · **ดาเมจ 20 และตรึงไม่กี่วินาที** (หน้า Snare) · ⚠ หน้า Greenhouse บอก 10 ดาเมจและไม่ลด HP ต่ำกว่า 1 · ตรึง = ใช้ไอเทมไม่ได้ และ **ไอเทมที่ถืออยู่ถูกยกเลิกอัตโนมัติ** (อันตรายถ้า Rush ใกล้)
**การเกิด:** Greenhouse 1–3/ห้อง; Courtyard (ตั้งแต่ Mines update) · เกิดทั่ว Hotel ได้ด้วย modifier · ไม่เกิดใน Reception/Seek chase
**รับมือ:** พกแสง; มองพื้น; ฟ้าแลบเผยตำแหน่ง; Eyes เป็นแสงช่วย
**2D:** 🅰️ **Fully Adaptable** (กับดักพื้น)

### 3.13 Void ✔
**หน้าที่:** ดึงผู้เล่นที่ตามกลุ่มไม่ทัน (ห้องที่ตัวเองอยู่ถูก unload) กลับมาห้องที่โหลดล่าสุด · ลำดับ: ปิดประตูทางออก → ห้องหรี่ลงจนมืด → วาร์ปด้วยแสงวาบ → ดาเมจสุ่ม (Glitch เดิม **10–40**) · เริ่มเตือนเมื่ออยู่ **5 ห้องข้างหลัง** (4 เมื่อ Infirmary สร้างแล้ว; 3 หลัง Seek #2)
**Crucifix:** กันดาเมจแต่ยังวาร์ป
**2D:** 🅱️ **Adaptable with Modifications** — ถ้าเกม 2D ไม่ unload ห้อง กลไกนี้อาจ "ไม่จำเป็น" (เฉพาะ multiplayer) · ต้องตัดสินใจเอง

### 3.14 Glitch ✔
ไม่ canon · ตัวเดียวที่ปรากฏทุก floor · เป็น failsafe ของบั๊ก generation · **ไม่ทำดาเมจ** ปัจจุบัน · Rooms: ย้ายผู้เล่นที่ตามหลัง ≥7 ห้อง; Backdoor ≥4 ห้อง
**2D:** 🅲 **Not Suitable** — เหตุผล: เป็น failsafe เฉพาะของ engine/room-generation ไม่ใช่ entity ที่มี gameplay (ไม่ตัดทิ้งโดยไม่คิด — ใช้ "ระบบ fallback ของเราเอง" แทน)

### 3.15 Dread ✔
**ทั่วไป:** ใบหน้าฟองน้ำขาว-ฟ้ามีรู ปากบึ้ง · **เกิดเมื่อนาฬิกาในเกมชี้เที่ยงคืน** (อยู่ห้องเดียวนาน ~**10 นาที** จริง; 1 ชม. เกม = 10 นาทีจริง) · เปิดประตูเลขใดก็ตามรีเซ็ตเวลาเป็น 11:00 · หลัง Door 50 เข็มวินาทีหมุน 5 วิ (เดิม 7 วิ) · ห้องใหญ่ (Nest, Halt) 1 ชม. เกม = 1 ชั่วโมงจริง
**พฤติกรรม:** ไล่ **ช้า ๆ** แทบมองไม่เห็น · ถึงตัว = ตายทันที · จอมืดเทา · เสียงหายใจ · ไฟแตก
**รับมือ:** **เปิดประตูถัดไปก่อนมันถึง → หายไป** · Crucifix (ถือแล้วจ้องภาพโปร่งใสของมัน; ถ้าคนใดคนหนึ่งผนึกสำเร็จ มันหยุดไล่ทุกคน) — แต่ระหว่างผนึกมันยังฆ่า "ผู้ที่ไม่ได้ถือ Crucifix" ได้ (เป็น Entity เดียวที่ฆ่าได้ระหว่างผนึก) · ระวัง Screech เกิดระหว่างผนึก
**2D:** 🅰️ **Fully Adaptable** (ตัวจับเวลา AFK + ตัวไล่ช้า)

### 3.16 Shadow ✔ (ชื่อชุมชน ไม่มีชื่อทางการ)
ไม่ทำดาเมจ เป็น jumpscare + ไฟกะพริบ · โอกาส ≈ **1/2000 (0.05%) ต่อประตู** · ไม่เกิด Door 99, Electrical Room · ไม่มี achievement
**2D:** 🅰️ **Fully Adaptable**

### 3.17 Sally ✔
หุ่นเด็กหญิงดำหน้าขาวยิ้ม ใน **หน้าต่างขนาดกลาง** · **ต้องมีผู้เล่นถือไอเทมสำคัญ 3 ชิ้น** จึงเกิด · เกิดตั้งแต่ Door 1–98 · ไล่ด้วยความเร็ว "สูงกว่าเดินปกติเล็กน้อย" ทะลุกำแพง เส้นตรง ไปยังผู้เล่น/ไอเทมที่ใกล้สุด
**ดาเมจ:** HP ปัจจุบัน −2/3 (เหลือขั้นต่ำ 3) · Max HP ÷ 1.3 (ขั้นต่ำ 50) · ออกซิเจน 5% · ฆ่าไม่ได้
**รับมือ:** **ทิ้งไอเทมให้เล่น 15 วินาที** แล้วหายไป · Crucifix ผนึก · ซ่อนไม่ได้
**2D:** 🅱️ **Adaptable with Modifications** ("ใกล้สุด" + เส้นตรง = เข้ากับ 2D ง่าย; ต้องนิยาม "หน้าต่าง" บนฉาก)

### 3.18 Guiding Light ✔ (ผู้ช่วย ไม่ใช่ศัตรู)
ออร่าฟ้า-ไซแอน · **ไฮไลต์ของจำเป็นหลัง 20–70 วินาที** · ในห้องมืดไฮไลต์ประตูถัดไป · ไฮไลต์ทาง Seek chase · ให้ข้อความตาย · รับประกันทุกรัน · Modifier "Gone Fishing" ปิดไฮไลต์
**2D:** 🅰️ **Fully Adaptable** (UI hint system)

### 3.19 NPC ในร้าน Jeff ✔
**Jeff:** พ่อค้า · **El Goblino:** พูด 3 ประโยค/รัน ไม่ขายของ ซ่อนหลังลังเมื่อ Rush มา · **Bob:** โครงกระดูกเป็นมิตร (Super Hard Mode อาจ jumpscare)

### 3.20 Entity ที่เกี่ยวข้องแต่นอกขอบเขต Door 1–100
Curious Light (Backdoor/Rooms), Giggle/Gloombat/Grumble/Queen Grumble/Louie (Mines), A-60/A-90/A-120 (Rooms), Blitz/Haste/Lookman (Backdoor), Bramble/Caws/Eyestalk/Grampy/Groundskeeper/Mandrake/Monument/Surge (Outdoors), **World Lotus** (อยู่ในรายการ Hotel ✔ แต่ยัง **ไม่ได้ค้นคว้า** ❓)

---

## 4. Entity Behavior & Mechanics

### 4.1 ระบบตรวจจับ

| Entity | ตรวจจับด้วย | ยืนยัน/สันนิษฐาน |
|---|---|---|
| Rush / Ambush | Ray-casting ไปยังผู้เล่น (HumanoidRootPart) — ไม่เห็น = ไม่ตาย · นั่งยองลดจุดเป้าหมาย | ✔ |
| Figure | เสียง (Hotel) · ลำดับตามความดังเทียบระยะ · Electrical Room: heartbeat (ผู้เคลื่อนไหว) · (Mines: ตรวจการนั่งยอง) | ✔ |
| Seek | ไม่ตรวจจับ — วิ่งไปประตูถัดไป ฆ่าทุกคนในห้อง | ✔ |
| Screech | ตรวจการ "มองมัน" (client-side) | ✔ |
| Eyes | ตำแหน่งบนจอ (ใกล้กลาง=แรง) | ✔ |
| Halt | ระยะห่างจากผู้เล่น/ทางออก (client-side) | ✔ |
| Hide | จับเวลาอยู่ในที่ซ่อน | ✔ |
| Dread | จับเวลาอยู่ห้องเดียว (ไม่ AFK) | ✔ |
| Sally | ผู้เล่น/ไอเทมที่ใกล้สุด | ✔ |
| Snare | เหยียบ | ✔ |
| Dupe | โต้ตอบกับประตู | ✔ |

### 4.2 ปฏิสัมพันธ์ระหว่าง Entity

| เหตุการณ์ | ผล |
|---|---|
| Rush เปิดประตูถัดไป | อาจสร้าง Entity อื่น/Rush ซ้ำ, กระตุ้น Void/Glitch/Jack hallway/Shadow, ทำให้ Eyes หาย |
| เข้า Halt hallway | Rush/Ambush หาย |
| Screech + Void teleport | Screech ดาเมจทันทีไม่มีเสียง (bug) |
| Eyes + Screech ใกล้ตัว | Eyes ไม่ทำดาเมจ |
| Eyes + Snare ตรึงอยู่ | Eyes ไม่ทำดาเมจ |
| Snare ตรึง + Rush | เสียชีวิตง่าย; Crucifix ใช้ไม่ได้ระหว่าง animation |
| Hide + Rush/Ambush/Jack | combo ฆ่า |
| Figure + Dupe/Gloombat | Figure ฆ่า Dupe ได้ |
| Dread + Rush/Ambush/Screech/Eyes | เกิดซ้อนได้; Rush+Dread ไฟกะพริบไม่ปรากฏ |

### 4.3 สถานะ "ข้อสันนิษฐาน" (ไม่ยืนยัน)
- ชื่อ "Shadow" เป็นชื่อชุมชน
- โอกาสเกิด Ambush 6.66% (trivia 🔸)
- Eyes อาจเป็น "กลุ่ม" (ใช้สรรพนามพหูพจน์) — ไม่ยืนยัน

---

## 5. Gameplay Systems

### 5.1 ประตูและห้อง
- ประตูมีเลขห้องถัดไป; Dupe ทำเลขผิด/สลับ
- ห้องล็อก: ต้องใช้ **Room Key ที่ตรงกัน** (หายหลังใช้) · Lockpick/Skeleton Key เปิดแทนได้ (Skeleton Key เปิดประตูกะโหลกและหีบล็อก)
- Key เกิดในห้องปัจจุบัน บนภาชนะ/เตียง/โซฟา/เก้าอี้/ลัง/พื้น; Guiding Light ให้เสียงแวววาวและไฮไลต์หลังเวลาหนึ่ง
- ตั้งแต่ Mines update ถือไอเทมไปด้วยขณะใช้กุญแจได้

### 5.2 ที่ซ่อน
- Hotel: **ตู้ (wardrobe)** ที่ซ่อนหลัก (กัน Rush/Ambush/Figure ส่วนใหญ่ — ไม่กัน Hide) · **เตียงใต้** (Door 1–88, 1 คน; เตียงสองหมอน 3 คน) · toolshed (Courtyard/Greenhouse/Electrical)
- เข้าซ่อนมี animation (ภูมิคุ้มกันระหว่างเข้า); ออกจากตู้ยังโดน Rush/Ambush ได้ระหว่าง animation ออก
- 1 คน/ที่ซ่อน (ยกเว้นเตียงสองหมอน 3 คน)
- เตียงใช้เวลา animation นานกว่าตู้

### 5.3 แสง
| ไอเทม | ข้อมูล | ✔ |
|---|---|---|
| Flashlight | เต็ม = **2 นาที** ใช้ต่อเนื่อง · Battery ละ **+50%** (60 วิ) เกิน 100% ได้ถึง +10% · เปิด/ปิด/กระพริบมีเสียงให้ Figure ได้ยิน · เปียก/แบตต่ำกระพริบ | ✔ |
| Lighter | เต็ม **1 นาที** · 3 ขีดเชื้อเพลิง (เดิม 4) · ขีดแรกคลิก 1 ครั้ง ขีดสอง 2 ครั้ง … · รัศมีกลางรอบตัว · มีเสียงให้ Figure ได้ยิน · ที่พบมี fuel 50–100% | ✔ |
| Candle | ใช้เป็นแสงได้ (ต้องมี Lighter) · ใน Greenhouse บอกการเกิดของ Rush/Screech/Eyes (ไม่ทำงานถ้ามี Eyes) | ✔ |
| Shakelight/Bulklight/Straplight | Shakelight เสียงดึง Figure; Bulklight/Straplight ต้องมี Rift | ✔(บางส่วน) |
- **กฎการเกิดของแสง:** ถ้าผู้เล่นทุกคนมีแสงแล้ว vitamins/lockpicks จะเกิดแทน; Lighter หยุดเกิดเมื่อเจอ Flashlight

### 5.4 ไอเทม — ดู §6

### 5.5 สุขภาพและความเสียหาย
- HP เริ่ม **100** · ไม่ฟื้นเอง (ยกเว้น Green Herb ฟื้นต่อเนื่อง) · แถบเลือดมุมซ้ายล่างจนกว่าจะเต็ม
- ตาราง "ดาเมจ" ที่รวมไว้ใน JSON

| Entity | ดาเมจ |
|---|---|
| Rush | 125 |
| Ambush | 100 |
| Figure/Seek (arms)/Dread | ตายทันที |
| Halt | 60 |
| Screech | 40 |
| Hide (ถูกดันออก) | 40 |
| Dupe | 40 |
| Seek chandelier | 45 |
| Snare | 20 ⚠ (หรือ 10 ตามหน้า Greenhouse) |
| Eyes | 3–10 ต่อ tick |
| Timothy | 5 |
| Void | สุ่ม (Glitch เดิม 10–40) |
| Sally | −2/3 HP, Max HP ÷1.3 |
| Jack/Shadow/Glitch | 0 |

- Overheal: Vial of Starlight +25, Bottle of Starlight +50 (ทำให้ Ambush 100 หรือ Rush 125 บางกรณีรอด) — **ไม่อยู่ใน Hotel ปกติ** ❓

### 5.6 เสียง
- Figure: เสียงของผู้เล่น (ยืนยันใน §3.4)
- Entity อื่น: เสียง = "สัญญาณเตือน" ล้วน (Rush/Ambush/Screech/Eyes/Halt)

### 5.7 เหตุการณ์สุ่ม — ดู §7

### 5.8 ปริศนา — ดู §7

### 5.9 ความตายและ Revive
- Revive **1 ครั้ง/รัน** · มีเวลา **30 วินาที**หลังตาย · ใช้ไม่ได้ถ้า Rush/Ambush/Seek active ("Please wait until it is safe") · **ใช้ไม่ได้ตั้งแต่เปิดประตูแรกของ Greenhouse / Electrical Room** · ตายภายใน 20 วินาทีหลัง revive ไม่เสียสิทธิ์ · อมตะไม่กี่เฟรมหลัง revive · ก่อนเปิดประตูแรก ตายแล้ว revive อัตโนมัติฟรี
- Robux (120 Robux/5 revive; 30 Robux/1) ไม่เกี่ยวกับเกม 2D

### 5.10 Multiplayer
- ผู้เล่นตามหลังเกินกำหนด → Void ย้ายกลับ
- ลิฟต์ Door 100 รองรับ 4 คน (เกินนั้นอาจ bug)
- Halt/Dread/Screech เป็น client-side (แต่ละคนเห็นต่างกัน)

### 5.11 Gold, Knobs, Achievements
- ค่า Gold: เหรียญเดี่ยว **5** · กองเหรียญ 4 เหรียญ **10** · แท่งทอง 1 + เหรียญ 3 = **25** · 2 แท่ง = **50** · 3 แท่ง+2 เหรียญ = **75** · กองใหญ่+อัญมณี = **100**
- **20 Gold = 1 Knob** · เศษ ≥10 ได้ +1 · เศษ ≤9 หาย · เพดาน **500 Knobs** (= 10,000 gold)
- Gold ใช้ซื้อของที่ Jeff Shop และแปลงเป็น Knobs เมื่อรันจบ
- Achievements ที่เกี่ยวกับกลไก: Out Of My Way (รอด Rush), Coming back for seconds (รอด Ambush), You Can Run (รอด Seek), All Figured Out (Crucifix ใส่ Figure), Dead Of Night (รอด Dread) ฯลฯ

---

## 6. Items & Equipment

| ไอเทม | ราคา Jeff (Gold) | Pre-Run (Knobs) | Stack | ผลหลัก | ✔/⚠ |
|---|---|---|---|---|---|
| Lighter | 100 | 50 | 1 | แสงรัศมี 60 วิ | ✔ |
| Flashlight | 200 | 100 | 1 | แสงทิศ 2 นาที | ✔ |
| Lockpick | 100 (🔸 บางแหล่ง 250) | 50 (2 อัน) | 3 | เปิดประตู/หีบล็อก (ไม่ใช้กับประตูพิเศษ) | ⚠ |
| Skeleton Key | 300 (รับประกันเสมอ) | — | 1 | เปิดประตูกะโหลก/หีบ (ใช้ได้ 5 ครั้ง 🔸) | ✔/🔸 |
| Vitamins | 100 | 100 (x3) | **3** ✔ (🔸 5) | บูสต์ความเร็ว **8 วินาที** · รอ 5 วิ ก่อนใช้ใหม่ · ไม่สะสม | ⚠ |
| Crucifix | 500 (เก่า 250; โอกาส 60% ในร้าน) | — | 1 | ผนึก/มึน Entity ดู §6.1 | ✔/🔸 |
| Battery | — | — | — | +50% Flashlight | ✔ |
| Alarm Clock | — (พบใน Door 49/Library) | — | — | ติ๊ก ~10 วิ → ดัง → ล่อ Figure | ✔ |
| Green Herb | — | — | — | ฟื้น HP ต่อเนื่อง | ✔ |
| Shears | (Mines 300) | — | 1 | ตัดเถาวัลย์ Basement ที่ Courtyard | ✔ |

**Jeff Shop:** ขาย **4 ใน 6 ชิ้น** (Lighter, Vitamins, Lockpick, Flashlight, Skeleton Key, Crucifix) สุ่ม · Skeleton Key รับประกัน · ไม่ขาย Candle 🔸

### 6.1 Crucifix — ผล/ข้อยกเว้น
- **ขับไล่/ผนึก (banish):** Rush, Ambush, Eyes, Screech, Halt, Hide, Sally, Dread, Void (ยังวาร์ป), Dupe 🔸+✔
- **มึนงงชั่วคราว ไม่ขับไล่:** Seek, Figure (และ Grumble ใน Mines) ✔
- Screech: กัน 5 นาที · Hide: ปิด 1 นาที · Dread: ถือ+จ้องภาพโปร่งใส
- ถือไอเทมอื่นไม่ได้พร้อมกัน; ต้องหันเม้าส์/เล็งใส่ Entity (PC) 🔸
- ใช้แล้วพัง (ครั้งเดียว) 🔸

---

## 7. Special Events

### 7.1 เหตุการณ์ตามลำดับ Door

| ลำดับ | เหตุการณ์ | เงื่อนไข/รายละเอียด |
|---|---|---|
| Door 0 | เริ่ม — เก็บ Key "0001" | ผู้เล่นเปิดประตู 1 |
| ~25+ | Seek Crescendo | ตาดำบนผนัง 2–5 ห้อง |
| 29–42 | **Seek Chase #1** | ดู §3.3 |
| 10+ (2%) | **Meeting Room — Painting Puzzle** | 4 ภาพ วางตามกรอบฟ้า (Guiding Light) · ตำแหน่งภาพเกิด 6 แห่ง · ถือภาพเกิน ~20 วินาทีกลับที่เดิม · สำเร็จ → เตาผิงเลื่อนลง เผยประตู |
| 1–87 (⚠ รับประกัน/ไม่รับประกัน) | **Halt / Dining Hall** | ดู §3.6 |
| 49 | Pre-Library | นาฬิกาปลุก |
| **50** | **Library — ปริศนาหนังสือ + Figure** | ดู §2.4 |
| 51→52 | ผ่านรหัส → Jeff Shop | ปลอดภัย |
| 60/61 | Basement + lever เปิดทางเข้า Rooms | ดู §2.4 |
| 66–70 | Infirmary | rest zone |
| 69–75 | **Seek Chase #2** | ดู §3.3 |
| 82 | Ambush มักเกิด | |
| 89 | Courtyard | พักได้ |
| 90–98 | Greenhouse | มืด Rush/Eyes/Snare |
| 99 | Electrical Room Entrance | |
| **100** | **Electrical Room** | ดู §7.2 |

### 7.2 Door 100 — Electrical Room (ขั้นตอนยืนยัน) ✔
1. ลงบันไดหลังประตูรั้ว (ปิดอยู่) → ดึง **lever** เพื่อเปิด → cutscene Figure วิ่งลงบันไดแล้วไล่
2. (แนะนำรอ ~2 นาทีให้ Guiding Light ไฮไลต์สวิตช์)
3. หา **Breaker Switch 10 ตัว** (บนชั้น/พื้น/ท่อ; ไม่ใช่ไอเทม ใช้แถบนับ) + **Electrical Room Key** (ชั้นบน) หรือใช้ Lockpick เปิดห้อง breaker (ตั้งแต่ Hotel+)
4. ใส่สวิตช์ใน Circuit Breaker → **เกมความจำ** (แผงแสดงลำดับ ผู้เล่นต้องพลิกสวิตช์ให้ตรง; แถบเพิ่ม/ลดตามถูก/ผิด) · Figure หายไประหว่างแก้ปริศนา ไม่มีเวลาบังคับ
5. หลังสำเร็จ: ไฟลามน้ำมัน → Figure ตกใจหนีออกหน้าต่าง → พลังงานถึงลิฟต์ → Figure ทุบประตูห้อง breaker แล้วพังออกมา → **วิ่งขึ้นบันไดไปลิฟต์**
6. **Mining Elevator cutscene**: Figure ปิดประตูลิฟต์ขณะลง → กระโดดบนหลังคาลิฟต์ฉีกสาย → ตกเหว · ลิฟต์ตกอิสระและกระแทก · ผู้เล่นทั้งหมด (รวมที่ตาย) ถูกย้ายไป The Mines
- Figure ตรวจ heartbeat/แสง; Hide ไม่ปรากฏหลังดึง lever · **ไม่สามารถ revive ในห้องนี้**
- Figure ชนประตูลิฟต์แล้วหาย; ผู้เล่นนอกลิฟต์ตายทันทีไม่มี jumpscare
- Super Hard Mode: ตัวเลขปริศนาเปลี่ยนเร็วและตัวสุดท้ายเป็น "?"

### 7.3 เหตุการณ์ที่เกิดโดยไม่คาดคิด
- Sally (หน้าต่างแตก ไฟทุกห้องดับ)
- Shadow (≈0.05%/ประตู)
- Blood Room (Jack ≈ 1/2000)
- Dread (อยู่ห้องเดียว 10 นาที)
- Dupe (ห้องหลายประตู)

---

## 8. Story & Lore

> **แหล่งข้อมูล Lore ที่เข้าถึงได้มีจำกัด** (หน้า Lore ดึงไม่ได้) ส่วนนี้จึงแยกชัดเจนว่าอะไรยืนยันแล้ว

### 8.1 ยืนยันแล้ว (บนหน้า Three Architects) ✔
- ข้อความบน sigil ของ Crucifix เมื่อใช้งาน แปลได้ประมาณว่า "หนึ่งในสามสถาปนิกที่มีเครื่องหมายแห่งสวรรค์ช่วยเหลือคุณ" → มาของชื่อ "The Three Architects" (**ชื่อไม่เป็นทางการ**)
- "สามแสง": **Guiding Light** (ฟ้า/พระจันทร์), **Curious Light** (ดาว), **Red Light** (เกลียวกาแล็กซี/หลุมดำ ไม่ส่งเสียงหรือเรืองแสง)
- Guiding Light ปรากฏใน Hotel/Mines, Curious Light ใน Backdoor/Rooms; ทั้งสามปรากฏหลาย floor
- Guiding Light ไฮไลต์ของ ส่งข้อความตาย ปิดประตูหลัง Seek/Library · ทุบโคมใน Library · เป็นหนึ่งในสองตัวละครหญิงที่ยืนยัน (คู่กับ Sally) ✔
- Floors ที่สามแสงปรากฏ (ตามหน้า Three Architects): Lobby, Backdoor, Hotel, Rooms, Mines, Castle
- Spacetime painting มีไอคอน Guiding/Red Light

### 8.2 สันนิษฐาน (ห้ามใช้เป็นข้อเท็จจริง) 
- Red Light มีเจตนาร้ายหรือเกี่ยวกับ Seek
- เก้าอี้ 3 ตัวที่ทางเข้า Rooms แทน Architects
- สีหลักแดง-เหลือง-น้ำเงินตรงกับ Architects

### 8.3 ❓ ไม่พบ
- ประวัติของโรงแรม, ที่มา Figure/Seek/Rush, เอกสารในเกม — **ต้องค้นต่อ** (ดู §13)

---

## 9. Easter Eggs & Secrets ✔
- Timothy มีใยแมงมุมใน Lobby; ชื่อ "Timothy" ไม่ได้อ้างอิงอะไร
- Jack = ชื่อเดิม "Mobble"
- Halt = ชื่อเดิม "Shade" (ในไฟล์เกม)
- Eyes = ชื่อเดิม "Lookman"
- ฉากท้ายอ้างอิง: โคมไฟ Library
- รหัสในเกม: SCREECHSUCKS (ให้ 25 Knobs ตามหน้า Halt ✔), PSST (หน้า Screech ✔)
- Shadow เดิมห้อยจากเพดาน ถูกถอด (คล้ายคนแขวนคอ)
- ถ้า Door 48 มีประตู Dupe อาจสร้าง "Door 50 ปลอม" ได้
- El Goblino: ชื่อเต็ม "El Goblino Peque Carmine IV"; ตาเรืองเมื่อ Rush ผ่าน แดงถ้า Door 52 เป็น Blood Room
- ประตู "Wrong Room" ป้าย 0013 (achievement Dupe)

---

## 10. Survival Tips & Strategies

| สถานการณ์ | กลยุทธ์ที่ wiki ยืนยัน |
|---|---|
| ไฟกะพริบ ~2 วิ | วิ่งเข้าตู้ใกล้สุด รอเสียงดังขึ้นแล้วซ่อน (อย่าเข้าเร็วเกินไป — Hide) |
| ได้ยิน Screech | หันไปมองมัน/เข้าตู้ |
| Eyes (แสงม่วง) | มองลงทันที |
| ห้องมืด | ถือแสง; รอ Guiding Light |
| Library | คลาน (crouch), เก็บหนังสือ 5 เล่ม, ใช้นาฬิกาปลุกล่อ Figure, ซ่อนในตู้, รู้ว่า Figure เร็วขึ้นตามหนังสือ |
| Seek | ตามไฮไลต์ ไม่ซ่อน ใช้ Vitamins/Crucifix |
| Halt | หันตาม "TURN AROUND" หรือเดินถอยหลัง |
| Door 100 | วนรอบชั้นเก็บของ; ไม่ใช้ไฟฉายเกินจำเป็น; แก้ปริศนาแล้ววิ่งไปลิฟต์ |
| Dupe | ตรวจเลข/เสียงครืน/เสียงหลังประตู |
| Snare | พกแสง มองพื้น |

**ข้อผิดพลาดที่พบบ่อย (จาก wiki):** เข้าตู้เร็วเกินไป · ซ่อนเตียงตอน Ambush · ใช้ Crucifix กับ Seek/Figure แล้วคิดว่ากำจัดได้ · ถือ Candle/แสงใน Greenhouse แต่ลืมว่า Eyes ทำให้ Candle ใช้ไม่ได้

---

## 11. Screenshot & Visual Reference Library

> **ข้อจำกัด (ตรงไปตรงมา):** shell ที่ใช้ค้นคว้าเข้าเว็บภายนอกไม่ได้ จึง **ไม่สามารถดาวน์โหลด/ตรวจสอบไฟล์ภาพเดี่ยว ๆ** ได้ · ห้ามสร้างภาพทดแทน · ตารางนี้จึงเป็น **"หน้าอ้างอิงที่มีภาพของจริง"** (แต่ละหน้า wiki มี gallery ในหน้า) ไม่ใช่ลิงก์ไฟล์ภาพ — ต้องเปิดหน้าเพื่อเลือกภาพ

| ต้องการอ้างอิง | Door | Entity | ประโยชน์สำหรับ 2D | URL หน้าที่มีภาพ |
|---|---|---|---|---|
| รูปร่าง Rush/ออร่า | — | Rush | สัดส่วน sprite+ออร่า | https://doors-game.fandom.com/wiki/Rush |
| Ambush | — | Ambush | หน้าตา + ท่าทาง | https://doors-game.fandom.com/wiki/Ambush |
| Seek + แขน + โคมระย้า | 29–42/69–75 | Seek | layout chase+obstacle | https://doors-game.fandom.com/wiki/Seek |
| Figure ทุกเวอร์ชัน | 50/100 | Figure | หน้าตา, ท่าเดิน | https://doors-game.fandom.com/wiki/Figure |
| Screech | มืด | Screech | sprite + จุดเกิด | https://doors-game.fandom.com/wiki/Screech |
| Halt hallway | — | Halt | layout ห้องยาว | https://doors-game.fandom.com/wiki/Halt · https://doors-game.fandom.com/wiki/The_Dining_Hall |
| Eyes | — | Eyes | ออร่าม่วง | https://doors-game.fandom.com/wiki/Eyes |
| ตู้/เตียง/ที่ซ่อน | ทุก Door | Hide | รูปทรงตู้ | https://doors-game.fandom.com/wiki/Hiding |
| Library | 50 | Figure | layout 2 ชั้น/ชั้นหนังสือ | https://doors-game.fandom.com/wiki/The_Library |
| Electrical Room | 100 | Figure | บันได/ชั้นวาง/ลิฟต์ | https://doors-game.fandom.com/wiki/The_Electrical_Room |
| Greenhouse | 90–98 | Snare | layout 3 แบบ | https://doors-game.fandom.com/wiki/The_Greenhouse |
| Courtyard | 89 | — | outdoor tileset | https://doors-game.fandom.com/wiki/The_Courtyard |
| Jeff Shop | 52 | Jeff/El Goblino/Bob | UI ร้านค้า | https://doors-game.fandom.com/wiki/Jeff_Shop |
| Meeting Room | 10+ | — | ปริศนาภาพ | https://doors-game.fandom.com/wiki/The_Meeting_Room |
| Basement | 61 | — | lever/รั้ว | https://doors-game.fandom.com/wiki/The_Basement |
| Infirmary | 66–70 | — | layout+Herb room | https://doors-game.fandom.com/wiki/The_Infirmary |
| ไอเทม | — | — | icon/ท่าถือ | https://doors-game.fandom.com/wiki/Flashlight · /Lighter · /Vitamins · /Skeleton_Key |
| Dupe | ห้องหลายประตู | Dupe | ป้ายเลข | https://doors-game.fandom.com/wiki/Dupe |
| Sally | หน้าต่าง | Sally | sprite | https://doors-game.fandom.com/wiki/Sally |
| Guiding Light | — | GL | เอฟเฟกต์ไฮไลต์ | https://doors-game.fandom.com/wiki/Guiding_Light |
| วิดีโอ Entity | — | ทั้งหมด | animation timing | แนะนำค้น YouTube "DOORS Hotel+ Rush Ambush gameplay" (**ยังไม่ได้ตรวจสอบรายคลิป**) |

---

## 12. 2D Adaptation Feasibility

### 12.1 สรุป 3 กลุ่ม

| กลุ่ม | Entity |
|---|---|
| 🅰️ Fully Adaptable | Rush, Ambush, Hide, Jack, Dupe, Timothy, Snare, Dread, Shadow, Guiding Light |
| 🅱️ Adaptable with Modifications | Seek, Figure, Screech, Halt, Eyes, Sally, Void |
| 🅲 Not Suitable | Glitch (เฉพาะ failsafe ของ engine) |

### 12.2 เหตุผลต่อ Entity (ย่อ)

| Entity | ประเด็น 3D | แนวทาง 2D ที่ wiki รองรับเชิงตรรกะ | ปัญหาที่ต้องตัดสินใจ |
|---|---|---|---|
| Rush | ray-cast + ความเร็วสูง | วิ่งแนวนอนผ่านห้อง; ซ่อน=ไม่ถูกเห็น | ความเร็ว/พิกเซล ❓ |
| Ambush | rebound | ไป-กลับในแนว x | จำนวนรอบ 2–4 ✔ |
| Seek | วิ่งผ่านห้อง/maze | endless runner แนวนอน | maze, หมอบ ❓ |
| Figure | เสียง + ชั้นสอง | รัศมีเสียง + ตู้ | ชั้นบนต้องแปลงเป็นเลเยอร์ |
| Screech | หันไปมอง | flip ทิศ | เวลาตอบสนอง ❓ |
| Halt | หันหลัง | flip ทิศ | ความเร็ว ❓ |
| Eyes | กลางจอ | ไม่มีกล้อง | **ต้องออกแบบกลไกใหม่** |
| Hide | จับเวลา | ตรงเดิม | ✔ |
| Jack | ตู้/ประตู | ตรงเดิม | ✔ |
| Dupe | ประตูหลายบาน | ประตูเรียงแนว x | ✔ |
| Timothy | ลิ้นชัก | ตรงเดิม | ✔ |
| Snare | พื้น | ตรงเดิม | ✔ |
| Void | unload ห้อง | อาจไม่จำเป็น | ตามสถาปัตยกรรม |
| Dread | นาฬิกา | ตรงเดิม | ✔ |
| Shadow | jumpscare | ตรงเดิม | ✔ |
| Sally | หน้าต่าง/ทะลุผนัง | ตรงเดิม | ต้องมี "หน้าต่าง" ในฉาก |

> **ไม่ตัด Entity ใดออกเพียงเพราะเป็น 2D** — Glitch จัดเป็น C เพราะเป็นระบบ fallback ของ engine ที่ไม่มี gameplay ของตัวเอง

---

## 13. Known Limitations (สิ่งที่ยังไม่ครบ / ต้องรู้ก่อนพัฒนา)

1. **ตัวเลขที่ wiki ไม่ระบุ (ต้องตั้งเอง):** ความเร็ว Figure/Seek/Halt/Sally (studs/s), เวลาหน้าต่างหัน Screech, hitbox, spawn % ของ Rush/Seek/Halt (ปัจจุบัน), จำนวนครั้ง shiver/Halt, ความเร็วคลาน
2. **ขัดแย้งที่ยังไม่ตัดสิน (⚠):** Seek chase doors/rooms · Jeff Shop 52 vs 53–59 · Snare 20 vs 10 ดาเมจ · Rush 1/5 ใน Greenhouse · Ambush Door 88 vs 99 · Ambush rebound สูงสุด · Halt รับประกัน/ไม่รับประกัน · Vitamins stack 3 vs 5 · Lockpick 100 vs 250 · ฟัน Figure 24 vs 25
3. **หน้าที่ดึงไม่สำเร็จ:** Items, Crucifix, Lockpick, Battery, Drawers, Lore, Room Generation → ใช้แหล่งรอง/พบน้อย
4. **ยังไม่ได้ค้นคว้า:** World Lotus, Bandage, Candle, Smoothie, Holy Hand Grenade (รายละเอียด), Modifiers (รายตัว), เอกสารในเกม, ค่า loot ต่อภาชนะ, ตาราง spawn ของ Door 1–100 รายห้อง
5. **ภาพ:** ยังไม่ได้ดึงไฟล์ภาพ / วิดีโอ (ดู §11)
6. **เวอร์ชัน:** เกมอัปเดตบ่อย (Hotel+, Hunt, Mines 30 ส.ค. 2024, Outdoors 10 ส.ค. 2025) — ตัวเลขอาจเปลี่ยน ควรตรวจซ้ำก่อนล็อกค่า
7. **Door 1–100 รายห้อง:** ไม่มีข้อมูลจริงให้เติม (สุ่มตามกฎ) — เสนอให้ใช้ "ตารางกฎ" แทน (ดู `doors_rules.js`)

---

## 14. Research Sources & References

**แหล่งหลัก — DOORS Wiki (Fandom) — ดึงอ่านจริง ✔**
- https://doors-game.fandom.com/wiki/List_of_Entities
- https://doors-game.fandom.com/wiki/Rush
- https://doors-game.fandom.com/wiki/Ambush
- https://doors-game.fandom.com/wiki/Seek
- https://doors-game.fandom.com/wiki/Figure
- https://doors-game.fandom.com/wiki/Screech
- https://doors-game.fandom.com/wiki/Halt
- https://doors-game.fandom.com/wiki/Eyes
- https://doors-game.fandom.com/wiki/Hide
- https://doors-game.fandom.com/wiki/Jack
- https://doors-game.fandom.com/wiki/Dupe
- https://doors-game.fandom.com/wiki/Timothy
- https://doors-game.fandom.com/wiki/Snare
- https://doors-game.fandom.com/wiki/Void
- https://doors-game.fandom.com/wiki/Glitch
- https://doors-game.fandom.com/wiki/Dread
- https://doors-game.fandom.com/wiki/Shadow
- https://doors-game.fandom.com/wiki/Sally
- https://doors-game.fandom.com/wiki/Guiding_Light
- https://doors-game.fandom.com/wiki/El_Goblino
- https://doors-game.fandom.com/wiki/Jeff_Shop
- https://doors-game.fandom.com/wiki/The_Hotel
- https://doors-game.fandom.com/wiki/The_Library
- https://doors-game.fandom.com/wiki/The_Electrical_Room
- https://doors-game.fandom.com/wiki/The_Greenhouse
- https://doors-game.fandom.com/wiki/The_Courtyard
- https://doors-game.fandom.com/wiki/The_Dining_Hall
- https://doors-game.fandom.com/wiki/The_Meeting_Room
- https://doors-game.fandom.com/wiki/The_Basement
- https://doors-game.fandom.com/wiki/The_Infirmary
- https://doors-game.fandom.com/wiki/The_Reception
- https://doors-game.fandom.com/wiki/The_Three_Architects
- https://doors-game.fandom.com/wiki/Hiding
- https://doors-game.fandom.com/wiki/Room_Key
- https://doors-game.fandom.com/wiki/Health
- https://doors-game.fandom.com/wiki/Gold
- https://doors-game.fandom.com/wiki/Revives
- https://doors-game.fandom.com/wiki/Vitamins
- https://doors-game.fandom.com/wiki/Flashlight
- https://doors-game.fandom.com/wiki/Lighter

**แหล่งรอง 🔸 (ใช้ตรวจไขว้ราคา/Crucifix)**
- https://rblxguide.com/games/doors/items/crucifix
- https://rblxguide.com/games/doors/items
- https://www.droidgamers.com/guides/doors-jeff-shop-guide/
- https://wikiwiki.jp/doors_jp/Jeff%20Shop
- https://op.gg/ja/roblox/wiki/doors/entities
- https://rblxguide.com/games/doors/updates/how-to-beat-figure

**หน้าที่ดึงไม่สำเร็จ:** wiki/Items, wiki/Crucifix, wiki/Lockpick(s), wiki/Battery, wiki/Drawers, wiki/Lore, wiki/Room_Generation
