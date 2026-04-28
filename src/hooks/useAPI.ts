import { useState, useEffect } from "react";
import { employeeAPI, taskAPI, attendanceAPI, salaryAPI } from "../services/api";

// ============ useEmployees Hook ============
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getAll();
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refresh = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh employees");
    }
  };

  return { employees, loading, error, refresh };
};

// ============ useTasks Hook ============
export const useTasks = (employeeId?: string) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = employeeId
          ? await taskAPI.getByEmployeeId(employeeId)
          : await taskAPI.getAll();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  const refresh = async () => {
    try {
      const data = employeeId
        ? await taskAPI.getByEmployeeId(employeeId)
        : await taskAPI.getAll();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh tasks");
    }
  };

  return { tasks, loading, error, refresh };
};

// ============ useAttendances Hook ============
export const useAttendances = (employeeId?: string) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = employeeId
          ? await attendanceAPI.getByEmployeeId(employeeId)
          : await attendanceAPI.getAll();
        setAttendances(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch attendances");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  const refresh = async () => {
    try {
      const data = employeeId
        ? await attendanceAPI.getByEmployeeId(employeeId)
        : await attendanceAPI.getAll();
      setAttendances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh attendances");
    }
  };

  return { attendances, loading, error, refresh };
};

// ============ useSalaries Hook ============
export const useSalaries = (employeeId?: string) => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = employeeId
          ? await salaryAPI.getByEmployeeId(employeeId)
          : await salaryAPI.getAll();
        setSalaries(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch salaries");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  const refresh = async () => {
    try {
      const data = employeeId
        ? await salaryAPI.getByEmployeeId(employeeId)
        : await salaryAPI.getAll();
      setSalaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh salaries");
    }
  };

  return { salaries, loading, error, refresh };
};
