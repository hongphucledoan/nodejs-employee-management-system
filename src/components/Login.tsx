import { useState } from "react";
import { LogIn } from "lucide-react";

interface LoginProps {
  onLogin: (token: string, username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Đăng nhập thất bại");
        return;
      }

      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", data.username);

      onLogin(data.token, data.username);
    } catch (err) {
      setError("Lỗi kết nối với server");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !registerPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      setError("Mật khẩu không khớp");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: registerPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Đăng ký thất bại");
        return;
      }

      setError("");
      setShowRegister(false);
      setUsername("");
      setPassword("");
      setRegisterPassword("");
      setRegisterPasswordConfirm("");
      alert("Đăng ký thành công! Hãy đăng nhập.");
    } catch (err) {
      setError("Lỗi kết nối với server");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NodeJS Corp</h1>
          <p className="text-slate-400">Hệ thống quản lý nhân viên</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">
            {showRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={showRegister ? handleRegister : handleLogin}>
            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={showRegister ? registerPassword : password}
                onChange={(e) =>
                  showRegister
                    ? setRegisterPassword(e.target.value)
                    : setPassword(e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="Nhập mật khẩu"
                disabled={loading}
              />
            </div>

            {/* Confirm Password (Register only) */}
            {showRegister && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={registerPasswordConfirm}
                  onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Xác nhận mật khẩu"
                  disabled={loading}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mb-4"
            >
              {loading
                ? "Đang xử lý..."
                : showRegister
                  ? "Đăng ký"
                  : "Đăng nhập"}
            </button>

            {/* Toggle Register/Login */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                {showRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(!showRegister);
                    setError("");
                    setUsername("");
                    setPassword("");
                    setRegisterPassword("");
                    setRegisterPasswordConfirm("");
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                  disabled={loading}
                >
                  {showRegister ? "Đăng nhập" : "Đăng ký"}
                </button>
              </p>
            </div>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 mb-2">
              <strong>Demo:</strong>
            </p>
            <p className="text-xs text-slate-400">
              Username: <code className="bg-black/30 px-1.5 py-0.5 rounded">admin</code>
            </p>
            <p className="text-xs text-slate-400">
              Password: <code className="bg-black/30 px-1.5 py-0.5 rounded">123456</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
