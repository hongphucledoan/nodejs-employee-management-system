import { useState, useEffect } from "react";
import { Plus, Clock, AlertTriangle, ChevronDown, Search, Flag, X, Edit2 } from "lucide-react";
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

import { avatarColors, getColorIndex } from "../utils/colors";

// --- INTERFACE ---
interface Task {
  id: string;
  taskId?: string;
  title: string;
  employeeId: string;
  priority: string;
  status: string;
  deadline: string;
  progress: number;
  description: string;
  project: string;
  createdAt?: string;
  updatedAt?: string;
  employee?: any;
}

// --- COMPONENT: ADD TASK MODAL ---
interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  onRefresh: () => void; // Hàm gọi lại để reload danh sách task
}

// --- COMPONENT: EDIT TASK MODAL ---
interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  employees: any[];
  onRefresh: () => void;
}

// --- THÊM COMPONENT MODAL THÊM TASK ---
function AddTaskModal({ isOpen, onClose, employees, onRefresh }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    employeeId: "",
    priority: "medium",
    status: "todo",
    deadline: new Date().toISOString().split('T')[0], // Mặc định là hôm nay
    progress: 0,
    description: "",
    project: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        employeeId: employees.length > 0 ? employees[0].id : "", // Chọn nhân viên đầu tiên mặc định
        priority: "medium",
        status: "todo",
        deadline: new Date().toISOString().split('T')[0],
        progress: 0,
        description: "",
        project: "",
      });
      setError("");
    }
  }, [isOpen, employees]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.employeeId || !formData.project) {
      setError("Vui lòng điền đầy đủ Tiêu đề, Nhân viên và Dự án");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Thêm công việc thành công!");
        onClose();
        onRefresh(); // Reload lại danh sách task
      } else {
        setError(result.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Thêm công việc mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tiêu đề công việc *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Ví dụ: Fix lỗi login page"
            />
          </div>

          {/* Dự án */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Dự án *</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Ví dụ: E-commerce App"
            />
          </div>

          {/* Chọn nhân viên */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Người thực hiện *</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Độ ưu tiên */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Độ ưu tiên</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="todo">Cần làm</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="review">Đang review</option>
                <option value="done">Hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Hạn chót (Deadline)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Tiến độ</label>
              <span className="text-xs font-bold text-indigo-600">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Mô tả chi tiết</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="Mô tả yêu cầu công việc..."
            />
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
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-70"
          >
            {loading ? "Đang thêm..." : "Thêm công việc"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTaskModal({ isOpen, onClose, task, employees, onRefresh }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    employeeId: "",
    priority: "medium",
    status: "todo",
    deadline: "",
    progress: 0,
    description: "",
    project: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Điền dữ liệu khi modal mở
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title,
        employeeId: task.employeeId,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline.split('T')[0], // Đảm bảo format YYYY-MM-DD
        progress: task.progress,
        description: task.description,
        project: task.project,
      });
      setError("");
    }
  }, [isOpen, task]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.employeeId || !formData.project) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Cập nhật công việc thành công!");
        onClose();
        onRefresh();
      } else {
        setError(result.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa công việc</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tiêu đề công việc *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Dự án */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Dự án *</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Chọn nhân viên */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Người thực hiện *</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Độ ưu tiên */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Độ ưu tiên</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="todo">Cần làm</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="review">Đang review</option>
                <option value="done">Hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Hạn chót (Deadline)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Tiến độ</label>
              <span className="text-xs font-bold text-indigo-600">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Mô tả chi tiết</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
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
            className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-70"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}


// --- COMPONENT: TASK CARD (Đã thêm onClick) ---
function TaskCard({ task, employees, onEdit }: { task: Task; employees?: any[]; onEdit?: (t: Task) => void }) {
  const emp = (employees || []).find((e) => e.id === task.employeeId);
  
  // Xử lý màu avatar an toàn hơn
  const colorIdx = emp ? getColorIndex(emp.name) : 0; 

  const priority = priorityConfig[task.priority];
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done";

  return (
    <div 
      onClick={() => onEdit && onEdit(task)}
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative"
    >
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
            {emp?.avatar ? emp.avatar.slice(0, 2) : "??"}
          </div>
          <span className="text-slate-500 text-xs">{emp?.name ? emp.name.split(" ").slice(-1)[0] : "Unknown"}</span>
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


// --- MAIN COMPONENT ---
export default function TaskBoard() {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // State cho Modal Add
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State cho Modal Edit
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { employees } = useEmployees();

  const filtered = (tasks || []).filter((t: Task) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const getTasksByStatus = (status: string) => filtered.filter((t) => t.status === status);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer hover:opacity-90 transition shadow-lg shadow-indigo-200"
          >
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

      {/* VIEW MODE: BOARD */}
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
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      employees={employees} 
                      onEdit={setEditingTask} // Khi click vào card, set task này vào state editing
                    />
                  ))}
                </div>
                {colTasks.length === 0 && !tasksLoading && (
                  <div className="text-center py-8 text-slate-300 text-xs">Không có task</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE: LIST */
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
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((task) => {
                const emp = employees.find((e) => e.id === task.employeeId);
                const priority = priorityConfig[task.priority];
                const col = columns.find((c) => c.id === task.status);
                const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done";
                
                // Hàm lấy màu avatar cho list
                const colorIdx = emp ? getColorIndex(emp.name) : 0;

                return (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-slate-800 text-sm font-medium">{task.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">📁 {task.project}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold`}>
                          {emp?.avatar ? emp.avatar.slice(0, 2) : "??"}
                        </div>
                        <span className="text-slate-600 text-xs">{emp?.name ? emp.name.split(" ").slice(-2).join(" ") : "Unknown"}</span>
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
                    
                    {/* CỘT HÀNH ĐỘNG - NÚT EDIT */}
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Chỉnh sửa task"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Modal ở cuối cùng của component */}
      {/* MODAL ADD TASK */}
      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        employees={employees || []}
        onRefresh={handleRefresh}
      />
      
      {/* MODAL EDIT TASK */}
      <EditTaskModal 
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        employees={employees || []}
        onRefresh={handleRefresh}
      />
    </div>
  );
}


// // --- COMPONENT CHÍNH TASKBOARD ---
// export default function TaskBoard() {
//   const [viewMode, setViewMode] = useState<"board" | "list">("board");
//   const [search, setSearch] = useState("");
//   const [priorityFilter, setPriorityFilter] = useState("all");
  
//   // State cho Modal
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);

//   const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
//   const { employees } = useEmployees();

//   // Logic filter giữ nguyên
//   const filtered = (tasks || []).filter((t: Task) => {
//     const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
//       t.project.toLowerCase().includes(search.toLowerCase());
//     const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
//     return matchSearch && matchPriority;
//   });

//   const getTasksByStatus = (status: string) => filtered.filter((t) => t.status === status);

//   // Hàm refresh đơn giản (reload trang hoặc trigger refetch nếu dùng React Query)
//   const handleRefresh = () => {
//     window.location.reload(); 
//     // Nếu dùng React Query: queryClient.invalidateQueries(['tasks'])
//   };

//   return (
//     <div className="space-y-5">
//       {/* Header giữ nguyên, chỉ sửa onClick nút Thêm task */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800">Theo dõi công việc</h2>
//           <p className="text-slate-500 text-sm mt-1">Quản lý tiến độ dự án & task</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="flex bg-slate-100 rounded-xl p-1">
//             <button
//               onClick={() => setViewMode("board")}
//               className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${viewMode === "board" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
//             >
//               Kanban
//             </button>
//             <button
//               onClick={() => setViewMode("list")}
//               className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${viewMode === "list" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
//             >
//               Danh sách
//             </button>
//           </div>
          
//           {/* Nút mở Modal */}
//           <button 
//             onClick={() => setIsAddModalOpen(true)}
//             className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition shadow-lg shadow-indigo-200"
//           >
//             <Plus size={16} />
//             Thêm task
//           </button>
//         </div>
//       </div>

//       {/* Filter bar giữ nguyên */}
//       <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-3 flex-wrap">
//          {/* ... code filter cũ ... */}
//          <div className="relative flex-1 min-w-48">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Tìm kiếm task, dự án..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
//           />
//         </div>
//         <div className="relative">
//           <Flag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <select
//             value={priorityFilter}
//             onChange={(e) => setPriorityFilter(e.target.value)}
//             className="appearance-none pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
//           >
//             <option value="all">Tất cả độ ưu tiên</option>
//             <option value="urgent">Khẩn cấp</option>
//             <option value="high">Cao</option>
//             <option value="medium">Trung bình</option>
//             <option value="low">Thấp</option>
//           </select>
//           <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//         </div>
//         <div className="flex items-center gap-3 text-xs text-slate-500 ml-auto">
//           {columns.map((col) => (
//             <div key={col.id} className="flex items-center gap-1.5">
//               <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
//               <span>{getTasksByStatus(col.id).length}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* View Board/List giữ nguyên */}
//       {viewMode === "board" ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {columns.map((col) => {
//             const colTasks = getTasksByStatus(col.id);
//             return (
//               <div key={col.id} className={`rounded-2xl p-3 border ${col.light} min-h-48`}>
//                 <div className="flex items-center gap-2 mb-3 px-1">
//                   <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
//                   <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
//                   <span className={`ml-auto text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-white ${col.color}`}>
//                     {colTasks.length}
//                   </span>
//                 </div>
//                 <div className="space-y-3">
//                   {tasksLoading && (
//                     <div className="text-center py-8 text-slate-400">Đang tải...</div>
//                   )}
//                   {!tasksLoading && colTasks.map((task) => (
//                         <TaskCard key={task.id} task={task} employees={employees} />
//                       ))}
//                 </div>
//                 {colTasks.length === 0 && !tasksLoading && (
//                   <div className="text-center py-8 text-slate-300 text-xs">Không có task</div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//            {/* ... Code Table List giữ nguyên ... */}
//            <table className="w-full">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-100">
//                 <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Công việc</th>
//                 <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Nhân viên</th>
//                 <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Độ ưu tiên</th>
//                 <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Trạng thái</th>
//                 <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Tiến độ</th>
//                 <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Deadline</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {filtered.map((task) => {
//                 const emp = employees.find((e) => e.id === task.employeeId);
//                 const priority = priorityConfig[task.priority];
//                 const col = columns.find((c) => c.id === task.status);
//                 const isOverdue = new Date(task.deadline) < new Date() && task.status !== "done";
//                 return (
//                   <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
//                     <td className="px-5 py-4">
//                       <p className="text-slate-800 text-sm font-medium">{task.title}</p>
//                       <p className="text-slate-400 text-xs mt-0.5">📁 {task.project}</p>
//                     </td>
//                     <td className="px-4 py-4">
//                       <div className="flex items-center gap-2">
//                          {/* Sửa lại logic avatar cho an toàn nếu emp null */}
//                         <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarColors[parseInt(task.employeeId.slice(-1)) % 8]} flex items-center justify-center text-white text-xs font-bold`}>
//                           {emp?.avatar ? emp.avatar.slice(0, 2) : "??"}
//                         </div>
//                         <span className="text-slate-600 text-xs">{emp?.name ? emp.name.split(" ").slice(-2).join(" ") : "Unknown"}</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-4">
//                       <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priority.color}`}>{priority.label}</span>
//                     </td>
//                     <td className="px-4 py-4">
//                       <span className={`text-xs px-2.5 py-1 rounded-full font-medium text-white ${col?.color}`}>{col?.label}</span>
//                     </td>
//                     <td className="px-4 py-4">
//                       <div className="flex items-center gap-2">
//                         <div className="w-20 h-1.5 bg-slate-100 rounded-full">
//                           <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${task.progress}%` }} />
//                         </div>
//                         <span className="text-xs text-slate-500">{task.progress}%</span>
//                       </div>
//                     </td>
//                     <td className={`px-4 py-4 text-xs font-medium ${isOverdue ? "text-red-500" : "text-slate-500"}`}>
//                       {isOverdue && <AlertTriangle size={12} className="inline mr-1" />}
//                       {new Date(task.deadline).toLocaleDateString("vi-VN")}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
      
//       {/* Render Modal ở cuối cùng của component */}
//       <AddTaskModal 
//         isOpen={isAddModalOpen} 
//         onClose={() => setIsAddModalOpen(false)} 
//         employees={employees || []}
//         onRefresh={handleRefresh}
//       />
//     </div>
//   );
// }
