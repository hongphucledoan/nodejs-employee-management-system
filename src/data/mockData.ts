export interface Employee {
  id: string;
  name: string;
  avatar: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "inactive" | "probation";
  salary: number;
  level: "Junior" | "Mid" | "Senior" | "Lead" | "Manager";
}

export interface Task {
  id: string;
  title: string;
  employeeId: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "review" | "done";
  deadline: string;
  progress: number;
  description: string;
  project: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "leave" | "remote";
  workHours: number;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  tax: number;
  netSalary: number;
  status: "paid" | "pending" | "processing";
}

export const employees: Employee[] = [
  {
    id: "EMP001",
    name: "Nguyễn Văn An",
    avatar: "NVA",
    department: "Backend",
    position: "NodeJS Developer",
    email: "an.nguyen@nodejscorp.vn",
    phone: "0901234567",
    joinDate: "2022-03-15",
    status: "active",
    salary: 25000000,
    level: "Senior",
  },
  {
    id: "EMP002",
    name: "Trần Thị Bích",
    avatar: "TTB",
    department: "Frontend",
    position: "React Developer",
    email: "bich.tran@nodejscorp.vn",
    phone: "0912345678",
    joinDate: "2023-01-10",
    status: "active",
    salary: 18000000,
    level: "Mid",
  },
  {
    id: "EMP003",
    name: "Lê Minh Cường",
    avatar: "LMC",
    department: "DevOps",
    position: "DevOps Engineer",
    email: "cuong.le@nodejscorp.vn",
    phone: "0923456789",
    joinDate: "2021-07-20",
    status: "active",
    salary: 30000000,
    level: "Lead",
  },
  {
    id: "EMP004",
    name: "Phạm Thị Dung",
    avatar: "PTD",
    department: "QA",
    position: "QA Engineer",
    email: "dung.pham@nodejscorp.vn",
    phone: "0934567890",
    joinDate: "2023-06-01",
    status: "probation",
    salary: 12000000,
    level: "Junior",
  },
  {
    id: "EMP005",
    name: "Hoàng Văn Em",
    avatar: "HVE",
    department: "Backend",
    position: "NodeJS Developer",
    email: "em.hoang@nodejscorp.vn",
    phone: "0945678901",
    joinDate: "2020-11-05",
    status: "active",
    salary: 35000000,
    level: "Manager",
  },
  {
    id: "EMP006",
    name: "Vũ Thị Phương",
    avatar: "VTP",
    department: "UI/UX",
    position: "UI/UX Designer",
    email: "phuong.vu@nodejscorp.vn",
    phone: "0956789012",
    joinDate: "2022-09-14",
    status: "active",
    salary: 20000000,
    level: "Mid",
  },
  {
    id: "EMP007",
    name: "Đặng Quốc Hùng",
    avatar: "DQH",
    department: "Backend",
    position: "Database Admin",
    email: "hung.dang@nodejscorp.vn",
    phone: "0967890123",
    joinDate: "2021-04-22",
    status: "inactive",
    salary: 22000000,
    level: "Senior",
  },
  {
    id: "EMP008",
    name: "Bùi Thị Lan",
    avatar: "BTL",
    department: "HR",
    position: "HR Manager",
    email: "lan.bui@nodejscorp.vn",
    phone: "0978901234",
    joinDate: "2019-08-30",
    status: "active",
    salary: 28000000,
    level: "Manager",
  },
];

