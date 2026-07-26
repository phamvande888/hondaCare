import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name || !form.phoneNumber || !form.password) {
      return "Vui lòng nhập đầy đủ thông tin";
    }
    if (form.password !== form.confirmPassword) {
      return "Mật khẩu không khớp";
    }
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

      await authApi.register(form);

      navigate("/login");
    } catch (err) {
      setError(err.message || "Register thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form className="w-96 p-6 shadow-lg rounded-xl bg-white" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Đăng ký</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <label className="block mb-2 text-sm text-gray-700">Họ và tên</label>
        <input
          name="name"
          placeholder="Họ và tên"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-200"
          onChange={handleChange}
          value={form.name}
        />

        <label className="block mb-2 text-sm text-gray-700">Số điện thoại</label>
        <input
          name="phoneNumber"
          type="tel"
          inputMode="tel"
          placeholder="Ví dụ: +84901234567"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-200"
          onChange={handleChange}
          value={form.phoneNumber}
          autoComplete="tel"
        />

        <label className="block mb-2 text-sm text-gray-700">Mật khẩu</label>
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-200"
          onChange={handleChange}
          value={form.password}
          autoComplete="new-password"
        />

        <label className="block mb-2 text-sm text-gray-700">Xác nhận mật khẩu</label>
        <input
          name="confirmPassword"
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-200"
          onChange={handleChange}
          value={form.confirmPassword}
        />

        <button
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="mt-3 text-sm">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-500">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;