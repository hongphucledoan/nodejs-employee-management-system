import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