export const tasks: Task[] = [
  {
    id: "TASK001",
    title: "Xây dựng REST API quản lý người dùng",
    employeeId: "EMP001",
    priority: "high",
    status: "in-progress",
    deadline: "2025-07-30",
    progress: 65,
    description: "Phát triển API với Express.js và MongoDB",
    project: "NodeJS CRM System",
  },
  {
    id: "TASK002",
    title: "Thiết kế giao diện Dashboard",
    employeeId: "EMP002",
    priority: "medium",
    status: "review",
    deadline: "2025-07-25",
    progress: 90,
    description: "Tạo dashboard responsive với React + Tailwind",
    project: "NodeJS CRM System",
  },
  {
    id: "TASK003",
    title: "Cấu hình CI/CD pipeline",
    employeeId: "EMP003",
    priority: "urgent",
    status: "in-progress",
    deadline: "2025-07-20",
    progress: 45,
    description: "Setup GitHub Actions và Docker deployment",
    project: "DevOps Infrastructure",
  },
  {
    id: "TASK004",
    title: "Kiểm thử API authentication",
    employeeId: "EMP004",
    priority: "high",
    status: "todo",
    deadline: "2025-08-05",
    progress: 0,
    description: "Viết test cases cho JWT và OAuth2",
    project: "NodeJS CRM System",
  },
  {
    id: "TASK005",
    title: "Tối ưu hóa database queries",
    employeeId: "EMP005",
    priority: "medium",
    status: "done",
    deadline: "2025-07-10",
    progress: 100,
    description: "Optimize MongoDB aggregation pipelines",
    project: "Performance Optimization",
  },
  {
    id: "TASK006",
    title: "Thiết kế UI/UX mobile app",
    employeeId: "EMP006",
    priority: "low",
    status: "in-progress",
    deadline: "2025-08-15",
    progress: 30,
    description: "Figma prototype cho ứng dụng di động",
    project: "Mobile App Project",
  },
  {
    id: "TASK007",
    title: "Setup Kubernetes cluster",
    employeeId: "EMP003",
    priority: "high",
    status: "todo",
    deadline: "2025-08-10",
    progress: 0,
    description: "Deploy microservices lên K8s",
    project: "DevOps Infrastructure",
  },
  {
    id: "TASK008",
    title: "Middleware xác thực JWT",
    employeeId: "EMP001",
    priority: "urgent",
    status: "done",
    deadline: "2025-07-05",
    progress: 100,
    description: "Implement JWT middleware cho Express.js",
    project: "NodeJS CRM System",
  },
];

const today = new Date();
const getDate = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
};

