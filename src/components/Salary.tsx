import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Download, ChevronDown, CheckCircle2, Clock, AlertCircle, Plus, X, Edit2 } from "lucide-react";
import { useEmployees } from "../hooks/useAPI";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { avatarColors, getColorIndex } from "../utils/colors";
import { salaryAPI, employeeAPI, attendanceAPI } from "../services/api";

interface Employee {
  id: string;
  name: string;
  avatar: string;
  department: string;
  position: string;
}

interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  tax: number;
  netSalary: number;
  status: 'paid' | 'pending' | 'processing';
  employee?: Employee;
}

const statusConfig = {
  paid: { label: "Đã thanh toán", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pending: { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-700", icon: Clock },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
};

interface PaySalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  salaryRecord?: SalaryRecord | null;
}

function PaySalaryModal({ isOpen, onClose, onRefresh, salaryRecord }: PaySalaryModalProps) {
  const { employees } = useEmployees();
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().toISOString().slice(0, 7),
    baseSalary: 0,
    bonus: 0,
    deduction: 0,
    tax: 0,
    status: "paid",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (salaryRecord) {
        setFormData({
          employeeId: salaryRecord.employeeId,
          month: salaryRecord.month,
          baseSalary: salaryRecord.baseSalary,
          bonus: salaryRecord.bonus,
          deduction: salaryRecord.deduction,
          tax: salaryRecord.tax,
          status: salaryRecord.status,
        });
      } else {
        setFormData({
          employeeId: "",
          month: new Date().toISOString().slice(0, 7),
          baseSalary: 0,
          bonus: 0,
          deduction: 0,
          tax: 0,
          status: "paid",
        });
      }
      setError("");
    }
  }, [isOpen, salaryRecord]);

  const handleEmployeeChange = async (empId: string) => {
    const emp = employees.find((e: any) => e.id === empId);
    if (!emp) return;

    let baseSalary = emp.salary || 0;
    let lateDeduction = 0;

    try {
      const attendances: any[] = await attendanceAPI.getByEmployeeId(empId);
      const currentMonthAtts = attendances.filter(a => a.date.startsWith(formData.month));
      
      let lateDays = 0;
      currentMonthAtts.forEach(att => {
        if (att.status === "late") {
          lateDays++;
        } else if (att.checkIn) {
          const [h, m] = att.checkIn.split(':').map(Number);
          if (h > 8 || (h === 8 && m > 10)) {
             lateDays++;
          }
        }
      });
        lateDeduction = Math.round(lateDays * baseSalary * 0.01);

    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu chấm công:", err);
    }

    setFormData({
      ...formData,
      employeeId: empId,
      baseSalary,
      deduction: lateDeduction,
    });
  };

  const handleMonthChange = async (month: string) => {
    setFormData({ ...formData, month });
    if (formData.employeeId) {
      const emp = employees.find((e: any) => e.id === formData.employeeId);
      if (!emp) return;
      try {
        const attendances: any[] = await attendanceAPI.getByEmployeeId(formData.employeeId);
        const currentMonthAtts = attendances.filter(a => a.date.startsWith(month));
        let lateDays = 0;
        currentMonthAtts.forEach(att => {
          if (att.status === "late") {
            lateDays++;
          } else if (att.checkIn) {
            const [h, m] = att.checkIn.split(':').map(Number);
            if (h > 8 || (h === 8 && m > 10)) {
               lateDays++;
            }
          }
        });
        setFormData(prev => ({
          ...prev,
          month,
          deduction: Math.round(lateDays * prev.baseSalary * 0.01)
        }));
      } catch (err) {
        console.error("Lỗi:", err);
      }
    }
  };


  const netSalary = formData.baseSalary + formData.bonus - formData.deduction - formData.tax;

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.month) {
      setError("Vui lòng chọn nhân viên và tháng");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const emp = employees.find((e: any) => e.id === formData.employeeId);
      if (emp && emp.salary !== formData.baseSalary) {
        await employeeAPI.update(formData.employeeId, { ...emp, salary: formData.baseSalary });
      }

      const payload = {
        ...formData,
        netSalary
      };

      if (salaryRecord && salaryRecord.id) {
        await salaryAPI.update(salaryRecord.id, payload);
        alert("Cập nhật lương thành công!");
      } else {
        await salaryAPI.create(payload);
        alert("Phát lương thành công!");
      }
      onClose();
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">{salaryRecord ? "Chỉnh sửa bảng lương" : "Phát lương"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nhân viên *</label>
            <select
              value={formData.employeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              disabled={!!salaryRecord}
              className={`w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 ${!!salaryRecord ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tháng (YYYY-MM) *</label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => handleMonthChange(e.target.value)}
              disabled={!!salaryRecord}
              className={`w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 ${!!salaryRecord ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Lương cơ bản (VNĐ) *</label>
            <input
              type="number"
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <p className="text-[10px] text-slate-400 mt-1">Thay đổi mục này sẽ cập nhật lương cơ bản của nhân viên trên hệ thống.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Thưởng (VNĐ)</label>
              <input
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Thuế (VNĐ)</label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Khấu trừ (VNĐ) - Tự động tính do đi trễ &gt; 10p</label>
            <input
              type="number"
              value={formData.deduction}
              onChange={(e) => setFormData({ ...formData, deduction: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
            <label className="block text-xs font-medium text-amber-700 mb-1">Thực nhận (Net Salary)</label>
            <div className="text-xl font-bold text-amber-600">
              {netSalary.toLocaleString("vi-VN")} VNĐ
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Trạng thái thanh toán</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="paid">Đã thanh toán (Paid)</option>
              <option value="pending">Chưa trả (Pending)</option>
              <option value="processing">Đang thanh toán (Processing)</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:opacity-90 transition disabled:opacity-70"
          >
            {loading ? "Đang xử lý..." : (salaryRecord ? "Cập nhật" : "Phát lương")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Salary() {
  const [month, setMonth] = useState("");
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const data = await salaryAPI.getAll();
      setSalaries(data);
      if (data.length > 0) {
        const availableMonths = Array.from(new Set(data.map((s: SalaryRecord) => s.month))).sort((a: any, b: any) => b.localeCompare(a)) as string[];
        if (availableMonths.length > 0) {
          setMonth(availableMonths[0]);
        }
      }
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu lương:", err);
      setError(err.message || "Không thể tải dữ liệu lương");
    } finally {
      setLoading(false);
    }
  };

  const currentRecords = month ? salaries.filter((s) => s.month === month) : [];
  const totalNet = currentRecords.reduce((s, r) => s + r.netSalary, 0);
  const totalBase = currentRecords.reduce((s, r) => s + r.baseSalary, 0);
  const totalBonus = currentRecords.reduce((s, r) => s + r.bonus, 0);
  const totalTax = currentRecords.reduce((s, r) => s + r.tax, 0);

  const handleExportExcel = () => {
    const headers = ["Nhân viên", "Phòng ban", "Tháng", "Lương cơ bản", "Thưởng", "Khấu trừ", "Thuế", "Thực nhận", "Trạng thái"];
    const rows = currentRecords.map(rec => {
      const emp = rec.employee;
      const statusLabel = statusConfig[rec.status as keyof typeof statusConfig]?.label || rec.status;
      return [
        emp?.name || "",
        emp?.department || "",
        rec.month,
        rec.baseSalary,
        rec.bonus,
        rec.deduction,
        rec.tax,
        rec.netSalary,
        statusLabel
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Thêm BOM (\uFEFF) để Excel có thể hiển thị tiếng Việt UTF-8 chính xác
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bang_Luong_${month || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = currentRecords.map((rec) => {
    const emp = rec.employee;
    return {
      name: emp?.name.split(" ").slice(-1)[0] || rec.employeeId,
      "Lương cơ bản": Math.round(rec.baseSalary / 1000000),
      "Thưởng": Math.round(rec.bonus / 1000000),
      "Khấu trừ": Math.round((rec.deduction + rec.tax) / 1000000),
      "Thực nhận": Math.round(rec.netSalary / 1000000),
    };
  });

  const availableMonths = Array.from(new Set(salaries.map(s => s.month))).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu lương...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý lương thưởng</h2>
          <p className="text-slate-500 text-sm mt-1">Bảng lương chi tiết theo tháng</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm cursor-pointer font-medium"
            >
              {availableMonths.length === 0 && <option value={month}>{month}</option>}
              {availableMonths.map(m => (
                <option key={m} value={m}>Tháng {m.split('-')[1]}/{m.split('-')[0]}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-50 transition bg-white shadow-sm"
          >
            <Download size={15} />
            Xuất Excel
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer hover:opacity-90 transition shadow-lg shadow-amber-200"
          >
            <Plus size={16} />
            Phát lương
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng quỹ lương", value: totalBase, color: "from-blue-500 to-indigo-600", icon: DollarSign },
          { label: "Tổng thưởng", value: totalBonus, color: "from-emerald-500 to-teal-600", icon: TrendingUp },
          { label: "Thuế & khấu trừ", value: totalTax, color: "from-red-500 to-rose-600", icon: AlertCircle },
          { label: "Thực chi", value: totalNet, color: "from-amber-500 to-orange-600", icon: CheckCircle2 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-500 text-sm">{item.label}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Icon size={17} className="text-white" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800">
                {(item.value / 1000000).toFixed(1)}M
              </p>
              <p className="text-slate-400 text-xs mt-1">VNĐ</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-1">Biểu đồ lương nhân viên</h3>
        <p className="text-slate-400 text-xs mb-4">Đơn vị: Triệu VNĐ</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }}
            />
            <Bar dataKey="Lương cơ bản" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Thưởng" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Thực nhận" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500"></div>Lương cơ bản</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500"></div>Thưởng</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500"></div>Thực nhận</div>
        </div>
      </div>

      {/* Salary table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Chi tiết bảng lương</h3>
          <span className="text-xs text-slate-400">{currentRecords.length} nhân viên</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Nhân viên</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Lương cơ bản</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Thưởng</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Khấu trừ</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Thuế</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Thực nhận</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Trạng thái</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentRecords.map((rec) => {
                const emp = rec.employee;
                const colorIdx = emp ? getColorIndex(emp.name) : 0;
                const status = statusConfig[rec.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {emp?.avatar}
                        </div>
                        <div>
                          <p className="text-slate-800 text-sm font-semibold">{emp?.name}</p>
                          <p className="text-slate-400 text-xs">{emp?.department} · {emp?.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700 text-sm font-medium">
                      {rec.baseSalary.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-4 text-right text-emerald-600 text-sm font-medium">
                      {rec.bonus > 0 ? `+${rec.bonus.toLocaleString("vi-VN")}` : "—"}
                    </td>
                    <td className="px-4 py-4 text-right text-red-500 text-sm font-medium">
                      {rec.deduction > 0 ? `-${rec.deduction.toLocaleString("vi-VN")}` : "—"}
                    </td>
                    <td className="px-4 py-4 text-right text-orange-500 text-sm font-medium">
                      -{rec.tax.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-slate-900 text-sm font-bold">
                        {rec.netSalary.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-slate-400 text-xs"> đ</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => setEditingSalary(rec)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td className="px-5 py-4 text-sm font-bold text-slate-700">Tổng cộng</td>
                <td className="px-4 py-4 text-right text-sm font-bold text-slate-700">{totalBase.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-4 text-right text-sm font-bold text-emerald-600">+{totalBonus.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-4 text-right text-sm font-bold text-red-500">—</td>
                <td className="px-4 py-4 text-right text-sm font-bold text-orange-500">-{totalTax.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">{totalNet.toLocaleString("vi-VN")} đ</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <PaySalaryModal 
        isOpen={isAddModalOpen || !!editingSalary} 
        onClose={() => { setIsAddModalOpen(false); setEditingSalary(null); }} 
        onRefresh={fetchSalaries}
        salaryRecord={editingSalary}
      />
    </div>
  );
}
