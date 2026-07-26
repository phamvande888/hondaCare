import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phoneNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.phoneNumber || !form.password) {
      return "Vui lòng nhập đầy đủ thông tin";
    }
    // đơn giản: chỉ cho phép số (9-15 chữ số), có thể điều chỉnh theo yêu cầu
    if (!/^\+?\d{9,15}$/.test(form.phoneNumber)) {
      return "Số điện thoại không hợp lệ";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);
      setError("");

      const res = await authApi.login(form);

      // giả định API trả về accessToken
      localStorage.setItem("accessToken", res.accessToken);
      const user = res.user || { phoneNumber: form.phoneNumber };
      localStorage.setItem("authUser", JSON.stringify(user));
      toast.success("Đăng nhập thành công");

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login thất bại");
      toast.error(err.message || "Login thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-6 shadow-lg rounded-xl bg-white"
      >
        <h2 className="text-2xl font-bold mb-4">Đăng nhập bằng số điện thoại</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <label className="block mb-2 text-sm text-gray-700">Số điện thoại</label>
        <input
          name="phoneNumber"
          type="tel"
          inputMode="tel"
          placeholder="Ví dụ: +84901234567"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          onChange={handleChange}
          value={form.phoneNumber}
          autoComplete="tel"
        />
        <p className="text-xs text-gray-500 mb-3">Nhập số điện thoại có mã vùng, không có khoảng trắng.</p>

        <label className="block mb-2 text-sm text-gray-700">Mật khẩu</label>
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          onChange={handleChange}
          value={form.password}
          autoComplete="current-password"
        />

        <button
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <div className="mt-3 text-sm flex justify-between">
          <p>
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-blue-500">
              Đăng ký
            </Link>
          </p>
          <Link to="/forgot" className="text-blue-500">Quên mật khẩu?</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;