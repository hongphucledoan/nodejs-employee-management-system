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
      return res.status(400).json({ error: "Username and password required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate session token
    const token = generateSessionToken();
    sessions[token] = user.id;

    res.json({ 
      message: "Login successful", 
      token,
      userId: user.id,
      username: user.username
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Logout user
app.post("/api/auth/logout", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token && sessions[token]) {
      delete sessions[token];
    }
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to logout" });
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
app.post("/api/employees", async (req, res) => {
  try {
    const employee = await prisma.employee.create({
      data: req.body,
    });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Failed to create employee" });
  }
});

// Update employee
app.put("/api/employees/:id", async (req, res) => {
  try {
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// Delete employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    await prisma.employee.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete employee" });
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

// Create task
app.post("/api/tasks", async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: req.body,
      include: { employee: true },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

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
    const attendance = await prisma.attendance.create({
      data: req.body,
      include: { employee: true },
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to create attendance" });
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
    const salary = await prisma.salaryRecord.create({
      data: req.body,
      include: { employee: true },
    });
    res.json(salary);
  } catch (error) {
    res.status(500).json({ error: "Failed to create salary record" });
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
