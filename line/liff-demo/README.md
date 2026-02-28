# LIFF demo

โฟลเดอร์นี้เป็น “หน้าเว็บเดโม” สำหรับเปิดผ่าน LINE (LIFF) โดยตรง

## สิ่งที่ต้องมี (สำหรับ LIFF)
- ต้องสร้าง LIFF app ใน LINE Developers Console
- ต้องตั้งค่า LIFF Endpoint URL เป็น `https://...` ที่เข้าถึงได้จริง

> หมายเหตุ: ถ้าคุณแค่ต้องการให้ Rich Menu เปิดเว็บเฉยๆ (ไม่ใช้ LIFF) จะใช้ URL อะไรก็ได้ที่เปิดได้ แต่ถ้าอยากเปิดผ่าน LIFF URL (`https://liff.line.me/{LIFF_ID}`) ต้องมี LIFF app

## วิธีเดโม่เร็ว (แนะนำ)
1) รัน static server สำหรับไฟล์นี้
- เข้าโฟลเดอร์ `line/liff-demo/`
- ใช้ตัวใดตัวหนึ่ง:
  - `python -m http.server 3000`
  - หรือ `npx serve -l 3000 .`

2) เปิด public https ให้เครื่อง local (ngrok)
- `ngrok http 3000`
- จะได้ URL เช่น `https://xxxx.ngrok-free.app`

3) ไปที่ LINE Developers Console
- เลือก Provider → Channel (ประเภท LIFF)
- Add LIFF app
  - Endpoint URL: `https://xxxx.ngrok-free.app/index.html`
  - (แนะนำ) Scope: `profile`, `openid`
- ได้ค่า `LIFF ID`

4) ตั้ง Rich Menu ให้เปิด LIFF
- ที่ Rich Menu ปุ่มนั้น เลือก Open URL
- ใส่: `https://liff.line.me/{LIFF_ID}`

## ปรับค่า LIFF ID ในหน้าเดโม่
- แก้ที่ `line/liff-demo/index.html` ค่า `LIFF_ID_FALLBACK`
- หรือถ้าเปิดตรงๆ (ไม่ผ่าน liff.line.me) ใส่ querystring `?liffId=...`

## เช็คว่าเดโม่สำเร็จ
- เปิดจาก LINE แล้วกด Init
- ถ้า login แล้ว จะกด Get profile ได้ และเห็น displayName/userId
