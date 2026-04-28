import {
  BarChart2,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { employees, tasks, departmentStats } from "../data/Dataset";

const performanceData = [
  { subject: "Hoàn thành task", A: 85, fullMark: 100 },
  { subject: "Chấm công", A: 92, fullMark: 100 },
  { subject: "Chất lượng code", A: 78, fullMark: 100 },
  { subject: "Teamwork", A: 88, fullMark: 100 },
  { subject: "Sáng tạo", A: 72, fullMark: 100 },
  { subject: "Đúng deadline", A: 80, fullMark: 100 },
];

const salaryTrendData = [
  { month: "T2", total: 145 },
  { month: "T3", total: 152 },
  { month: "T4", total: 150 },
  { month: "T5", total: 158 },
  { month: "T6", total: 159 },
  { month: "T7", total: 162 },
];

const deptSalaryData = departmentStats.map((d) => ({
  dept: d.name,
  avg: Math.floor(Math.random() * 15 + 15),
}));

export default function Reports() {
  const totalCompleted = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);

  const activeEmps = employees.filter((e) => e.status === "active").length;

  const avgSalary = Math.round(
    employees.reduce((s, e) => s + e.salary, 0) / employees.length / 1000000
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Báo cáo & thống kê</h2>
        <p className="text-slate-500 text-sm mt-1">Phân tích tổng hợp hiệu suất tổ chức</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Tỷ lệ hoàn thành task",
            value: `${completionRate}%`,
            desc: `${totalCompleted}/${totalTasks} công việc`,
            icon: CheckCircle,
            color: "from-emerald-500 to-teal-600",
            trend: "+5% so với T6",
            trendUp: true,
          },
          {
            title: "Nhân viên đang làm việc",
            value: `${activeEmps}/${employees.length}`,
            desc: "Đang hoạt động",
            icon: Users,
            color: "from-blue-500 to-indigo-600",
            trend: "+2 nhân viên mới",
            trendUp: true,
          },
          {
            title: "Lương trung bình",
            value: `${avgSalary}M`,
            desc: "VNĐ/tháng",
            icon: DollarSign,
            color: "from-amber-500 to-orange-600",
            trend: "+1.5M so với T6",
            trendUp: true,
          },
          {
            title: "Tổng giờ làm tháng này",
            value: "1,248h",
            desc: "Toàn bộ nhân viên",
            icon: Clock,
            color: "from-violet-500 to-purple-600",
            trend: "+48h vs tháng trước",
            trendUp: true,
          },
          {
            title: "Doanh thu tháng 7",
            value: "270M",
            desc: "VNĐ",
            icon: TrendingUp,
            color: "from-rose-500 to-pink-600",
            trend: "+8% vs T6",
            trendUp: true,
          },
          {
            title: "Task đang thực hiện",
            value: `${tasks.filter((t) => t.status === "in-progress").length}`,
            desc: "Trong tháng này",
            icon: BarChart2,
            color: "from-cyan-500 to-blue-600",
            trend: "-1 task vs T6",
            trendUp: false,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{kpi.desc}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <div className={`mt-3 text-xs font-medium ${kpi.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                {kpi.trendUp ? "↑" : "↓"} {kpi.trend}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary trend */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800">Xu hướng quỹ lương 6 tháng</h3>
          <p className="text-slate-400 text-xs mt-0.5 mb-4">Triệu VNĐ</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salaryTrendData}>
              <defs>
                <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[130, 170]} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
              <Area type="monotone" dataKey="total" name="Quỹ lương" stroke="#f59e0b" strokeWidth={2.5} fill="url(#salaryGrad)" dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Dept salary avg */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800">Lương trung bình theo phòng ban</h3>
          <p className="text-slate-400 text-xs mt-0.5 mb-4">Triệu VNĐ/người</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptSalaryData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="avg" name="Lương TB" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance radar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800">Đánh giá hiệu suất tổ chức</h3>
          <p className="text-slate-400 text-xs mt-0.5 mb-2">Điểm trung bình toàn công ty</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Radar name="Hiệu suất" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Task status breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Phân bổ công việc theo nhân viên</h3>
          <div className="space-y-4">
            {employees.slice(0, 6).map((emp) => {
              const empTasks = tasks.filter((t) => t.employeeId === emp.id);
              const done = empTasks.filter((t) => t.status === "done").length;
              const rate = empTasks.length ? Math.round((done / empTasks.length) * 100) : 0;
              const colorIdx = parseInt(emp.id.slice(-1)) % 8;
              const colors = [
                "from-blue-500 to-indigo-600",
                "from-violet-500 to-purple-600",
                "from-rose-500 to-pink-600",
                "from-amber-500 to-orange-600",
                "from-emerald-500 to-teal-600",
                "from-cyan-500 to-blue-600",
                "from-fuchsia-500 to-pink-600",
                "from-lime-500 to-green-600",
              ];
              return (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {emp.avatar.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-700 text-xs font-medium truncate">{emp.name}</p>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-slate-400 text-xs">{done}/{empTasks.length} task</span>
                        <span className={`text-xs font-bold ${rate >= 80 ? "text-emerald-600" : rate >= 50 ? "text-amber-600" : "text-red-500"}`}>
                          {rate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
