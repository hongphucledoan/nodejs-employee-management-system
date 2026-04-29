import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Session storeAUTH ROUTES ============
// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Yêu cầu nhập đầy đủ trường dữ liệu" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    }

    // Generate session token
    const token = generateSessionToken();
    sessions[token] = user.id;

    res.json({ 
      message: "Đăng nhập thành công", 
      token,
      userId: user.id,
      username: user.username
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Đăng nhập thất bại" });
  }
});

// Logout user
app.post("/api/auth/logout", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token && sessions[token]) {
      delete sessions[token];
    }
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ error: "Đăng xuất thất bại" });
  }
});

// Verify token
app.get("/api/auth/verify", (req, res) => {
  const userId = checkAuth(req, res);
  if (userId) {
    res.json({ authenticated: true, userId });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// ============  (simple in-memory solution)
const sessions: { [key: string]: string } = {};

// Helper function to generate session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Auth middleware to check if user is logged in
function checkAuth(req: Request, res: Response): string | null {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !sessions[token]) {
    return null;
  }
  return sessions[token];
}

// ============ EMPLOYEE ROUTES ============
// Get all employees
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        tasks: true,
        attendances: true,
        salaries: true,
      },
    });
    res.json(employees);
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    res.status(500).json({ 
      error: "Failed to fetch employees",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get employee by ID
app.get("/api/employees/:id", async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: true,
        attendances: true,
        salaries: true,
      },
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

// Create employee
// app.post("/api/employees", async (req, res) => {
//   try {
//     const employee = await prisma.employee.create({
//       data: req.body,
//     });
//     res.json(employee);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create employee" });
//   }
// });

// // Update employee
// app.put("/api/employees/:id", async (req, res) => {
//   try {
//     const employee = await prisma.employee.update({
//       where: { id: req.params.id },
//       data: req.body,
//     });
//     res.json(employee);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update employee" });
//   }
// });

// // Delete employee
// app.delete("/api/employees/:id", async (req, res) => {
//   try {
//     await prisma.employee.delete({
//       where: { id: req.params.id },
//     });
//     res.json({ message: "Employee deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete employee" });
//   }
// });

// Create employee - with better error handling
app.post("/api/employees", async (req, res) => {
  try {
    const { name, email, phone, department, position, salary, level, status } = req.body;

    // 1. Validate dữ liệu cơ bản
    if (!name || !email || !phone || !department || !position) {
      return res.status(400).json({ 
        error: "Thiếu thông tin bắt buộc (name, email, phone, department, position)" 
      });
    }

    // 2. Sinh empId tự động (EMP001, EMP002, ...)
    // Lưu ý: Tìm theo empId cuối cùng, không phải id
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { empId: "desc" }, // Sắp xếp theo empId để lấy mã mới nhất
      select: { empId: true },
    });

    let nextNum = 1;
    if (lastEmployee?.empId?.startsWith("EMP")) {
      const numPart = lastEmployee.empId.slice(3);
      // Kiểm tra xem phần số có valid không
      if (!isNaN(parseInt(numPart))) {
        nextNum = parseInt(numPart) + 1;
      }
    }
    
    // Định dạng lại thành EMP001, EMP002...
    const newEmpId = `EMP${nextNum.toString().padStart(3, "0")}`;

    // 3. Kiểm tra trùng email hoặc phone
    const existing = await prisma.employee.findFirst({
      where: { 
        OR: [
          { email: email.trim() },
          { phone: phone.trim() }
        ]
      },
    });

    if (existing) {
      return res.status(409).json({ 
        error: existing.email === email.trim() 
          ? "Email này đã tồn tại trong hệ thống" 
          : "Số điện thoại này đã tồn tại trong hệ thống" 
      });
    }

    const avatar = name.trim().charAt(0).toUpperCase();

    // 4. Tạo ngày tháng chuẩn ISO (YYYY-MM-DD)
    const today = new Date();
    const isoDateString = today.toISOString().split('T')[0]; // Lấy phần "YYYY-MM-DD"

    // 5. Tạo nhân viên mới
    const employee = await prisma.employee.create({
      data: {
        empId: newEmpId,       // Gán vào trường empId, KHÔNG PHẢI id
        name: name.trim(),
        avatar,
        department,
        position: position.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        joinDate: isoDateString, // Gửi string dạng "2026-04-29"
        status: status || "active",
        salary: parseInt(salary) || 0,
        level: level || "Junior",
        // id, createdAt, updatedAt sẽ được Prisma/MongoDB tự động xử lý
      },
    });

    console.log(`✅ Employee created: ${newEmpId} - ${name}`);

    return res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công",
      employee,
    });

  } catch (error: any) {
    console.error("❌ Error creating employee:", error);

    // Xử lý lỗi trùng lặp cụ thể của MongoDB/Prisma
    if (error.code === "P2002") {
      return res.status(409).json({ 
        error: "Dữ liệu bị trùng (Email hoặc Mã nhân viên)" 
      });
    }

    return res.status(500).json({ 
      error: "Không thể thêm nhân viên. Vui lòng thử lại.",
      details: error.message || "Unknown error"
    });
  }
});

