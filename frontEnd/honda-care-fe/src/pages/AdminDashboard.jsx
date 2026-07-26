import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import "./AdminDashboard.css";

const statusLabel = {
  Pending: "Chờ xác nhận",
  Approved: "Đã xác nhận",
  Progress: "Đang thực hiện",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const statusOptions = Object.keys(statusLabel);

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({ label, value, note, tone }) {
  return (
    <article className={`admin-stat admin-stat--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [actionId, setActionId] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        adminApi.getAppointments(),
        adminApi.getCustomers(),
        adminApi.getBranches(),
        adminApi.getServices(),
      ]);
      if (!active) return;
      const [appointmentResult, customerResult, branchResult, serviceResult] = results;
      if (appointmentResult.status === "fulfilled") {
        setAppointments(appointmentResult.value.appointments || []);
      }
      if (customerResult.status === "fulfilled") {
        setCustomers(customerResult.value.list_Customer || []);
      }
      if (branchResult.status === "fulfilled") {
        setBranches(branchResult.value.list_branch || []);
      }
      if (serviceResult.status === "fulfilled") {
        setServices(serviceResult.value.list_services || []);
      }
      if (results.every((result) => result.status === "rejected")) {
        setError("Không thể tải dữ liệu quản trị. Hãy kiểm tra máy chủ và quyền tài khoản.");
      }
      setLoading(false);
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const filteredAppointments = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === "All" || appointment.status === statusFilter;
      const searchable = [
        appointment.customer_id?.fullName,
        appointment.customer_id?.phoneNumber,
        appointment.service_id?.name,
        appointment.branch_id?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!keyword || searchable.includes(keyword));
    });
  }, [appointments, query, statusFilter]);

  const todayCount = appointments.filter((appointment) => {
    const date = new Date(appointment.dateTime);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setError("");
    try {
      await adminApi.updateAppointment(id, { status });
      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === id ? { ...appointment, status } : appointment
        )
      );
    } catch (requestError) {
      setError(
        requestError?.message || requestError?.error || "Không thể cập nhật trạng thái lịch hẹn."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleCustomer(customer) {
    setActionId(customer._id);
    setError("");
    try {
      const response = await adminApi.toggleCustomerStatus(customer._id);
      setCustomers((current) =>
        current.map((item) =>
          item._id === customer._id ? { ...item, isActive: response.isActive_now } : item
        )
      );
    } catch (requestError) {
      setError(
        requestError?.message || requestError?.error || "Khong the cap nhat trang thai khach hang."
      );
    } finally {
      setActionId(null);
    }
  }

  async function toggleBranch(branch) {
    setActionId(branch._id);
    setError("");
    try {
      const response = await adminApi.toggleBranchStatus(branch._id);
      setBranches((current) =>
        current.map((item) =>
          item._id === branch._id ? { ...item, isActive: response.isActive_now } : item
        )
      );
    } catch (requestError) {
      setError(
        requestError?.message || requestError?.error || "Khong the cap nhat trang thai chi nhanh."
      );
    } finally {
      setActionId(null);
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate("/home")}>
          <span>H</span>
          <b>HondaCare</b>
        </button>
        <nav aria-label="Điều hướng quản trị">
          {[
            ["overview", "Tổng quan"],
            ["appointments", "Lịch hẹn"],
            ["customers", "Khách hàng"],
            ["catalog", "Chi nhánh & dịch vụ"],
          ].map(([id, label]) => (
            <button
              className={section === id ? "is-active" : ""}
              key={id}
              onClick={() => setSection(id)}
            >
              <span className="admin-nav-dot" />
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span>{user.fullName || user.phoneNumber || "Quản trị viên"}</span>
          <small>{user.role || "Administrator"}</small>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>TRUNG TÂM VẬN HÀNH</p>
            <h1>
              {section === "overview" && "Tổng quan HondaCare"}
              {section === "appointments" && "Quản lý lịch hẹn"}
              {section === "customers" && "Danh sách khách hàng"}
              {section === "catalog" && "Mạng lưới dịch vụ"}
            </h1>
          </div>
          <button className="admin-home-link" onClick={() => navigate("/home")}>
            Xem trang khách hàng
          </button>
        </header>

        {error && <div className="admin-alert">{error}</div>}

        {loading ? (
          <div className="admin-loading">Đang tổng hợp dữ liệu HondaCare…</div>
        ) : (
          <>
            {section === "overview" && (
              <>
                <section className="admin-stats">
                  <StatCard
                    label="Lịch hẹn hôm nay"
                    value={todayCount}
                    note="Cần được tiếp nhận"
                    tone="red"
                  />
                  <StatCard
                    label="Đang chờ xác nhận"
                    value={appointments.filter((item) => item.status === "Pending").length}
                    note="Ưu tiên xử lý"
                    tone="amber"
                  />
                  <StatCard
                    label="Khách hàng"
                    value={customers.length}
                    note="Tài khoản đã đăng ký"
                    tone="blue"
                  />
                  <StatCard
                    label="Dịch vụ hoạt động"
                    value={services.length}
                    note={`${branches.length} chi nhánh`}
                    tone="green"
                  />
                </section>
                <section className="admin-panel">
                  <div className="admin-panel__heading">
                    <div>
                      <span>ƯU TIÊN HÔM NAY</span>
                      <h2>Lịch hẹn cần xử lý</h2>
                    </div>
                    <button onClick={() => setSection("appointments")}>Xem tất cả</button>
                  </div>
                  <AppointmentTable
                    appointments={appointments
                      .filter((item) => item.status === "Pending")
                      .slice(0, 6)}
                    updatingId={updatingId}
                    onStatusChange={updateStatus}
                  />
                </section>
              </>
            )}

            {section === "appointments" && (
              <section className="admin-panel">
                <div className="admin-toolbar">
                  <input
                    aria-label="Tìm lịch hẹn"
                    placeholder="Tìm khách hàng, số điện thoại, dịch vụ…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <select
                    aria-label="Lọc trạng thái"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="All">Tất cả trạng thái</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <AppointmentTable
                  appointments={filteredAppointments}
                  updatingId={updatingId}
                  onStatusChange={updateStatus}
                />
              </section>
            )}

            {section === "customers" && (
              <section className="admin-panel">
                <div className="admin-panel__heading">
                  <div>
                    <span>KHÁCH HÀNG</span>
                    <h2>{customers.length} tài khoản</h2>
                  </div>
                </div>
                <div className="admin-customer-grid">
                  {customers.map((customer) => (
                    <article key={customer._id}>
                      <span className="admin-avatar">
                        {(customer.fullName || customer.phoneNumber || "HC")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <strong>{customer.fullName || "Chưa cập nhật tên"}</strong>
                        <p>{customer.phoneNumber}</p>
                        <small>{customer.address || "Chưa cập nhật địa chỉ"}</small>
                      </div>
                      <button
                        className={`admin-state-action ${customer.isActive === false ? "is-off" : ""}`}
                        disabled={actionId === customer._id}
                        onClick={() => toggleCustomer(customer)}
                      >
                        {actionId === customer._id
                          ? "Dang luu..."
                          : customer.isActive === false
                            ? "Mo khoa"
                            : "Khoa"}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {section === "catalog" && (
              <div className="admin-catalog-grid">
                <section className="admin-panel">
                  <div className="admin-panel__heading">
                    <div>
                      <span>MẠNG LƯỚI</span>
                      <h2>{branches.length} chi nhánh</h2>
                    </div>
                  </div>
                  <div className="admin-simple-list">
                    {branches.map((branch) => (
                      <article key={branch._id}>
                        <div>
                          <strong>{branch.name}</strong>
                          <p>{branch.address}</p>
                        </div>
                        <button
                          className={`admin-state-action ${branch.isActive === false ? "is-off" : ""}`}
                          disabled={actionId === branch._id}
                          onClick={() => toggleBranch(branch)}
                        >
                          {actionId === branch._id
                            ? "Dang luu..."
                            : branch.isActive === false
                              ? "Mo lai"
                              : "Tam dung"}
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="admin-panel">
                  <div className="admin-panel__heading">
                    <div>
                      <span>DANH MỤC</span>
                      <h2>{services.length} dịch vụ</h2>
                    </div>
                  </div>
                  <div className="admin-simple-list">
                    {services.map((service) => (
                      <article key={service._id}>
                        <div>
                          <strong>{service.name}</strong>
                          <p>{service.estimatedTime || 0} giờ thực hiện</p>
                        </div>
                        <span>{Number(service.price || 0).toLocaleString("vi-VN")}đ</span>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AppointmentTable({ appointments, updatingId, onStatusChange }) {
  if (!appointments.length) {
    return <div className="admin-empty">Không có lịch hẹn phù hợp.</div>;
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Dịch vụ</th>
            <th>Chi nhánh</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>
                <strong>{appointment.customer_id?.fullName || "Khách hàng"}</strong>
                <small>{appointment.customer_id?.phoneNumber || "—"}</small>
              </td>
              <td>{appointment.service_id?.name || "—"}</td>
              <td>{appointment.branch_id?.name || "—"}</td>
              <td>{formatDate(appointment.dateTime)}</td>
              <td>
                <select
                  className={`admin-status admin-status--${appointment.status.toLowerCase()}`}
                  value={appointment.status}
                  disabled={updatingId === appointment._id}
                  onChange={(event) => onStatusChange(appointment._id, event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel[status]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
