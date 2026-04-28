import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import EmployeeList from "./components/EmployeeList";
import TaskBoard from "./components/TaskBoard";
import Attendance from "./components/Attendance";
import Salary from "./components/Salary";
import Reports from "./components/Reports";
import { Menu } from "lucide-react";

const tabTitles: Record<string, string> = {
  dashboard: "Tổng quan",
  employees: "Quản lý nhân viên",
  tasks: "Theo dõi công việc",
  attendance: "Chấm công",
  salary: "Lương thưởng",
  reports: "Báo cáo",
};

// Protected Route Component
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, loading, login } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname.replace("/", "") || "dashboard";
    return tabTitles[path] || "Tổng quan";
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif]">
      {/* Sidebar */}
      <Sidebar onNavigate={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 z-50 lg:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
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
              <span>{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80 transition">
              {location.pathname.includes("login") ? "?" : "AD"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/employees" element={<ProtectedRoute element={<EmployeeList />} />} />
            <Route path="/tasks" element={<ProtectedRoute element={<TaskBoard />} />} />
            <Route path="/attendance" element={<ProtectedRoute element={<Attendance />} />} />
            <Route path="/salary" element={<ProtectedRoute element={<Salary />} />} />
            <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
            {/* <Route path="/login" element={<Login onLogin={login} />} /> */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>
              © 2025 NodeJS Corp — Hệ thống quản lý nhân viên. Đồ án môn Các
              Công Nghệ Lập Trình Hiện Đại.
            </p>
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