// ============ UPDATE EMPLOYEE ROUTE ============
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params; // Đây là MongoDB ObjectId (_id)
    const { name, email, phone, department, position, salary, level, status } = req.body;

    // 1. Validate cơ bản
    if (!name || !email || !phone || !department || !position) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // 2. Kiểm tra xem nhân viên có tồn tại không
    const existingEmp = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmp) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    }

    // 3. Kiểm tra trùng Email/Phone (nhưng phải loại trừ chính nhân viên đang sửa)
    const duplicate = await prisma.employee.findFirst({
      where: {
        AND: [
          {
            OR: [
              { email: email.trim() },
              { phone: phone.trim() }
            ]
          },
          { id: { not: id } } // Không tính chính nó
        ]
      },
    });

    if (duplicate) {
      return res.status(409).json({
        error: duplicate.email === email.trim()
          ? "Email này đã được sử dụng bởi nhân viên khác"
          : "Số điện thoại này đã được sử dụng bởi nhân viên khác"
      });
    }

    // 4. Cập nhật dữ liệu
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name: name.trim(),
        avatar: name.trim().charAt(0).toUpperCase(), // Cập nhật lại avatar nếu đổi tên
        department,
        position: position.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        status,
        salary: parseInt(salary) || 0,
        level,
        // joinDate giữ nguyên, không cho sửa qua form này để đảm bảo lịch sử
      },
    });

    console.log(`✅ Employee updated: ${id}`);

    return res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      employee: updatedEmployee,
    });

  } catch (error: any) {
    console.error("❌ Error updating employee:", error);
    return res.status(500).json({
      error: "Lỗi server khi cập nhật nhân viên",
      details: error.message
    });
  }
});


// ============ TASK ROUTES ============
// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { employee: true },
    });
    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ 
      error: "Failed to fetch tasks",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get tasks by employee
app.get("/api/tasks/employee/:employeeId", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { employeeId: req.params.employeeId },
      include: { employee: true },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// // Create task
// app.post("/api/tasks", async (req, res) => {
//   try {
//     const task = await prisma.task.create({
//       data: req.body,
//       include: { employee: true },
//     });
//     res.json(task);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create task" });
//   }
// });

// Update task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: { employee: true },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// ============ CREATE TASK ROUTE ============
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, employeeId, priority, status, deadline, progress, description, project } = req.body;

    // 1. Validate cơ bản
    if (!title || !employeeId || !deadline || !project) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc (Title, Employee, Deadline, Project)" });
    }

    // 2. Sinh taskId tự động (TASK001, TASK002...)
    const lastTask = await prisma.task.findFirst({
      orderBy: { taskId: "desc" },
      select: { taskId: true },
    });

    let nextNum = 1;
    if (lastTask?.taskId?.startsWith("TASK")) {
      const numPart = lastTask.taskId.slice(4);
      if (!isNaN(parseInt(numPart))) {
        nextNum = parseInt(numPart) + 1;
      }
    }
    const newTaskId = `TASK${nextNum.toString().padStart(3, "0")}`;

    // 3. Tạo task mới
    const task = await prisma.task.create({
      data: {
        taskId: newTaskId,
        title: title.trim(),
        employeeId, // MongoDB ObjectId của nhân viên
        priority: priority || "medium",
        status: status || "todo",
        deadline, // String format YYYY-MM-DD
        progress: parseInt(progress) || 0,
        description: description ? description.trim() : "",
        project: project.trim(),
      },
      include: { employee: true }, // Trả về kèm thông tin nhân viên để frontend hiển thị ngay
    });

    console.log(`✅ Task created: ${newTaskId} - ${title}`);

    return res.status(201).json({
      success: true,
      message: "Thêm công việc thành công",
      task,
    });

  } catch (error: any) {
    console.error("❌ Error creating task:", error);
    return res.status(500).json({
      error: "Không thể thêm công việc",
      details: error.message
    });
  }
});

// ============ UPDATE TASK ROUTE ============
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params; // MongoDB ObjectId
    const { title, employeeId, priority, status, deadline, progress, description, project } = req.body;

    // 1. Kiểm tra tồn tại
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Không tìm thấy công việc" });
    }

    // 2. Cập nhật dữ liệu
    const updatedTask = await prisma.task.update({
      where: { id }, 
      data: {
        title: title?.trim(),
        employeeId,
        priority,
        status,
        deadline,
        progress: parseInt(progress),
        description: description?.trim(),
        project: project?.trim(),
      },
      include: { employee: true },
    });

    console.log(`✅ Task updated: ${id}`);

    return res.json({
      success: true,
      message: "Cập nhật công việc thành công",
      task: updatedTask,
    });

  } catch (error: any) {
    console.error("❌ Error updating task:", error);
    return res.status(500).json({
      error: "Lỗi server khi cập nhật công việc",
      details: error.message
    });
  }
});


