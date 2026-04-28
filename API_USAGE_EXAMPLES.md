// Ví dụ cách sử dụng hooks trong component

/*
===========================================
CÁCH DÙNG: useEmployees Hook
===========================================
*/

import { useEmployees } from "../hooks/useAPI";

function EmployeeListExample() {
  const { employees, loading, error, refresh } = useEmployees();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Danh sách nhân viên</h1>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {employees.map((emp: any) => (
          <li key={emp.id}>{emp.name} - {emp.position}</li>
        ))}
      </ul>
    </div>
  );
}

/*
===========================================
CÁCH DÙNG: useTasks Hook
===========================================
*/

import { useTasks } from "../hooks/useAPI";

function TaskListExample() {
  // Lấy tất cả tasks
  const { tasks, loading, error } = useTasks();

  // Hoặc lấy tasks của 1 nhân viên
  // const { tasks, loading, error } = useTasks("employee-id-here");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Công việc</h1>
      <ul>
        {tasks.map((task: any) => (
          <li key={task.id}>
            {task.title} - {task.status} ({task.progress}%)
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
===========================================
CÁCH DÙNG: API Functions Trực Tiếp
===========================================
*/

import { employeeAPI, taskAPI } from "../services/api";

function CreateEmployeeExample() {
  const handleCreate = async () => {
    try {
      const newEmployee = await employeeAPI.create({
        empId: "EMP009",
        name: "Lê Văn F",
        avatar: "LVF",
        department: "HR",
        position: "HR Specialist",
        email: "f.le@company.com",
        phone: "0901234567",
        joinDate: "2025-01-15",
        status: "active",
        salary: 15000000,
        level: "Junior",
      });
      console.log("Created:", newEmployee);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleCreate}>Tạo Nhân Viên</button>;
}

/*
===========================================
CÁCH DÙNG: Update Employee
===========================================
*/

async function updateEmployee() {
  try {
    const updated = await employeeAPI.update("employee-mongodb-id", {
      salary: 28000000,
      status: "active",
    });
    console.log("Updated:", updated);
  } catch (error) {
    console.error("Error:", error);
  }
}

/*
===========================================
CÁCH DÙNG: Delete Employee
===========================================
*/

async function deleteEmployee(employeeId: string) {
  try {
    await employeeAPI.delete(employeeId);
    console.log("Deleted successfully");
  } catch (error) {
    console.error("Error:", error);
  }
}

/*
===========================================
CÁCH DÙNG: useAttendances Hook
===========================================
*/

import { useAttendances } from "../hooks/useAPI";

function AttendanceExample() {
  // Lấy tất cả attendance records
  const { attendances, loading, error, refresh } = useAttendances();

  // Hoặc lấy attendance của 1 nhân viên
  // const { attendances, loading, error, refresh } = useAttendances("employee-id");

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {attendances.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Trạng thái</th>
              <th>Giờ công</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((att: any) => (
              <tr key={att.id}>
                <td>{att.date}</td>
                <td>{att.checkIn}</td>
                <td>{att.checkOut}</td>
                <td>{att.status}</td>
                <td>{att.workHours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/*
===========================================
CÁCH DÙNG: useSalaries Hook
===========================================
*/

import { useSalaries } from "../hooks/useAPI";

function SalaryExample() {
  const { salaries, loading, error } = useSalaries();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {salaries.map((sal: any) => (
        <div key={sal.id}>
          <p>Tháng: {sal.month}</p>
          <p>Lương cơ bản: {sal.baseSalary.toLocaleString()} VNĐ</p>
          <p>Thưởng: {sal.bonus.toLocaleString()} VNĐ</p>
          <p>Lương ròng: {sal.netSalary.toLocaleString()} VNĐ</p>
          <p>Trạng thái: {sal.status}</p>
        </div>
      ))}
    </div>
  );
}

export {
  EmployeeListExample,
  TaskListExample,
  CreateEmployeeExample,
  updateEmployee,
  deleteEmployee,
  AttendanceExample,
  SalaryExample,
};
