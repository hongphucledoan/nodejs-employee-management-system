import { useState } from "react";
import { Plus, Clock, AlertTriangle, ChevronDown, Search, Flag } from "lucide-react";
// import { Task } from "../data/Dataset";
import { useTasks, useEmployees } from "../hooks/useAPI";

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  urgent: { label: "Khẩn cấp", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  high: { label: "Cao", color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  medium: { label: "Trung bình", color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  low: { label: "Thấp", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const columns = [
  { id: "todo", label: "Cần làm", color: "bg-slate-500", light: "bg-slate-50 border-slate-200" },
  { id: "in-progress", label: "Đang thực hiện", color: "bg-blue-500", light: "bg-blue-50 border-blue-200" },
  { id: "review", label: "Đang review", color: "bg-violet-500", light: "bg-violet-50 border-violet-200" },
  { id: "done", label: "Hoàn thành", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200" },
];

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

function TaskCard({ task, employees }: { task: Task; employees?: any[] }) {
  const emp = (employees || []).find((e) => e.id === task.employeeId);
  const colorIdx = parseInt(task.employeeId.slice(-1)) % 8;
  const priority = priorityConfig[task.priority];
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${priority.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}></span>
          {priority.label}
        </span>
        {isOverdue && (
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
        )}
      </div>

      <h4 className="text-slate-800 text-sm font-semibold leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      <p className="text-slate-400 text-xs mb-3 line-clamp-2">{task.description}</p>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Tiến độ</span>
          <span className="font-semibold text-slate-600">{task.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full">
          <div
            className={`h-full rounded-full transition-all ${task.status === "done" ? "bg-emerald-500" : task.progress > 60 ? "bg-blue-500" : task.progress > 30 ? "bg-amber-500" : "bg-slate-400"}`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-[10px] font-bold`}>
            {emp?.avatar.slice(0, 2)}
          </div>
          <span className="text-slate-500 text-xs">{emp?.name.split(" ").slice(-1)[0]}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
          <Clock size={11} />
          {new Date(task.deadline).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-50">
        <span className="text-xs text-slate-400 truncate block">📁 {task.project}</span>
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { employees } = useEmployees();

  const filtered = (tasks || []).filter((t: Task) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const getTasksByStatus = (status: string) => filtered.filter((t) => t.status === status);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Theo dõi công việc</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý tiến độ dự án & task</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${viewMode === "board" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${viewMode === "list" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
            >
              Danh sách
            </button>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition shadow-lg shadow-indigo-200">
            <Plus size={16} />
            Thêm task
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm task, dự án..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="relative">
          <Flag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="all">Tất cả độ ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 ml-auto">
          {columns.map((col) => (
            <div key={col.id} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
              <span>{getTasksByStatus(col.id).length}</span>
            </div>
          ))}
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = getTasksByStatus(col.id);
            return (
              <div key={col.id} className={`rounded-2xl p-3 border ${col.light} min-h-48`}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                  <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
                  <span className={`ml-auto text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-white ${col.color}`}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasksLoading && (
                    <div className="text-center py-8 text-slate-400">Đang tải...</div>
                  )}
                  {!tasksLoading && colTasks.map((task) => (
                        <TaskCard key={task.id} task={task} employees={employees} />
                      ))}
                </div>
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-300 text-xs">Không có task</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Công việc</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Nhân viên</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Độ ưu tiên</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Trạng thái</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Tiến độ</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((task) => {
                const emp = employees.find((e) => e.id === task.employeeId);
                const priority = priorityConfig[task.priority];
                const col = columns.find((c) => c.id === task.status);
                const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done";
                return (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-slate-800 text-sm font-medium">{task.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">📁 {task.project}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarColors[parseInt(task.employeeId.slice(-1)) % 8]} flex items-center justify-center text-white text-xs font-bold`}>
                          {emp?.avatar.slice(0, 2)}
                        </div>
                        <span className="text-slate-600 text-xs">{emp?.name.split(" ").slice(-2).join(" ")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priority.color}`}>{priority.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium text-white ${col?.color}`}>{col?.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{task.progress}%</span>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-xs font-medium ${isOverdue ? "text-red-500" : "text-slate-500"}`}>
                      {isOverdue && <AlertTriangle size={12} className="inline mr-1" />}
                      {new Date(task.deadline).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
