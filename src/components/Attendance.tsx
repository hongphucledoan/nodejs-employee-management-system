import { useState } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Home, Calendar, ChevronDown, Plus, Edit2 } from "lucide-react";
import { useAttendances, useEmployees } from "../hooks/useAPI";
import { attendanceAPI } from "../services/api";
import { avatarColors, getColorIndex } from "../utils/colors";

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  present: { label: "Có mặt", color: "text-emerald-700", icon: CheckCircle2, bg: "bg-emerald-100" },
  absent: { label: "Vắng mặt", color: "text-red-700", icon: XCircle, bg: "bg-red-100" },
  late: { label: "Đi muộn", color: "text-amber-700", icon: AlertCircle, bg: "bg-amber-100" },
  leave: { label: "Nghỉ phép", color: "text-blue-700", icon: Calendar, bg: "bg-blue-100" },
  remote: { label: "Làm remote", color: "text-violet-700", icon: Home, bg: "bg-violet-100" },
};

export default function Attendance() {
  const [selectedEmp, setSelectedEmp] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "08:00",
    checkOut: "",
    status: "present",
  });

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "08:00",
      checkOut: "",
      status: "present",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (record: any) => {
    setIsEditing(true);
    setCurrentEditId(record.id);
    setFormData({
      employeeId: record.employeeId,
      date: record.date,
      checkIn: record.checkIn || "",
      checkOut: record.checkOut || "",
      status: record.status,
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleSubmit = async () => {
    setFormError("");
    
    if (!formData.employeeId) {
      setFormError("Vui lòng chọn nhân viên");
      return;
    }
    
    const isCheckInRequired = !["absent", "leave"].includes(formData.status);
    if (!formData.date || (isCheckInRequired && !formData.checkIn)) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const submitData = { ...formData };
    if (!isCheckInRequired) {
      submitData.checkIn = "";
      submitData.checkOut = "";
    }

    setSubmitting(true);
    try {
      if (isEditing && currentEditId) {
        await attendanceAPI.update(currentEditId, submitData);
        alert("Cập nhật bản ghi thành công!");
      } else {
        await attendanceAPI.create(submitData);
        alert("Thêm bản ghi thành công!");
      }
      setIsAddModalOpen(false);
      window.location.reload();
    } catch (error: any) {
      setFormError(error.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const { attendances, loading, error } = useAttendances();
  const { employees } = useEmployees();

  const today = new Date().toISOString().split("T")[0];

  const todayRecords = (attendances || []).filter((a: any) => a.date === today);
  const presentCount = todayRecords.filter((a: any) => a.status === "present").length;
  const lateCount = todayRecords.filter((a: any) => a.status === "late").length;
  const absentCount = todayRecords.filter((a: any) => a.status === "absent").length;
  const remoteCount = todayRecords.filter((a: any) => a.status === "remote").length;

  const uniqueDates = Array.from(new Set((attendances || []).map((a: any) => a.date))).sort((a: any, b: any) => b.localeCompare(a));

  const filtered = (attendances || []).filter(
    (a: any) => 
      (selectedEmp === "all" || a.employeeId === selectedEmp) &&
      (selectedDate === "all" || a.date === selectedDate)
  );

  const groupedByDate: Record<string, any[]> = {};
  filtered.forEach((a: any) => {
    if (!groupedByDate[a.date]) groupedByDate[a.date] = [];
    groupedByDate[a.date].push(a);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Chấm công nhân viên</h2>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi giờ làm việc · {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer hover:opacity-90 transition shadow-lg shadow-indigo-200"
          >
            <Plus size={16} />
            Thêm bản ghi
        </button>
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
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <p className="text-sm font-medium text-slate-700">Lọc theo:</p>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-500">Nhân viên:</p>
          <div className="relative">
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
            >
              <option value="all">Tất cả nhân viên</option>
              {(employees || []).map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-500">Ngày:</p>
          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
            >
              <option value="all">Tất cả các ngày</option>
              {uniqueDates.map((date: any) => (
                <option key={date} value={date}>
                  {new Date(date + "T00:00:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="ml-auto text-xs text-slate-400">{filtered.length} bản ghi</div>
      </div>

      {/* Attendance records by date */}
        <div className="space-y-4">
        {loading && (
          <div className="text-center py-8 text-slate-400">Đang tải chấm công...</div>
        )}
        {error && (
          <div className="text-center py-8 text-red-500">Lỗi: {error}</div>
        )}
        {!loading && sortedDates.map((date) => {
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
                      <th className="text-center text-xs font-medium text-slate-400 px-4 py-2.5">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.map((record) => {
                      const emp = employees.find((e) => e.id === record.employeeId);
                      const colorIdx = emp ? getColorIndex(emp.name) : 0;
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
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => openEditModal(record)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                <Edit2 size={15} />
                              </button>
                            </div>
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
      
      {/* Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditing ? "Chỉnh sửa bản ghi chấm công" : "Thêm bản ghi chấm công"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nhân viên *</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {(employees || []).map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.empId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Ngày đi làm *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Trạng thái *</label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    const isLeave = ["absent", "leave"].includes(newStatus);
                    setFormData({ 
                      ...formData, 
                      status: newStatus,
                      ...(isLeave ? { checkIn: "", checkOut: "" } : {})
                    });
                  }}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="present">Có mặt</option>
                  <option value="late">Đi muộn</option>
                  <option value="absent">Vắng mặt</option>
                  <option value="leave">Nghỉ phép</option>
                  <option value="remote">Làm remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Giờ Check-in {["absent", "leave"].includes(formData.status) ? "" : "*"}
                </label>
                <input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  disabled={["absent", "leave"].includes(formData.status)}
                  className={`w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 ${["absent", "leave"].includes(formData.status) ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Giờ Check-out</label>
                <input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  disabled={["absent", "leave"].includes(formData.status)}
                  className={`w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 ${["absent", "leave"].includes(formData.status) ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl hover:opacity-90 transition disabled:opacity-70"
              >
                {submitting ? "Đang xử lý..." : (isEditing ? "Lưu thay đổi" : "Lưu bản ghi")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
