import { useState } from "react";
import { Search, Plus, Filter, Edit2, Trash2, Eye, Phone, Mail, ChevronDown } from "lucide-react";
import { Employee } from "../data/Dataset";
import { useEmployees } from "../hooks/useAPI";

const statusLabel: Record<string, { label: string; color: string }> = {
  active: { label: "Đang làm việc", color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Nghỉ việc", color: "bg-red-100 text-red-600" },
  probation: { label: "Thử việc", color: "bg-amber-100 text-amber-700" },
};

const levelColor: Record<string, string> = {
  Junior: "bg-slate-100 text-slate-600",
  Mid: "bg-blue-100 text-blue-700",
  Senior: "bg-violet-100 text-violet-700",
  Lead: "bg-amber-100 text-amber-700",
  Manager: "bg-emerald-100 text-emerald-700",
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

// Hàm tạo chỉ số màu dựa trên tên (để màu không đổi khi reload)
const getColorIndex = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatarColors.length;
};

// Employee Detail Modal Props
interface ModalProps {
  employee: Employee;
  onClose: () => void;
}

// Employee Detail Modal
function EmployeeModal({ employee, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl font-bold">✕</button>
        </div>
        <div className="px-6 pb-6 pt-10">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[getColorIndex(employee.name)]} flex items-center justify-center text-white font-bold text-xl -mt-8 shadow-lg border-4 border-white`}>
            {employee.avatar}
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-800">{employee.name}</h3>
            <p className="text-slate-500 text-sm">{employee.position}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Mã NV", value: employee.empId },
              { label: "Phòng ban", value: employee.department },
              { label: "Cấp bậc", value: employee.level },
              { label: "Ngày vào", value: new Date(employee.joinDate).toLocaleDateString("vi-VN") },
              { label: "Lương cơ bản", value: employee.salary.toLocaleString("vi-VN") + " đ" },
              { label: "Trạng thái", value: statusLabel[employee.status].label },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 text-xs">{item.label}</p>
                <p className="text-slate-700 text-sm font-semibold mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Mail size={14} className="text-slate-400" />
              {employee.email}
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Phone size={14} className="text-slate-400" />
              {employee.phone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeList() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State cho View Detail
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // State cho Modal Add/Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Phân biệt Thêm hay Sửa
  const [currentEditId, setCurrentEditId] = useState<string | null>(null); // Lưu ID khi sửa
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Backend",
    position: "",
    salary: 10000000,
    level: "Junior",
    status: "active",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { employees, loading, error } = useEmployees();

  // ... (Giữ nguyên các logic filter departments, filtered list ở dưới) ...
  const departments = ["all", ...Array.from(new Set((employees || []).map((e: Employee) => e.department)))];
  // Code filtering dữ liệu dựa trên search, deptFilter, statusFilter
  const filtered = (employees || []).filter((e: Employee) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

    // --- THÊM STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Số lượng nhân viên mỗi trang

  // --- LOGIC PAGINATION ---
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  
  // Đảm bảo currentPage không vượt quá tổng số trang (ví dụ khi xóa dữ liệu)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // Cắt mảng dữ liệu để lấy đúng 6 item cho trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);
  
  // Hàm chuyển trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- HANDLERS ---

  // Mở modal THÊM mới
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "Backend",
      position: "",
      salary: 10000000,
      level: "Junior",
      status: "active",
    });
    setFormError("");
    setShowFormModal(true);
  };

  // Mở modal CHỈNH SỬA
  const openEditModal = (emp: Employee) => {
    // Hỏi xác nhận trước khi mở form (theo yêu cầu)
    if (window.confirm("Bạn có thực sự muốn chỉnh sửa dữ liệu nhân viên cũ?")) {
      setIsEditing(true);
      setCurrentEditId(emp.id); // Lưu lại ID của nhân viên cần sửa
      setFormData({
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        position: emp.position,
        salary: emp.salary,
        level: emp.level,
        status: emp.status,
      });
      setFormError("");
      setShowFormModal(true);
    }
  };

  // Xử lý Submit (Cho cả Add và Edit)
  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.position) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      let response;
      
      if (isEditing && currentEditId) {
        // Gọi API Update
        response = await fetch(`http://localhost:3001/api/employees/${currentEditId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Gọi API Create
        response = await fetch("http://localhost:3001/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();

      if (response.ok) {
        alert(isEditing ? "Cập nhật thông tin thành công!" : "Thêm nhân viên thành công!");
        setShowFormModal(false);
        window.location.reload(); // Reload trang theo yêu cầu
      } else {
        setFormError(result.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setFormError("Lỗi kết nối đến server. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý nhân viên</h2>
          <p className="text-slate-500 text-sm mt-1">Tổng cộng {employees?.length || 0} nhân viên trong hệ thống</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-emerald-200"
        >
          <Plus size={16} />
          Thêm nhân viên
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />  
            <input
              type="text"
              placeholder="Tìm kiếm tên, mã NV, chức vụ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset về trang 1 khi thay đổi search
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
            />
          </div>
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
              }}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d === "all" ? "Tất cả phòng ban" : d}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
              }}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang làm việc</option>
              <option value="probation">Thử việc</option>
              <option value="inactive">Nghỉ việc</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Nhân viên</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Phòng ban</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Cấp bậc</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Lương cơ bản</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Trạng thái</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Ngày vào</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Hành động</th>
              </tr>
            </thead>
                        <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Đang tải dữ liệu...</td></tr>
              )}
              {error && (
                <tr><td colSpan={7} className="text-center py-12 text-red-500">Lỗi: {error}</td></tr>
              )}
              
              {/* SỬA: Dùng paginatedData thay vì filtered */}
              {!loading && !error && paginatedData.map((emp: Employee) => {
                 // ... giữ nguyên logic màu avatar và render row ...
                 const getColorIndex = (str: string) => {
                  let hash = 0;
                  for (let i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  return Math.abs(hash) % avatarColors.length;
                };
                const colorIdx = getColorIndex(emp.name);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                     {/* ... nội dung row giữ nguyên ... */}
                     <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="text-slate-800 text-sm font-semibold">{emp.name}</p>
                          <p className="text-slate-400 text-xs">{emp.empId || emp.id} · {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* ... các cột khác giữ nguyên ... */}
                     <td className="px-4 py-4">
                      <span className="text-slate-700 text-sm font-medium">{emp.department}</span>
                      <p className="text-slate-400 text-xs">{emp.position}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${levelColor[emp.level]}`}>
                        {emp.level}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-800 text-sm font-semibold">
                        {emp.salary.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-slate-400 text-xs"> đ</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusLabel[emp.status].color}`}>
                        {statusLabel[emp.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-sm">
                      {new Date(emp.joinDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedEmp(emp)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEditModal(emp)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Chỉnh sửa">
                          <Edit2 size={15} />
                        </button>
                        {/* <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                          <Trash2 size={15} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Filter size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Không tìm thấy nhân viên phù hợp</p>
          </div>
        )}

        {/* FOOTER PHÂN TRANG ĐỘNG */}
        {filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, filtered.length)} của {filtered.length} nhân viên
            </p>
            
            <div className="flex gap-1">
              {/* Nút Previous */}
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  currentPage === 1 
                    ? "text-slate-300 cursor-not-allowed" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                &lt;
              </button>

              {/* Danh sách số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === currentPage
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Nút Next */}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  currentPage === totalPages 
                    ? "text-slate-300 cursor-not-allowed" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedEmp && <EmployeeModal employee={selectedEmp} onClose={() => setSelectedEmp(null)} />}
      
      {/* Modal Form (Dùng chung cho Thêm và Sửa) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Họ và tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="email@nodejscorp.vn"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Số điện thoại *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={11}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="09xxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Phòng ban</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {["Frontend", "Backend", "DevOps", "QA", "UI/UX", "HR"].map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Chức vụ *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="NodeJS Developer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Cấp bậc</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Lương cơ bản (VNĐ)</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 5000000 })}
                  min={5000000}
                  max={100000000}
                  step={500000}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="active">Đang làm việc</option>
                  <option value="probation">Thử việc</option>
                  <option value="inactive">Nghỉ việc</option>
                </select>
              </div>
            </div>

            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowFormModal(false)} 
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:opacity-90 transition disabled:opacity-70"
              >
                {submitting ? "Đang xử lý..." : (isEditing ? "Lưu thay đổi" : "Thêm nhân viên")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
