# Employee Management System (Hệ thống Quản lý Nhân sự)

Dự án Hệ thống Quản lý Nhân sự ứng dụng công nghệ MERN-Stack (MongoDB, Express, React, Node.js) kết hợp với Prisma ORM.

## Yêu cầu hệ thống (Prerequisites)
Trước khi cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt sẵn các phần mềm sau:
- **Node.js**: Phiên bản LTS (v20 trở lên). Bạn có thể tải tại [nodejs.org](https://nodejs.org/).
- **MongoDB**: Đã cài đặt MongoDB Community Server chạy ở localhost (mặc định cổng `27017`) hoặc có chuỗi kết nối (URI) tới MongoDB Atlas Cloud.
- **Git**: Dùng để clone mã nguồn (Tùy chọn).

---

## Hướng dẫn Cài đặt & Vận hành (Installation & Setup)

Để chạy được mã nguồn trên máy tính cá nhân, bạn vui lòng thực hiện tuần tự theo các bước dưới đây:

### Bước 1: Tải mã nguồn và cài đặt thư viện
Mở Terminal / Command Prompt tại thư mục gốc của dự án và chạy lệnh sau để tải toàn bộ thư viện cần thiết (vào thư mục `node_modules`):
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường
1. Tìm file có tên `.env.example` trong thư mục gốc.
2. Sao chép và đổi tên file đó thành `.env`.
3. Mở file `.env` và điền chuỗi kết nối Database của bạn vào biến `DATABASE_URL`. 
*(Ví dụ sử dụng MongoDB ở máy ảo local: `DATABASE_URL="mongodb://localhost:27017/employee_db"`)*

### Bước 3: Khởi tạo Cơ sở dữ liệu với Prisma
Sau khi đã cấu hình `.env`, chạy lệnh sau để hệ thống tự động phân tích và tạo bộ thư viện kết nối Database:
```bash
npx prisma generate
```
*(Tùy chọn)* Nếu bạn muốn bơm một số dữ liệu mẫu ban đầu (tài khoản admin, nhân sự ảo) vào hệ thống để kiểm thử, hãy chạy lệnh:
```bash
npm run seed
```

### Bước 4: Khởi động Ứng dụng
Hệ thống này được chia làm hai phần (Backend và Frontend), do đó bạn cần mở **2 cửa sổ Terminal độc lập** để chạy đồng thời:

**Terminal 1 (Chạy Backend Server Node.js):**
```bash
npm run server:dev
```
*Server sẽ bắt đầu chạy và lắng nghe ở cổng `3001`.*

**Terminal 2 (Chạy Frontend React):**
```bash
npm run dev
```
*Giao diện người dùng sẽ được Build bằng Vite và phục vụ ở cổng `http://localhost:5173`.*

### Bước 5: Trải nghiệm
- Mở trình duyệt web và truy cập vào địa chỉ: [http://localhost:5173](http://localhost:5173).
- Sử dụng tài khoản mặc định (đã được tạo ra nếu bạn chạy lệnh seed ở Bước 3) để đăng nhập và trải nghiệm hệ thống.

---

## Các công nghệ sử dụng (Tech Stack)
- **Frontend:** React 19, Vite, Tailwind CSS v4, Recharts, Lucide-React.
- **Backend:** Node.js, Express.js (v5), Prisma ORM, bcryptjs.
- **Database:** MongoDB.
- **Ngôn ngữ chung:** TypeScript.
