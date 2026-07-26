import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HondaCareHome from "../pages/HondaCareHome";
import AdminDashboard from "../pages/AdminDashboard";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("authUser") || "{}");
  } catch {
    user = {};
  }
  const roles = ["Administrator", "Branch Manager", "Service Receptionist"];
  if (!token) return <Navigate to="/login" />;
  return roles.includes(user.role) ? children : <Navigate to="/home" />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<HondaCareHome />} />
      <Route path="/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;