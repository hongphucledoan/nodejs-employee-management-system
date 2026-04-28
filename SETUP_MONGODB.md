# 🚀 Hướng Dẫn Cấu Hình MongoDB + Prisma

## 📋 Yêu Cầu

- Node.js 16+ 
- MongoDB (local hoặc cloud - Atlas)
- npm hoặc yarn

---

## 🔧 Setup Steps

### 1️⃣ **Cài đặt Dependencies**
```bash
npm install
```

### 2️⃣ **Cấu hình MongoDB**

#### **Option A: MongoDB Local** (Khuyến nghị cho Development)

1. **Cài đặt MongoDB Community Edition:**
   - Download từ https://www.mongodb.com/try/download/community
   - Cài đặt và khởi động MongoDB service

2. **Kiểm tra MongoDB đang chạy:**
   ```bash
   mongosh
   ```
   - Nếu thành công, sẽ vào MongoDB shell

3. **File `.env` đã cấu hình sẵn:**
   ```
   DATABASE_URL="mongodb://localhost:27017/employee_management"
   ```

#### **Option B: MongoDB Atlas** (Cloud)

1. **Tạo tài khoản tại:** https://www.mongodb.com/cloud/atlas

2. **Tạo Cluster:**
   - Chọn Free tier
   - Chọn region gần nhất
   - Chọn Database name: `employee_management`

3. **Cấu hình Network Access:**
   - Vào Security → Network Access
   - Add IP Address → Allow from anywhere (0.0.0.0/0)

4. **Lấy Connection String:**
   - Vào Databases → Connect → Drivers → Python → Copy connection string
   - Thay `<password>` bằng password của database user
   - Thay `<database_name>` bằng `employee_management`

5. **Cập nhật `.env`:**
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster_name.mongodb.net/employee_management?retryWrites=true&w=majority"
   ```

### 3️⃣ **Migrate Dữ Liệu Mock vào Database**

```bash
npm run seed
```

**Kết quả mong đợi:**
```
🌱 Starting database seed...
🗑️  Clearing existing data...
👥 Seeding employees...
✅ Created 8 employees
📋 Seeding tasks...
✅ Created 8 tasks
📅 Seeding attendances...
✅ Created 40 attendance records
💰 Seeding salary records...
✅ Created 12 salary records

✨ Database seed completed successfully!
```

---

## ▶️ Chạy Project

### **Terminal 1: Backend Server**
```bash
npm run server:dev
```

**Output:**
```
✅ Server running on http://localhost:3001
📚 API Base URL: http://localhost:3001/api
```

### **Terminal 2: Frontend Development**
```bash
npm run dev
```

**Output:**
```
VITE v... dev server running at:
➜  Local:   http://localhost:5173/
```

---

## 📡 API Endpoints

### **Employees**
- `GET    /api/employees`           - Lấy tất cả nhân viên
- `GET    /api/employees/:id`       - Lấy chi tiết nhân viên
- `POST   /api/employees`           - Tạo nhân viên mới
- `PUT    /api/employees/:id`       - Cập nhật nhân viên
- `DELETE /api/employees/:id`       - Xóa nhân viên

### **Tasks**
- `GET    /api/tasks`               - Lấy tất cả công việc
- `GET    /api/tasks/employee/:employeeId` - Lấy công việc của nhân viên
- `POST   /api/tasks`               - Tạo công việc
- `PUT    /api/tasks/:id`           - Cập nhật công việc
- `DELETE /api/tasks/:id`           - Xóa công việc

### **Attendance**
- `GET    /api/attendances`         - Lấy tất cả chấm công
- `GET    /api/attendances/employee/:employeeId` - Lấy chấm công của nhân viên
- `POST   /api/attendances`         - Tạo bản ghi chấm công
- `PUT    /api/attendances/:id`     - Cập nhật chấm công

### **Salary**
- `GET    /api/salaries`            - Lấy tất cả bảng lương
- `GET    /api/salaries/employee/:employeeId` - Lấy lương của nhân viên
- `POST   /api/salaries`            - Tạo bảng lương
- `PUT    /api/salaries/:id`        - Cập nhật bảng lương

---

## 🛠️ Công Cụ Hữu Ích

### **Prisma Studio** (GUI để quản lý database)
```bash
npm run prisma:studio
```
- Mở http://localhost:5555
- Xem, thêm, sửa, xóa dữ liệu trực quan

### **Prisma Generate** (Tạo lại client)
```bash
npm run prisma:generate
```

---

## 📱 Cấu Hình Frontend để dùng API

Tạo file `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3001";

export const fetchEmployees = async () => {
  const res = await fetch(`${API_BASE_URL}/api/employees`);
  return res.json();
};

export const fetchTasks = async () => {
  const res = await fetch(`${API_BASE_URL}/api/tasks`);
  return res.json();
};

// ... thêm các function khác
```

---

## ✅ Kiểm Tra Setup

```bash
# 1. Kiểm tra server health
curl http://localhost:3001/health

# 2. Lấy danh sách nhân viên
curl http://localhost:3001/api/employees

# 3. Lấy danh sách công việc
curl http://localhost:3001/api/tasks
```

---

## 🐛 Troubleshooting

| Lỗi | Giải Pháp |
|-----|----------|
| `connect ECONNREFUSED` | MongoDB không chạy, khởi động MongoDB |
| `DATABASE_URL not found` | Kiểm tra file `.env` có đúng không |
| `Port 3001 already in use` | Thay port trong `.env` hoặc kill process cũ |
| `Module not found` | Chạy `npm install` lại |

---

## 📚 Tài Liệu Tham Khảo

- [Prisma Documentation](https://www.prisma.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**🎉 Hoàn tất! Project của bạn đã sẵn sàng chạy với MongoDB + Prisma**
