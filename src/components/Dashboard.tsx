import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEmployees, useTasks, useAttendances, useSalaries } from "../hooks/useAPI";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";


//Cấu hình cách trình bày cho thẻ thống kê
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  color: string;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
          {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue} so với tháng trước
        </div>
      )}
    </div>
  );
}


//Trang dashboard chính, hiển thị tổng quan hệ thống với các biểu đồ và thống kê quan trọng
export default function Dashboard() {
  const { employees = [], loading: empLoading, error: empError } = useEmployees();
  const { tasks = [], loading: taskLoading, error: taskError } = useTasks();
  const { attendances = [], loading: attLoading } = useAttendances();
  const { salaries = [], loading: salLoading } = useSalaries();

  // Mock data cho biểu đồ doanh thu (có thể thay bằng API sau)
  const monthlyRevenue = [
    { month: "T1", revenue: 450, expense: 300 },
    { month: "T2", revenue: 520, expense: 340 },
    { month: "T3", revenue: 480, expense: 380 },
    { month: "T4", revenue: 650, expense: 420 },
    { month: "T5", revenue: 720, expense: 450 },
    { month: "T6", revenue: 800, expense: 480 },
  ];


  // Tính departmentStats từ employees
  const departmentStats = useMemo(() => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const depts: Record<string, number> = {};
    
    (employees || []).forEach((emp) => {
      depts[emp.department] = (depts[emp.department] || 0) + 1;
    });

    return Object.entries(depts).map(([name, count], index) => ({
      name,
      employees: count,
      color: colors[index % colors.length],
    }));
  }, [employees]);

  const activeEmployees = (employees || []).filter((e) => e.status === "active").length;
  const completedTasks = (tasks || []).filter((t) => t.status === "done").length;
  const inProgressTasks = (tasks || []).filter((t) => t.status === "in-progress").length;
  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = (attendances || []).filter((a) => a.date === today && a.status === "present").length;
  const totalPayroll = (salaries || [])
    .filter((s) => s.month === "2025-07")
    .reduce((sum, s) => sum + s.netSalary, 0);

  const recentTasks = (tasks || []).slice(0, 5);
  const isLoading = empLoading || taskLoading || attLoading || salLoading;

  return (
    <div className="space-y-6">
  
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h2>
        <p className="text-slate-500 text-sm mt-1">
          Chào mừng trở lại, Admin · {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Error messages */}
      {(empError || taskError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">
            <span className="font-semibold">Lỗi:</span> {empError || taskError}
          </p>
        </div>
      )}

      {/* 4 ô Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng nhân viên"
          value={isLoading ? "..." : employees.length.toString()}
          subtitle={`${activeEmployees} đang hoạt động`}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
          trend="up"
          trendValue="+2 nhân viên"
        />
        <StatCard
          title="Công việc hoàn thành"
          value={isLoading ? "..." : `${completedTasks}/${tasks.length}`}
          subtitle={`${inProgressTasks} đang thực hiện`}
          icon={CheckCircle2}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="Chấm công hôm nay"
          value={isLoading ? "..." : `${todayAttendance}`}
          subtitle={`/${activeEmployees} nhân viên`}
          icon={Clock}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
          trend="up"
          trendValue="+3%"
        />
        <StatCard
          title="Quỹ lương T7/2025"
          value={isLoading ? "..." : `${(totalPayroll / 1000000).toFixed(0)}M`}
          subtitle="VNĐ (chưa thanh toán)"
          icon={DollarSign}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          trend="down"
          trendValue="-2M VNĐ"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu & chi phí */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Biểu đồ doanh thu & chi phí</h3>
              <p className="text-slate-400 text-xs mt-0.5">Đơn vị: Triệu VNĐ</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-500">Doanh thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <span className="text-slate-500">Chi phí</span>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Đang tải...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expense" name="Chi phí" stroke="#f43f5e" strokeWidth={2} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Biểu đồ cơ cấu phòng ban */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Cơ cấu phòng ban</h3>
          <p className="text-slate-400 text-xs mb-3">Phân bổ nhân sự</p>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Đang tải...</div>
          ) : departmentStats.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Không có dữ liệu</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={departmentStats} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="employees">
                    {departmentStats.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }}></div>
                      <span className="text-slate-600 text-xs">{dept.name}</span>
                    </div>
                    <span className="text-slate-800 text-xs font-semibold">{dept.employees} người</span>
                  </div>
                ))}
                </div>
              </>
            )}
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Công việc gần đây */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Công việc gần đây</h3>
            <Link to="/tasks" className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">
              Xem tất cả
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Đang tải...</div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Không có công việc nào</div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const emp = (employees || []).find((e) => e.id === task.employeeId);
                const priorityColor: Record<string, string> = {
                  urgent: "bg-red-100 text-red-700",
                  high: "bg-orange-100 text-orange-700",
                  medium: "bg-yellow-100 text-yellow-700",
                  low: "bg-slate-100 text-slate-600",
                };
                const statusColor: Record<string, string> = {
                  done: "text-emerald-600",
                  "in-progress": "text-blue-600",
                  review: "text-violet-600",
                  todo: "text-slate-400",
                };
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {emp?.avatar.slice(0, 2) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
                          {task.priority === "urgent" ? "Khẩn" : task.priority === "high" ? "Cao" : task.priority === "medium" ? "TB" : "Thấp"}
                        </span>
                        <span className={`text-xs font-medium ${statusColor[task.status]}`}>
                          {task.status === "done" ? "Hoàn thành" : task.status === "in-progress" ? "Đang làm" : task.status === "review" ? "Review" : "Chờ"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">{task.progress}%</div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Thông báo & cảnh báo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Thông báo & cảnh báo</h3>
          <div className="space-y-3">
            {[
              { color: "bg-red-50 border-red-200", icon: <AlertCircle size={16} className="text-red-500" />, title: "3 task sắp quá hạn", desc: "Deadline trong vòng 2 ngày tới", time: "Vừa xong" },
              { color: "bg-amber-50 border-amber-200", icon: <Clock size={16} className="text-amber-500" />, title: "Nhân viên đi muộn", desc: "Trần Thị Bích check-in lúc 09:15", time: "Hôm nay" },
              { color: "bg-blue-50 border-blue-200", icon: <Briefcase size={16} className="text-blue-500" />, title: "Đơn xin nghỉ phép", desc: "Nguyễn Văn An - 2 ngày phép", time: "1 giờ trước" },
              { color: "bg-green-50 border-green-200", icon: <TrendingUp size={16} className="text-emerald-500" />, title: "Lương T6/2025 đã thanh toán", desc: "6/8 nhân viên đã nhận lương", time: "2 ngày trước" },
              { color: "bg-violet-50 border-violet-200", icon: <Users size={16} className="text-violet-500" />, title: "Nhân viên mới thử việc", desc: "Phạm Thị Dung - QA Engineer", time: "3 ngày trước" },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${item.color}`}>
                <div className="mt-0.5">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-slate-700 text-sm font-medium">{item.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
                <span className="text-slate-400 text-xs whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
