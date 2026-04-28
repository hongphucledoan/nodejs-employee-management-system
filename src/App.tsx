import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import EmployeeList from "./components/EmployeeList";
import TaskBoard from "./components/TaskBoard";
import Attendance from "./components/Attendance";
import Salary from "./components/Salary";
import Reports from "./components/Reports";
import { Bell, Menu } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "employees": return <EmployeeList />;
      case "tasks": return <TaskBoard />;
      case "attendance": return <Attendance />;
      case "salary": return <Salary />;
      case "reports": return <Reports />;
      default: return <Dashboard />;
    }
  };

  const tabTitles: Record<string, string> = {
    dashboard: "Tổng quan",
    employees: "Quản lý nhân viên",
    tasks: "Theo dõi công việc",
    attendance: "Chấm công",
    salary: "Lương thưởng",
    reports: "Báo cáo",
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 z-50 lg:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="text-slate-600 font-semibold">NodeJS Corp</span>
              <span>/</span>
              <span>{tabTitles[activeTab]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Tech badge */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 text-xs font-semibold">Node.js v20 LTS</span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80 transition">
              AD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>© 2025 NodeJS Corp — Hệ thống quản lý nhân viên. Đồ án môn Các Công Nghệ Lập Trình Hiện Đại.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                Express.js
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                Node.js
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                MongoDB
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
                React
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
