import { useState } from "react";
import { DollarSign, TrendingUp, Download, ChevronDown, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { salaryRecords, employees } from "../data/Dataset";
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

const statusConfig = {
  paid: { label: "Đã thanh toán", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pending: { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-700", icon: Clock },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
};

export default function Salary() {
  const [month, setMonth] = useState("2025-07");

  const currentRecords = salaryRecords.filter((s) => s.month === month);
  const totalNet = currentRecords.reduce((s, r) => s + r.netSalary, 0);
  const totalBase = currentRecords.reduce((s, r) => s + r.baseSalary, 0);
  const totalBonus = currentRecords.reduce((s, r) => s + r.bonus, 0);
  const totalTax = currentRecords.reduce((s, r) => s + r.tax, 0);

  const chartData = currentRecords.map((rec) => {
    const emp = employees.find((e) => e.id === rec.employeeId);
    return {
      name: emp?.name.split(" ").slice(-1)[0] || rec.employeeId,
      "Lương cơ bản": Math.round(rec.baseSalary / 1000000),
      "Thưởng": Math.round(rec.bonus / 1000000),
      "Khấu trừ": Math.round((rec.deduction + rec.tax) / 1000000),
      "Thực nhận": Math.round(rec.netSalary / 1000000),
    };
  });

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
              <option value="2025-07">Tháng 7/2025</option>
              <option value="2025-06">Tháng 6/2025</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-50 transition bg-white shadow-sm">
            <Download size={15} />
            Xuất Excel
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                const colorIdx = emp ? getColorIndex(emp.name) : 0;
                const status = statusConfig[rec.status];
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
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