export const attendanceRecords: Attendance[] = [
  // EMP001
  { id: "A001", employeeId: "EMP001", date: getDate(0), checkIn: "08:05", checkOut: "17:30", status: "present", workHours: 9.4 },
  { id: "A002", employeeId: "EMP001", date: getDate(1), checkIn: "08:30", checkOut: "18:00", status: "late", workHours: 9.5 },
  { id: "A003", employeeId: "EMP001", date: getDate(2), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  { id: "A004", employeeId: "EMP001", date: getDate(3), checkIn: "", checkOut: "", status: "leave", workHours: 0 },
  { id: "A005", employeeId: "EMP001", date: getDate(4), checkIn: "08:10", checkOut: "17:15", status: "present", workHours: 9.1 },
  // EMP002
  { id: "A006", employeeId: "EMP002", date: getDate(0), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  { id: "A007", employeeId: "EMP002", date: getDate(1), checkIn: "09:15", checkOut: "18:00", status: "late", workHours: 8.75 },
  { id: "A008", employeeId: "EMP002", date: getDate(2), checkIn: "", checkOut: "", status: "absent", workHours: 0 },
  { id: "A009", employeeId: "EMP002", date: getDate(3), checkIn: "08:00", checkOut: "17:00", status: "remote", workHours: 9.0 },
  { id: "A010", employeeId: "EMP002", date: getDate(4), checkIn: "08:05", checkOut: "17:30", status: "present", workHours: 9.4 },
  // EMP003
  { id: "A011", employeeId: "EMP003", date: getDate(0), checkIn: "07:45", checkOut: "17:00", status: "present", workHours: 9.25 },
  { id: "A012", employeeId: "EMP003", date: getDate(1), checkIn: "08:00", checkOut: "17:00", status: "remote", workHours: 9.0 },
  { id: "A013", employeeId: "EMP003", date: getDate(2), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  { id: "A014", employeeId: "EMP003", date: getDate(3), checkIn: "08:20", checkOut: "17:00", status: "late", workHours: 8.67 },
  { id: "A015", employeeId: "EMP003", date: getDate(4), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  // EMP004
  { id: "A016", employeeId: "EMP004", date: getDate(0), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  { id: "A017", employeeId: "EMP004", date: getDate(1), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  { id: "A018", employeeId: "EMP004", date: getDate(2), checkIn: "", checkOut: "", status: "leave", workHours: 0 },
  { id: "A019", employeeId: "EMP004", date: getDate(3), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  { id: "A020", employeeId: "EMP004", date: getDate(4), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
  // EMP005
  { id: "A021", employeeId: "EMP005", date: getDate(0), checkIn: "08:00", checkOut: "18:30", status: "present", workHours: 10.5 },
  { id: "A022", employeeId: "EMP005", date: getDate(1), checkIn: "08:00", checkOut: "18:00", status: "present", workHours: 10.0 },
  { id: "A023", employeeId: "EMP005", date: getDate(2), checkIn: "08:00", checkOut: "17:30", status: "remote", workHours: 9.5 },
  { id: "A024", employeeId: "EMP005", date: getDate(3), checkIn: "08:00", checkOut: "18:00", status: "present", workHours: 10.0 },
  { id: "A025", employeeId: "EMP005", date: getDate(4), checkIn: "08:00", checkOut: "17:00", status: "present", workHours: 9.0 },
];

export const salaryRecords: SalaryRecord[] = [
  { id: "SAL001", employeeId: "EMP001", month: "2025-06", baseSalary: 25000000, bonus: 3000000, deduction: 500000, tax: 2750000, netSalary: 24750000, status: "paid" },
  { id: "SAL002", employeeId: "EMP002", month: "2025-06", baseSalary: 18000000, bonus: 1500000, deduction: 0, tax: 1980000, netSalary: 17520000, status: "paid" },
  { id: "SAL003", employeeId: "EMP003", month: "2025-06", baseSalary: 30000000, bonus: 5000000, deduction: 0, tax: 3300000, netSalary: 31700000, status: "paid" },
  { id: "SAL004", employeeId: "EMP004", month: "2025-06", baseSalary: 12000000, bonus: 0, deduction: 1000000, tax: 1320000, netSalary: 9680000, status: "paid" },
  { id: "SAL005", employeeId: "EMP005", month: "2025-06", baseSalary: 35000000, bonus: 7000000, deduction: 0, tax: 3850000, netSalary: 38150000, status: "paid" },
  { id: "SAL006", employeeId: "EMP006", month: "2025-06", baseSalary: 20000000, bonus: 2000000, deduction: 0, tax: 2200000, netSalary: 19800000, status: "paid" },
  { id: "SAL007", employeeId: "EMP007", month: "2025-06", baseSalary: 22000000, bonus: 0, deduction: 2200000, tax: 2420000, netSalary: 17380000, status: "pending" },
  { id: "SAL008", employeeId: "EMP008", month: "2025-06", baseSalary: 28000000, bonus: 3500000, deduction: 0, tax: 3080000, netSalary: 28420000, status: "paid" },
  // Tháng 7
  { id: "SAL009", employeeId: "EMP001", month: "2025-07", baseSalary: 25000000, bonus: 2000000, deduction: 0, tax: 2750000, netSalary: 24250000, status: "processing" },
  { id: "SAL010", employeeId: "EMP002", month: "2025-07", baseSalary: 18000000, bonus: 0, deduction: 500000, tax: 1980000, netSalary: 15520000, status: "pending" },
  { id: "SAL011", employeeId: "EMP003", month: "2025-07", baseSalary: 30000000, bonus: 3000000, deduction: 0, tax: 3300000, netSalary: 29700000, status: "pending" },
  { id: "SAL012", employeeId: "EMP005", month: "2025-07", baseSalary: 35000000, bonus: 5000000, deduction: 0, tax: 3850000, netSalary: 36150000, status: "processing" },
];

export const departmentStats = [
  { name: "Backend", employees: 3, color: "#6366f1" },
  { name: "Frontend", employees: 1, color: "#8b5cf6" },
  { name: "DevOps", employees: 1, color: "#06b6d4" },
  { name: "QA", employees: 1, color: "#10b981" },
  { name: "UI/UX", employees: 1, color: "#f59e0b" },
  { name: "HR", employees: 1, color: "#ef4444" },
];

export const monthlyRevenue = [
  { month: "T1", revenue: 180, expense: 120 },
  { month: "T2", revenue: 200, expense: 130 },
  { month: "T3", revenue: 220, expense: 140 },
  { month: "T4", revenue: 210, expense: 135 },
  { month: "T5", revenue: 250, expense: 150 },
  { month: "T6", revenue: 240, expense: 145 },
  { month: "T7", revenue: 270, expense: 160 },
];