// ============ ATTENDANCE ROUTES ============
// Get all attendances
app.get("/api/attendances", async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      include: { employee: true },
    });
    res.json(attendances);
  } catch (error) {
    console.error("❌ Error fetching attendances:", error);
    res.status(500).json({ 
      error: "Failed to fetch attendances",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get attendances by employee
app.get("/api/attendances/employee/:employeeId", async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { employeeId: req.params.employeeId },
      include: { employee: true },
    });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendances" });
  }
});

// Create attendance
app.post("/api/attendances", async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status } = req.body;

    if (!employeeId || !date || !checkIn || !status) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Check duplicate
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date,
      },
    });

    if (existing) {
      return res.status(409).json({ error: "Nhân viên này đã được chấm công trong ngày này" });
    }

    // Generate attId
    const lastAtt = await prisma.attendance.findFirst({
      orderBy: { attId: "desc" },
      select: { attId: true },
    });

    let nextNum = 1;
    if (lastAtt?.attId?.startsWith("A")) {
      const numPart = lastAtt.attId.slice(1);
      if (!isNaN(parseInt(numPart))) {
        nextNum = parseInt(numPart) + 1;
      }
    }
    const newAttId = `A${nextNum.toString().padStart(3, "0")}`;

    // Calculate workHours
    let workHours = 0;
    if (checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      const diff = (outH + outM / 60) - (inH + inM / 60);
      workHours = diff > 0 ? parseFloat(diff.toFixed(2)) : 0;
    }

    const attendance = await prisma.attendance.create({
      data: {
        attId: newAttId,
        employeeId,
        date,
        checkIn,
        checkOut: checkOut || "",
        status,
        workHours,
      },
      include: { employee: true },
    });

    res.status(201).json(attendance);
  } catch (error: any) {
    console.error("❌ Error creating attendance:", error);
    res.status(500).json({ 
      error: "Không thể thêm chấm công",
      details: error.message
    });
  }
});

// Update attendance
app.put("/api/attendances/:id", async (req, res) => {
  try {
    const attendance = await prisma.attendance.update({
      where: { id: req.params.id },
      data: req.body,
      include: { employee: true },
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

// ============ SALARY ROUTES ============
// Get all salary records
app.get("/api/salaries", async (req, res) => {
  try {
    const salaries = await prisma.salaryRecord.findMany({
      include: { employee: true },
    });
    res.json(salaries);
  } catch (error) {
    console.error("❌ Error fetching salaries:", error);
    res.status(500).json({ 
      error: "Failed to fetch salaries",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get salaries by employee
app.get("/api/salaries/employee/:employeeId", async (req, res) => {
  try {
    const salaries = await prisma.salaryRecord.findMany({
      where: { employeeId: req.params.employeeId },
      include: { employee: true },
    });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch salaries" });
  }
});

// Create salary record
app.post("/api/salaries", async (req, res) => {
  try {
    const { employeeId, month, baseSalary, bonus, deduction, tax, status } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const existing = await prisma.salaryRecord.findFirst({
      where: {
        employeeId,
        month,
      },
    });

    if (existing) {
      return res.status(409).json({ error: "Nhân viên này đã có bảng lương trong tháng này" });
    }

    const lastSal = await prisma.salaryRecord.findFirst({
      orderBy: { salId: "desc" },
      select: { salId: true },
    });

    let nextNum = 1;
    if (lastSal?.salId?.startsWith("SAL")) {
      const numPart = lastSal.salId.slice(3);
      if (!isNaN(parseInt(numPart))) {
        nextNum = parseInt(numPart) + 1;
      }
    }
    const newSalId = `SAL${nextNum.toString().padStart(3, "0")}`;

    const base = parseInt(baseSalary) || 0;
    const bns = parseInt(bonus) || 0;
    const ded = parseInt(deduction) || 0;
    const tx = parseInt(tax) || 0;
    const net = base + bns - ded - tx;

    const salary = await prisma.salaryRecord.create({
      data: {
        salId: newSalId,
        employeeId,
        month,
        baseSalary: base,
        bonus: bns,
        deduction: ded,
        tax: tx,
        netSalary: net,
        status: status || "pending",
      },
      include: { employee: true },
    });
    res.status(201).json(salary);
  } catch (error: any) {
    console.error("❌ Error creating salary:", error);
    res.status(500).json({ error: "Failed to create salary record", details: error.message });
  }
});

// Update salary record
app.put("/api/salaries/:id", async (req, res) => {
  try {
    const salary = await prisma.salaryRecord.update({
      where: { id: req.params.id },
      data: req.body,
      include: { employee: true },
    });
    res.json(salary);
  } catch (error) {
    res.status(500).json({ error: "Failed to update salary record" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
