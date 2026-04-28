
// API Base URL
const API_BASE_URL = "http://localhost:3001";

// Helper function for API calls
const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body?: unknown
) => {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// ============ EMPLOYEE API ============
export const employeeAPI = {
  getAll: () => apiCall("/api/employees"),
  getById: (id: string) => apiCall(`/api/employees/${id}`),
  create: (data: unknown) => apiCall("/api/employees", "POST", data),
  update: (id: string, data: unknown) =>
    apiCall(`/api/employees/${id}`, "PUT", data),
  delete: (id: string) => apiCall(`/api/employees/${id}`, "DELETE"),
};

// ============ TASK API ============
export const taskAPI = {
  getAll: () => apiCall("/api/tasks"),
  getByEmployeeId: (employeeId: string) =>
    apiCall(`/api/tasks/employee/${employeeId}`),
  create: (data: unknown) => apiCall("/api/tasks", "POST", data),
  update: (id: string, data: unknown) => apiCall(`/api/tasks/${id}`, "PUT", data),
  delete: (id: string) => apiCall(`/api/tasks/${id}`, "DELETE"),
};

// ============ ATTENDANCE API ============
export const attendanceAPI = {
  getAll: () => apiCall("/api/attendances"),
  getByEmployeeId: (employeeId: string) =>
    apiCall(`/api/attendances/employee/${employeeId}`),
  create: (data: unknown) => apiCall("/api/attendances", "POST", data),
  update: (id: string, data: unknown) =>
    apiCall(`/api/attendances/${id}`, "PUT", data),
};

// ============ SALARY API ============
export const salaryAPI = {
  getAll: () => apiCall("/api/salaries"),
  getByEmployeeId: (employeeId: string) =>
    apiCall(`/api/salaries/employee/${employeeId}`),
  create: (data: unknown) => apiCall("/api/salaries", "POST", data),
  update: (id: string, data: unknown) =>
    apiCall(`/api/salaries/${id}`, "PUT", data),
};
