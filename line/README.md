# LINE demo (Rich Menu -> local web)

เอกสารนี้ทำไว้เพื่อ “เทสเดโมเร็วๆ” ว่าปุ่ม Rich Menu กดแล้วเปิดเว็บได้

## 1) เดโมแบบไม่ต้องมีโดเมน (LINE Desktop + localhost)
เงื่อนไข: ต้องกดจาก LINE บน “เครื่องคอมเครื่องเดียวกัน” ที่รันเว็บอยู่

- ✅ ใช้ได้: `http://localhost:3000` หรือ `http://127.0.0.1:3000`
- ❌ มือถือใช้ไม่ได้: บนมือถือ `localhost` จะชี้ไปที่ “มือถือ” ไม่ใช่คอม

### ขั้นตอน
1. รันเว็บบนเครื่องคอมของคุณ
   - ถ้าเป็นเว็บทั่วไป: ให้มี URL เช่น `http://localhost:3000`
   - ถ้าเป็น Expo: ใช้ `npx expo start --web` แล้วดูพอร์ตที่รัน
2. ไปที่ LINE Official Account Manager → Rich menu
3. เลือกปุ่ม → ตั้งค่า Action เป็น **Open URL**
4. ใส่ URL เช่น `http://127.0.0.1:3000`
5. เปิด LINE Desktop → เข้าห้องแชท OA → กด Rich Menu

หมายเหตุ:
- บางเครื่อง/บาง policy อาจบล็อก `http` ได้ แต่สำหรับเดโมบนคอมมักผ่าน

## 2) ถ้าต้องการเดโมบนมือถือด้วย (แนะนำ)
ใช้ public HTTPS URL ชั่วคราว เช่น ngrok/Cloudflare Tunnel แล้วเอา URL ไปใส่ใน Rich Menu

ตัวอย่าง (ngrok):
1. รันเว็บที่ `http://localhost:3000`
2. รัน `ngrok http 3000`
3. จะได้ URL เช่น `https://xxxx.ngrok-free.app`
4. นำ URL นี้ไปใส่ใน Rich Menu

## 3) ถ้าจะใช้ LIFF / LINE Login
ถ้าคุณอยากให้ Rich Menu เปิดแบบ “LIFF” (URL หน้าตา `https://liff.line.me/{LIFF_ID}`) เพื่อเดโมว่าเปิดเว็บผ่าน LINE ได้:

- ฝั่ง LINE (จำเป็น)
   - สร้าง LIFF app ใน LINE Developers Console
   - ตั้ง **LIFF Endpoint URL** ให้เป็น `https://...` ที่เข้าถึงได้จริง (เช่น ngrok)
   - ได้ค่า **LIFF ID**
- ฝั่งโค้ด (เปลี่ยนน้อย)
   - ทำหน้าเว็บ 1 หน้าให้เปิดได้ผ่าน https (ไฟล์เดโมมีให้แล้ว)

เดโมพร้อมใช้:
- `line/liff-demo/index.html`
- `line/liff-demo/README.md`

ไฟล์ `line/.env.example` เอาไว้เก็บค่า LIFF ID / tokens สำหรับต่อยอด (อย่า commit ค่า secret จริง)
