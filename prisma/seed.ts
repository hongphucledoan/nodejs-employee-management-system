import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Import mock data
import {
  employees,
  tasks,
  attendanceRecords,
  salaryRecords,
} from "../src/data/mockData";

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data (without transactions)
    console.log("🗑️  Clearing existing data...");
    // Use deleteMany without transaction - will work on standalone MongoDB
    try {
      await prisma.salaryRecord.deleteMany({});
      await prisma.attendance.deleteMany({});
      await prisma.task.deleteMany({});
      await prisma.employee.deleteMany({});
    } catch (error: any) {
      // If deleteMany fails due to replica set requirement, try alternative approach
      if (error.code === 'P2031') {
        console.warn('⚠️  MongoDB replica set not configured, using single document deletes...');
        const empCount = await prisma.employee.count();
        if (empCount > 0) {
          const employees = await prisma.employee.findMany({ select: { id: true } });
          for (const emp of employees) {
            await prisma.employee.delete({ where: { id: emp.id } });
          }
        }
      }
    }

    // Seed Employees
    console.log("👥 Seeding employees...");
    const createdEmployees = [];
    for (const emp of employees) {
      const created = await prisma.employee.create({
        data: {
          empId: emp.id,
          name: emp.name,
          avatar: emp.avatar,
          department: emp.department,
          position: emp.position,
          email: emp.email,
          phone: emp.phone,
          joinDate: emp.joinDate,
          status: emp.status,
          salary: emp.salary,
          level: emp.level,
        },
      });
      createdEmployees.push(created);
    }
    console.log(`✅ Created ${createdEmployees.length} employees`);

    // Create a map of original IDs to new MongoDB IDs
    const employeeIdMap = new Map(
      createdEmployees.map((emp, idx) => [employees[idx].id, emp.id])
    );

    // Seed Tasks
    console.log("📋 Seeding tasks...");
    const createdTasks = [];
    for (const task of tasks) {
      const mongoEmployeeId = employeeIdMap.get(task.employeeId);
      if (!mongoEmployeeId) {
        console.warn(`⚠️  Employee ${task.employeeId} not found for task ${task.id}`);
        continue;
      }
      const created = await prisma.task.create({
        data: {
          taskId: task.id,
          title: task.title,
          employeeId: mongoEmployeeId,
          priority: task.priority,
          status: task.status,
          deadline: task.deadline,
          progress: task.progress,
          description: task.description,
          project: task.project,
        },
      });
      createdTasks.push(created);
    }
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Seed Attendances
    console.log("📅 Seeding attendances...");
    const createdAttendances = await Promise.all(
      attendanceRecords.map((att) => {
        const mongoEmployeeId = employeeIdMap.get(att.employeeId);
        if (!mongoEmployeeId) {
          console.warn(`⚠️  Employee ${att.employeeId} not found for attendance ${att.id}`);
          return null;
        }
        return prisma.attendance.create({
          data: {
            attId: att.id,
            employeeId: mongoEmployeeId,
            date: att.date,
            checkIn: att.checkIn,
            checkOut: att.checkOut,
            status: att.status,
            workHours: att.workHours,
          },
        });
      })
    );
    const validAttendances = createdAttendances.filter((a) => a !== null);
    console.log(`✅ Created ${validAttendances.length} attendance records`);

    // Seed Salary Records
    console.log("💰 Seeding salary records...");
    const createdSalaries = await Promise.all(
      salaryRecords.map((sal) => {
        const mongoEmployeeId = employeeIdMap.get(sal.employeeId);
        if (!mongoEmployeeId) {
          console.warn(`⚠️  Employee ${sal.employeeId} not found for salary ${sal.id}`);
          return null;
        }
        return prisma.salaryRecord.create({
          data: {
            salId: sal.id,
            employeeId: mongoEmployeeId,
            month: sal.month,
            baseSalary: sal.baseSalary,
            bonus: sal.bonus,
            deduction: sal.deduction,
            tax: sal.tax,
            netSalary: sal.netSalary,
            status: sal.status,
          },
        });
      })
    );
    const validSalaries = createdSalaries.filter((s) => s !== null);
    console.log(`✅ Created ${validSalaries.length} salary records`);

    console.log("\n✨ Database seed completed successfully!");
    console.log(`
    📊 Summary:
    - Employees: ${createdEmployees.length}
    - Tasks: ${createdTasks.length}
    - Attendance Records: ${validAttendances.length}
    - Salary Records: ${validSalaries.length}
    `);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
