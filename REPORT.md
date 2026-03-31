# Conceptual Report: SecureNote Application

## 1. JS Engine vs. Runtime

JavaScript ในโปรเจกต์นี้ถูก execute ใน 2 Environment ที่แตกต่างกัน:

**Frontend (Client-Side — Browser Runtime):**
React application ทำงานอยู่ภายใน **Browser Runtime** (เช่น Chrome หรือ Firefox) โดยใช้ **V8 JavaScript Engine** ในการ compile source code ให้เป็น machine code และรันบนเครื่องของผู้ใช้ Browser Runtime มี Web APIs เพิ่มเติมให้ใช้งาน เช่น `fetch()` สำหรับทำ HTTP request และ `document` สำหรับ DOM manipulation ซึ่งสิ่งเหล่านี้ไม่ได้เป็นส่วนหนึ่งของ JavaScript ภาษาโดยตรง แต่เป็นสิ่งที่ Runtime เพิ่มมาให้

**Backend (Server-Side — Node.js Runtime):**
Express.js server ทำงานอยู่ภายใน **Node.js Runtime** ซึ่งก็ใช้ **V8 Engine** เช่นกัน แต่แตกต่างกันตรงที่ Node.js ไม่มี Web APIs เช่น `window` หรือ `document` แต่มี **System-level APIs** แทน เช่น `fs` module สำหรับอ่าน/เขียนไฟล์, `http` module สำหรับสร้าง server และ `process.env` สำหรับอ่านค่า Environment Variables

**สรุป:** ภาษา JavaScript เป็นตัวเดียวกัน แต่ Environment ที่ execute ต่างกัน — Browser ให้ Web APIs, Node.js ให้ System APIs

---

## 2. DOM และกลไกการ Render

โปรเจกต์นี้ใช้ **React.js** ซึ่งทำงานผ่านแนวคิด **Virtual DOM**:

เมื่อ state เปลี่ยน (เช่น เพิ่มหรือลบ note) React จะไม่แก้ไข Real DOM ทันที แต่ทำตามขั้นตอนดังนี้:

1. **สร้าง Virtual DOM ใหม่** ใน memory
2. **Diffing** — เปรียบเทียบ Virtual DOM ใหม่กับอันเก่า หาว่ามีส่วนไหนเปลี่ยนแปลงบ้าง
3. **Reconciliation** — แก้ไข Real DOM เฉพาะส่วนที่เปลี่ยนแปลงเท่านั้น

ตัวอย่างในโปรเจกต์นี้: เมื่อสร้าง note สำเร็จ จะ call `setNotes((prev) => [newNote, ...prev])` ทำให้ React re-render เฉพาะส่วน notes grid เท่านั้น ไม่ได้ reload ทั้งหน้า นอกจากนี้ยังทำ **Optimistic UI** คือเพิ่ม note ลงใน state ทันทีโดยไม่ต้องรอ server ทำให้ UX ลื่นไหล

---

## 3. HTTP/HTTPS Protocols & Request/Response Cycle

เมื่อกดปุ่ม "Save Note" จะเกิดลำดับการสื่อสารดังนี้:

**1. Request:**
Browser ส่ง HTTP `POST` request ผ่าน `fetch()` API ไปยัง `POST /api/notes`

**2. Headers ที่ส่งไป:**
```
Content-Type: application/json
Authorization: <token>
X-Data-Source: local | pockethost
```

- `Content-Type: application/json` — บอก server ว่า body เป็น JSON
- `Authorization` — ส่ง token เพื่อยืนยันตัวตน
- `X-Data-Source` — บอก backend ว่าให้เก็บลง Local FS หรือ proxy ไป PocketHost

**3. Response:**
- `201 Created` — สร้าง note สำเร็จ
- `401 Unauthorized` — token ผิด → Frontend แสดง error message
- `400 Bad Request` — ข้อมูลไม่ครบ

**ทำไม HTTPS ถึงสำคัญใน Production:**
HTTP ใน local ไม่มีปัญหาเพราะ traffic ไม่ได้ผ่าน network จริง แต่ใน production การใช้ plain HTTP ทำให้ Authorization token ถูกส่งเป็น plaintext ผู้ไม่หวังดีสามารถดักจับได้ง่าย (Man-in-the-Middle attack) HTTPS ใช้ TLS encryption เข้ารหัส traffic ทั้งหมดทำให้ปลอดภัย

---

## 4. Environment Variables และ Security

`SECRET_TOKEN` ถูกเก็บไว้ใน `.env` ของ backend และ load ผ่าน `require("dotenv").config()` ซึ่งทำงานใน Node.js Runtime เท่านั้น ไฟล์นี้ถูก exclude จาก git ด้วย `.gitignore`

**ถ้าเก็บ SECRET_TOKEN ไว้ใน Frontend จะเกิดอะไรขึ้น:**
Frontend code ทั้งหมดถูก compile และส่งให้ browser ของทุกคนที่เข้าเว็บ ใครก็ตามสามารถเปิด Browser DevTools แล้วหา token ได้ทันที ทำให้ Authorization layer ทั้งหมดพังทลาย ใครก็สามารถสร้าง/ลบ note ได้โดยไม่ต้องรู้รหัสจริง

---

## 5. Bonus: Dynamic Data Routing & Proxy Middleware

ระบบนี้ implement **Two-Way Data Routing** ผ่าน custom header `X-Data-Source`:

**Local Mode (FS Persistence):**
ข้อมูลถูกเก็บลง `notes.json` ผ่าน Node.js `fs` module ทำให้ notes ยังอยู่แม้ server restart

**PocketHost Mode:**
Backend ทำหน้าที่เป็น **Proxy Middleware** รับ request จาก Frontend → inject `Bearer` prefix และ `user_id: 2` → forward ไปยัง PocketHost API ทำให้ Frontend ไม่ต้องรู้ schema ของ PocketHost โดยตรง

**Loading State:**
ทุก async operation มี dedicated loading state (`isFetching`, `isSubmitting`, `deletingId`) ที่แสดง spinner และ disable UI ขณะรอ response

---

## 6. Cloud Deployment (Bonus)

**Frontend → Vercel:**
React app deploy บน Vercel โดย connect กับ GitHub repo ตรง ทุกครั้งที่ push ไป `main` Vercel จะ build และ deploy ให้อัตโนมัติ Environment variable `VITE_API_URL` ถูก set ผ่าน Vercel Dashboard Vercel ออก SSL/TLS certificate อัตโนมัติ ทำให้ได้ HTTPS

**Backend → Render:**
Express.js server deploy เป็น Web Service บน Render โดย Environment variables (`PORT`, `SECRET_TOKEN`) ถูก inject ผ่าน Render Dashboard ทำให้ secrets ไม่เคยอยู่ใน version control