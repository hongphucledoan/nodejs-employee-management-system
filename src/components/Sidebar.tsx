import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Server,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "employees", label: "Nhân viên", icon: Users },
  { id: "tasks", label: "Công việc", icon: ClipboardList },
  { id: "attendance", label: "Chấm công", icon: Clock },
  { id: "salary", label: "Lương thưởng", icon: DollarSign },
  { id: "reports", label: "Báo cáo", icon: BarChart3 },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
          <Server size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">NodeJS Corp</h1>
          <p className="text-slate-400 text-xs">Hệ thống quản lý</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Menu chính
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-green-400" : "text-slate-500 group-hover:text-white"} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-green-400" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all duration-200">
          <Settings size={18} className="text-slate-500" />
          Cài đặt
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
          <LogOut size={18} className="text-slate-500" />
          Đăng xuất
        </button>
        {/* User */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-slate-800/50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Admin System</p>
            <p className="text-slate-500 text-xs truncate">admin@nodejscorp.vn</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
