import { useState } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Home, Calendar, ChevronDown } from "lucide-react";
import { attendanceRecords, employees } from "../data/mockData";

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  present: { label: "Có mặt", color: "text-emerald-700", icon: CheckCircle2, bg: "bg-emerald-100" },
  absent: { label: "Vắng mặt", color: "text-red-700", icon: XCircle, bg: "bg-red-100" },
  late: { label: "Đi muộn", color: "text-amber-700", icon: AlertCircle, bg: "bg-amber-100" },
  leave: { label: "Nghỉ phép", color: "text-blue-700", icon: Calendar, bg: "bg-blue-100" },
  remote: { label: "Làm remote", color: "text-violet-700", icon: Home, bg: "bg-violet-100" },
};

const avatarColors = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-lime-500 to-green-600",
];

export default function Attendance() {
  const [selectedEmp, setSelectedEmp] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const todayRecords = attendanceRecords.filter((a) => a.date === today);
  const presentCount = todayRecords.filter((a) => a.status === "present").length;
  const lateCount = todayRecords.filter((a) => a.status === "late").length;
  const absentCount = todayRecords.filter((a) => a.status === "absent").length;
  const remoteCount = todayRecords.filter((a) => a.status === "remote").length;

  const filtered = attendanceRecords.filter(
    (a) => selectedEmp === "all" || a.employeeId === selectedEmp
  );

  const groupedByDate: Record<string, typeof attendanceRecords> = {};
  filtered.forEach((a) => {
    if (!groupedByDate[a.date]) groupedByDate[a.date] = [];
    groupedByDate[a.date].push(a);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Chấm công nhân viên</h2>
        <p className="text-slate-500 text-sm mt-1">
          Theo dõi giờ làm việc · {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Có mặt", value: presentCount, color: "from-emerald-500 to-teal-600", icon: CheckCircle2 },
          { label: "Đi muộn", value: lateCount, color: "from-amber-500 to-orange-600", icon: AlertCircle },
          { label: "Vắng mặt", value: absentCount, color: "from-red-500 to-rose-600", icon: XCircle },
          { label: "Làm remote", value: remoteCount, color: "from-violet-500 to-purple-600", icon: Home },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">{item.label}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Icon size={17} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 mt-2">{item.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">Hôm nay</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
        <Clock size={16} className="text-slate-400" />
        <p className="text-sm font-medium text-slate-700">Lọc theo nhân viên:</p>
        <div className="relative">
          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
          >
            <option value="all">Tất cả nhân viên</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="ml-auto text-xs text-slate-400">{filtered.length} bản ghi</div>
      </div>

      {/* Attendance records by date */}
      <div className="space-y-4">
        {sortedDates.map((date) => {
          const records = groupedByDate[date];
          const isToday = date === today;
          return (
            <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className={`px-5 py-3 border-b border-slate-100 flex items-center gap-3 ${isToday ? "bg-gradient-to-r from-violet-50 to-indigo-50" : "bg-slate-50"}`}>
                <Calendar size={15} className={isToday ? "text-violet-500" : "text-slate-400"} />
                <h3 className={`text-sm font-semibold ${isToday ? "text-violet-700" : "text-slate-700"}`}>
                  {new Date(date + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                  {isToday && <span className="ml-2 text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full">Hôm nay</span>}
                </h3>
                <span className="ml-auto text-xs text-slate-400">{records.length} nhân viên</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left text-xs font-medium text-slate-400 px-5 py-2.5">Nhân viên</th>
                      <th className="text-left text-xs font-medium text-slate-400 px-4 py-2.5">Phòng ban</th>
                      <th className="text-left text-xs font-medium text-slate-400 px-4 py-2.5">Check-in</th>
                      <th className="text-left text-xs font-medium text-slate-400 px-4 py-2.5">Check-out</th>
                      <th className="text-left text-xs font-medium text-slate-400 px-4 py-2.5">Giờ làm</th>
                      <th className="text-left text-xs font-medium text-slate-400 px-4 py-2.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.map((record) => {
                      const emp = employees.find((e) => e.id === record.employeeId);
                      const colorIdx = parseInt(record.employeeId.slice(-1)) % 8;
                      const status = statusConfig[record.status];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                {emp?.avatar.slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-slate-800 text-sm font-medium">{emp?.name}</p>
                                <p className="text-slate-400 text-xs">{emp?.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-slate-600 text-sm">{emp?.department}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-sm font-mono font-semibold ${record.checkIn ? (record.status === "late" ? "text-amber-600" : "text-slate-700") : "text-slate-300"}`}>
                              {record.checkIn || "—"}
                            </span>
                            {record.status === "late" && record.checkIn && (
                              <span className="ml-1 text-xs text-amber-500">(muộn)</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-sm font-mono font-semibold ${record.checkOut ? "text-slate-700" : "text-slate-300"}`}>
                              {record.checkOut || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-sm font-semibold ${record.workHours >= 9 ? "text-emerald-600" : record.workHours > 0 ? "text-amber-600" : "text-slate-300"}`}>
                              {record.workHours > 0 ? `${record.workHours}h` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`flex items-center gap-1.5 w-fit text-xs px-2.5 py-1 rounded-full font-medium ${status.bg} ${status.color}`}>
                              <StatusIcon size={12} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
