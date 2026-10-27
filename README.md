# เว็บไซต์พันรัฐ — คู่มือตั้งค่า

## ไฟล์
index.html (หน้าสาธารณะ) · edit.html (/edit แอดมิน) · style.css · common.js · app.js · edit.js · sample.js (ข้อมูลตัวอย่าง) · config.js (ใส่ URL API) · Code.gs (Apps Script) · _redirects (ให้ /edit เปิด edit.html บน Netlify/Cloudflare Pages)

## 1) ฟอนต์
วางไฟล์ `SaoChingcha-Light.otf`, `SaoChingcha-Regular.otf`, `SaoChingcha-Bold.otf` ไว้โฟลเดอร์เดียวกับ `style.css` (ไม่ได้แนบมากับชุดนี้)

## 2) Google Sheets + Apps Script
1. สร้าง Google Sheets ใหม่ → ส่วนขยาย → Apps Script
2. วางโค้ดจาก `Code.gs` ทั้งไฟล์ แล้วรันฟังก์ชัน `setup` หนึ่งครั้ง (อนุญาตสิทธิ์) จะได้ชีต Projects, Timeline, Businesses, Products, Settings
3. ตั้งรหัสแอดมิน: Project Settings → Script properties → แก้ค่า `ADMIN_PASSWORD` (เก็บฝั่งเซิร์ฟเวอร์เท่านั้น ไม่อยู่ใน JavaScript ของเว็บ)
4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → คัดลอก URL ที่ลงท้าย `/exec`
5. เปิด `config.js` แล้วใส่ `window.PHANRAT_API='URL ที่คัดลอก';`
6. อัปโหลดโฟลเดอร์ขึ้นโฮสต์แบบ static (Netlify, Cloudflare Pages, GitHub Pages ฯลฯ) ต้องเสิร์ฟผ่าน https
7. แก้โค้ด Code.gs ภายหลัง ต้อง Deploy → Manage deployments → New version

## API
- GET `URL` → ข้อมูลสาธารณะเฉพาะที่เผยแพร่แล้ว (อ่านอย่างเดียว)
- POST (text/plain, JSON): `login` → token (อายุ 6 ชม.) · `all` · `save` · `delete` · `upload` — ทุกคำสั่งนอกจาก login ตรวจ token ฝั่งเซิร์ฟเวอร์
- ลบโครงการ → ลบ Timeline ของโครงการนั้น, ลบธุรกิจ → ลบสินค้าของธุรกิจนั้น
- รูปที่อัปโหลดเก็บใน Google Drive โฟลเดอร์ "Phanrat Uploads" (แชร์แบบดูได้ด้วยลิงก์)

## หมายเหตุ
- ห้ามใส่ข้อมูลลับในชีต Settings เพราะแสดงต่อสาธารณะ
- ถ้า API ยังไม่ตั้งค่าหรือเชื่อมไม่ได้ หน้าสาธารณะจะแสดงข้อมูลตัวอย่างพร้อมแถบแจ้งด้านบน ส่วน /edit ต้องใช้ API จริงเท่านั้น
