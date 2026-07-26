"use client";

import { FormEvent, useEffect, useState } from "react";
import { appointmentApi, catalogApi, type Branch, type Service } from "../api/api";
import { authApi } from "../api/authApi";
import "./HondaCareHome.css";
import { toast } from "react-toastify";

type IconName =
  | "arrow"
  | "battery"
  | "brake"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "engine"
  | "helmet"
  | "map"
  | "menu"
  | "oil"
  | "phone"
  | "shield"
  | "spark"
  | "speed"
  | "wrench";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    battery: (
      <>
        <rect x="3" y="6" width="16" height="12" rx="2" />
        <path d="M21 10v4M7 10v4M11 10v4M15 10v4" />
      </>
    ),
    brake: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v5M12 15v5M4 12h5M15 12h5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ),
    engine: (
      <>
        <path d="M5 9h10l3 3v6H8l-3-3Z" />
        <path d="M8 9V6h5v3M18 13h3v-3M8 18v2M15 18v2" />
      </>
    ),
    helmet: (
      <>
        <path d="M4 13a8 8 0 0 1 16 0v3H9" />
        <path d="M4 13h5v5H6a2 2 0 0 1-2-2Z" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    oil: (
      <>
        <path d="m5 8 5-3 4 4-5 5-4-1Z" />
        <path d="M14 9h5l2 3M8 14h10M18 14l2.5 2.5" />
        <path d="M19 18c0 1.1-.9 2-2 2s-2-.9-2-2 2-3.5 2-3.5 2 2.4 2 3.5Z" />
      </>
    ),
    phone: (
      <>
        <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M10 17h4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.4 2.8 8.2 7 10 4.2-1.8 7-5.6 7-10V6Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    speed: (
      <>
        <path d="M4 18a9 9 0 1 1 16 0" />
        <path d="m12 13 4-4M8 18h8" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8Z" />
        <path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7Z" />
      </>
    ),
    wrench: (
      <>
        <path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-3-3Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default function HondaCareHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login"
  );
  const [authForm, setAuthForm] = useState<any>({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [authUser, setAuthUser] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingError, setBookingError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const closeMenu = () => setMenuOpen(false);
  const openBooking = async () => {
    setMenuOpen(false);
    setSubmitState("idle");
    setBookingError("");
    if (!localStorage.getItem("accessToken")) {
      openAuth("login");
      toast.info("Vui l�ng dang nh?p d? d?t l?ch");
      return;
    }
    setBookingOpen(true);
    try {
      const [branchList, serviceList] = await Promise.all([
        catalogApi.getBranches(),
        catalogApi.getServices(),
      ]);
      setBranches(branchList);
      setServices(serviceList);
    } catch (error: any) {
      setBookingError(error?.message || error?.error || "Kh�ng t?i du?c d? li?u d?t l?ch");
    }
  };

  useEffect(() => {
    if (!bookingOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBookingOpen(false);
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [bookingOpen]);

  useEffect(() => {
    if (!authOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAuthOpen(false);
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [authOpen]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setAuthUser(JSON.parse(raw));
    } catch {
      setAuthUser(null);
    }
  }, []);

  function openAuth(mode: "login" | "register" | "forgot") {
    setAuthMode(mode);
    setAuthError("");
    setAuthMessage("");
    setAuthOpen(true);
  }

  function closeAuth() {
    setAuthOpen(false);
  }

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res: any = await authApi.login({
        phoneNumber: authForm.phoneNumber,
        password: authForm.password,
      });
      localStorage.setItem("accessToken", res.token);
      // persist basic user info if returned
      const user = res.user || {
        id: res.userId,
        fullName: res.fullName,
        phoneNumber: res.phoneNumber,
        role: res.role,
      };
      localStorage.setItem("authUser", JSON.stringify(user));
      setAuthUser(user);
      toast.success("Đăng nhập thành công");
      setTimeout(() => closeAuth(), 800);
    } catch (err: any) {
      setAuthError(err?.message || "Đăng nhập thất bại");
      toast.error(err?.message || "Đăng nhập thất bại");
    } finally {
      setAuthLoading(false);
    }
  };

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    setAuthUser(null);
    toast.info("Đã đăng xuất");
  }

  const submitRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (authForm.password !== authForm.confirmPassword) {
      setAuthError("Mật khẩu không khớp");
      return;
    }
    setAuthLoading(true);
    try {
      await authApi.register({
        fullName: authForm.name,
        phoneNumber: authForm.phoneNumber,
        password: authForm.password,
      });
      setAuthMessage("Đăng ký thành công. Vui lòng đăng nhập.");
      setAuthMode("login");
    } catch (err: any) {
      setAuthError(err?.message || "Đăng ký thất bại");
    } finally {
      setAuthLoading(false);
    }
  };

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      // No backend endpoint implemented here; show placeholder message
      setTimeout(() => {
        setAuthMessage("Yêu cầu đặt lại mật khẩu đã được gửi (giả lập)");
      }, 500);
    } catch (err: any) {
      setAuthError(err?.message || "Thao tác thất bại");
    } finally {
      setAuthLoading(false);
    }
  };

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setBookingError("");
    const data = new FormData(event.currentTarget);
    try {
      await appointmentApi.create({
        service_id: String(data.get("service_id")),
        branch_id: String(data.get("branch_id")),
        dateTime: new Date(String(data.get("dateTime"))).toISOString(),
        customer_note: String(data.get("customer_note") || ""),
      });
      setSubmitState("success");
    } catch (error: any) {
      setBookingError(error?.message || error?.error || "Chua th? g?i y�u c?u");
      setSubmitState("error");
    }
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="HondaCare - Trang chủ">
          <span className="brand-mark" aria-hidden="true">
            H
          </span>
          <span>
            Honda<span>Care</span>
          </span>
        </a>

        <nav className={menuOpen ? "main-nav is-open" : "main-nav"}>
          <a href="#home" onClick={closeMenu}>
            Trang chủ
          </a>
          <a href="#services" onClick={closeMenu}>
            Dịch vụ
          </a>
          <a href="#process" onClick={closeMenu}>
            Cách hoạt động
          </a>
          <a href="#contact" onClick={closeMenu}>
            Liên hệ
          </a>
        </nav>

        <div className="header-actions">
          {authUser ? (
            <div className="profile-menu" style={{ position: "relative" }}>
              <button
                className="profile-button"
                type="button"
                onClick={() => setProfileOpen((s) => !s)}
                aria-expanded={profileOpen}
              >
                <span className="avatar">{(authUser.name || authUser.phoneNumber || "").slice(0,2).toUpperCase()}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown" style={{position:'absolute', right:0, marginTop:8, background:'#fff', boxShadow:'0 6px 18px rgba(0,0,0,0.08)', borderRadius:8, padding:8}}>
                  <div className="p-2">{authUser.name || authUser.phoneNumber}</div>
                  <button className="p-2 text-left w-full" onClick={() => { setProfileOpen(false); /* navigate to profile if exists */ }}>Trang cá nhân</button>
                  <button className="p-2 text-left w-full" onClick={() => { setProfileOpen(false); logout(); }}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login-link"
              type="button"
              onClick={() => openAuth("login")}
            >
              Đăng nhập
            </button>
          )}
          <button
            className="button button-small"
            type="button"
            onClick={openBooking}
          >
            Đặt lịch ngay
          </button>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>

      {authOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAuth();
          }}
        >
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Đóng"
              onClick={closeAuth}
            >
              <Icon name="close" />
            </button>

            {authMode === "login" && (
              <>
                <span className="section-label">ĐĂNG NHẬP NHANH</span>
                <h2>Đăng nhập bằng số điện thoại</h2>
                <p className="modal-intro">Nhập số điện thoại và mật khẩu để tiếp tục.</p>

                <form className="booking-form" onSubmit={submitLogin}>
                  <label>
                    Số điện thoại
                    <input name="phoneNumber" type="tel" placeholder="+84901234567" required onChange={handleAuthChange} value={authForm.phoneNumber} />
                  </label>

                  <label>
                    Mật khẩu
                    <input name="password" type="password" placeholder="Mật khẩu" required onChange={handleAuthChange} value={authForm.password} />
                  </label>

                  {authError && <p className="form-error">{authError}</p>}

                  <div className="form-actions">
                    <button className="button button-primary submit-button" type="submit" disabled={authLoading}>{authLoading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
                    <button type="button" className="button" onClick={() => setAuthMode('forgot')}>Quên mật khẩu?</button>
                  </div>

                  <p className="mt-3 text-sm">Chưa có tài khoản? <button type="button" className="text-blue-500" onClick={() => setAuthMode('register')}>Đăng ký</button></p>
                </form>
              </>
            )}

            {authMode === "register" && (
              <>
                <span className="section-label">ĐĂNG KÝ NHANH</span>
                <h2>Đăng ký tài khoản</h2>
                <p className="modal-intro">Tạo tài khoản bằng số điện thoại để đặt lịch nhanh hơn.</p>

                <form className="booking-form" onSubmit={submitRegister}>
                  <label>
                    Họ và tên
                    <input name="name" type="text" placeholder="Nguyễn Văn A" required onChange={handleAuthChange} value={authForm.name} />
                  </label>

                  <label>
                    Số điện thoại
                    <input name="phoneNumber" type="tel" placeholder="+84901234567" required onChange={handleAuthChange} value={authForm.phoneNumber} />
                  </label>

                  <label>
                    Mật khẩu
                    <input name="password" type="password" placeholder="Mật khẩu" required onChange={handleAuthChange} value={authForm.password} />
                  </label>

                  <label>
                    Xác nhận mật khẩu
                    <input name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu" required onChange={handleAuthChange} value={authForm.confirmPassword} />
                  </label>

                  {authError && <p className="form-error">{authError}</p>}

                  <div className="form-actions">
                    <button className="button button-primary submit-button" type="submit" disabled={authLoading}>{authLoading ? 'Đang xử lý...' : 'Đăng ký'}</button>
                    <button type="button" className="button" onClick={() => setAuthMode('login')}>Đã có tài khoản?</button>
                  </div>
                </form>
              </>
            )}

            {authMode === "forgot" && (
              <>
                <span className="section-label">QUÊN MẬT KHẨU</span>
                <h2>Yêu cầu đặt lại mật khẩu</h2>
                <p className="modal-intro">Nhập số điện thoại để nhận hướng dẫn đặt lại mật khẩu.</p>

                <form className="booking-form" onSubmit={submitForgot}>
                  <label>
                    Số điện thoại
                    <input name="phoneNumber" type="tel" placeholder="+84901234567" required onChange={handleAuthChange} value={authForm.phoneNumber} />
                  </label>

                  {authError && <p className="form-error">{authError}</p>}

                  <div className="form-actions">
                    <button className="button button-primary submit-button" type="submit" disabled={authLoading}>{authLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}</button>
                    <button type="button" className="button" onClick={() => setAuthMode('login')}>Quay lại đăng nhập</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <section className="hero" id="home">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-copy">
          <div className="eyebrow">
            <span>
              <Icon name="shield" />
            </span>
            Chăm xe chủ động — An tâm mỗi hành trình
          </div>

          <h1>
            Xe khỏe hơn.
            <br />
            <span>Bạn an tâm hơn.</span>
          </h1>

          <p className="hero-description">
            Đặt lịch bảo dưỡng, theo dõi tình trạng xe và nhận nhắc lịch thông
            minh — tất cả trong một nền tảng chăm sóc xe máy đáng tin cậy.
          </p>

          <div className="hero-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={openBooking}
            >
              Đặt lịch bảo dưỡng
              <Icon name="arrow" />
            </button>
            <a className="button button-secondary" href="#services">
              Khám phá dịch vụ
            </a>
          </div>

          <div className="trust-row">
            <div className="trust-avatars" aria-hidden="true">
              <span>Đ</span>
              <span>H</span>
              <span>M</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>Được tin chọn bởi chủ xe Honda</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Bảng theo dõi sức khỏe xe">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />

          <div className="vehicle-card">
            <div className="vehicle-card-head">
              <div>
                <span className="card-kicker">XE CỦA BẠN</span>
                <h2>Air Blade 160</h2>
                <p>59A3 • 123.45</p>
              </div>
              <div className="vehicle-thumb" aria-hidden="true">
                <span />
                <span />
              </div>
            </div>

            <div className="health-summary">
              <div className="health-ring">
                <div>
                  <strong>86</strong>
                  <span>/100</span>
                </div>
              </div>
              <div className="health-copy">
                <span className="status-pill">
                  <i />
                  Tình trạng tốt
                </span>
                <h3>Sức khỏe xe ổn định</h3>
                <p>Tiếp tục duy trì lịch bảo dưỡng định kỳ.</p>
              </div>
            </div>

            <div className="health-grid">
              <div className="health-item">
                <span className="metric-icon metric-red">
                  <Icon name="oil" />
                </span>
                <div>
                  <span>Dầu động cơ</span>
                  <strong>Còn 320 km</strong>
                </div>
              </div>
              <div className="health-item">
                <span className="metric-icon metric-green">
                  <Icon name="battery" />
                </span>
                <div>
                  <span>Ắc quy</span>
                  <strong>92% · Tốt</strong>
                </div>
              </div>
            </div>

            <div className="next-service">
              <span className="calendar-box">
                <Icon name="calendar" />
              </span>
              <div>
                <span>LỊCH HẸN TIẾP THEO</span>
                <strong>Thứ Bảy, 08:30 • 25/07</strong>
              </div>
              <button type="button" aria-label="Xem lịch hẹn">
                <Icon name="chevron" />
              </button>
            </div>
          </div>

          <div className="floating-note floating-note-top">
            <span>
              <Icon name="check" />
            </span>
            <div>
              <strong>Đã kiểm tra 8 hạng mục</strong>
              <small>Cập nhật 2 phút trước</small>
            </div>
          </div>

          <div className="floating-note floating-note-bottom">
            <span className="note-red">
              <Icon name="clock" />
            </span>
            <div>
              <strong>Nhắc lịch tự động</strong>
              <small>Không bỏ lỡ kỳ bảo dưỡng</small>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <span className="section-label">DỊCH VỤ NỔI BẬT</span>
            <h2>Mọi nhu cầu chăm xe, trong một nơi.</h2>
          </div>
          <p>
            Quy trình rõ ràng, phụ tùng minh bạch và cập nhật trạng thái ngay
            trên điện thoại của bạn.
          </p>
        </div>

        <div className="service-grid">
          <article className="service-card service-featured">
            <span className="service-icon">
              <Icon name="wrench" />
            </span>
            <span className="service-tag">PHỔ BIẾN</span>
            <h3>Bảo dưỡng định kỳ</h3>
            <p>
              Kiểm tra toàn diện các hạng mục quan trọng theo số kilomet của xe.
            </p>
            <div className="service-meta">
              <span>
                <Icon name="clock" />
                45–60 phút
              </span>
              <button type="button" onClick={openBooking}>
                Đặt lịch
                <Icon name="arrow" />
              </button>
            </div>
          </article>

          <article className="service-card">
            <span className="service-icon">
              <Icon name="oil" />
            </span>
            <h3>Thay dầu động cơ</h3>
            <p>
              Chọn đúng loại dầu theo dòng xe và lịch sử vận hành thực tế.
            </p>
            <div className="service-meta">
              <span>
                <Icon name="clock" />
                20–30 phút
              </span>
              <button type="button" onClick={openBooking}>
                Đặt lịch
                <Icon name="arrow" />
              </button>
            </div>
          </article>

          <article className="service-card">
            <span className="service-icon">
              <Icon name="brake" />
            </span>
            <h3>Phanh & lốp xe</h3>
            <p>
              Kiểm tra độ mòn, áp suất lốp và khả năng vận hành an toàn.
            </p>
            <div className="service-meta">
              <span>
                <Icon name="clock" />
                30–45 phút
              </span>
              <button type="button" onClick={openBooking}>
                Đặt lịch
                <Icon name="arrow" />
              </button>
            </div>
          </article>

          <article className="service-card">
            <span className="service-icon">
              <Icon name="engine" />
            </span>
            <h3>Điện & động cơ</h3>
            <p>
              Chẩn đoán ắc quy, hệ thống điện và hiệu suất động cơ chuyên sâu.
            </p>
            <div className="service-meta">
              <span>
                <Icon name="clock" />
                Theo tình trạng
              </span>
              <button type="button" onClick={openBooking}>
                Đặt lịch
                <Icon name="arrow" />
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="process-copy">
          <span className="section-label">CHĂM XE NHẸ NHÀNG HƠN</span>
          <h2>Ba bước để xe luôn trong trạng thái tốt nhất.</h2>
          <p className="process-lead">
            HondaCare giúp bạn chủ động từ lúc đặt lịch đến khi nhận xe, không
            cần gọi điện nhiều lần.
          </p>

          <div className="process-list">
            <div className="process-item">
              <span>01</span>
              <div>
                <h3>Chọn dịch vụ & thời gian</h3>
                <p>Đặt lịch nhanh theo nhu cầu và chi nhánh thuận tiện.</p>
              </div>
            </div>
            <div className="process-item">
              <span>02</span>
              <div>
                <h3>Theo dõi tiến độ trực tuyến</h3>
                <p>Nhận cập nhật theo từng bước trong quá trình bảo dưỡng.</p>
              </div>
            </div>
            <div className="process-item">
              <span>03</span>
              <div>
                <h3>Lưu lịch sử & nhắc bảo dưỡng</h3>
                <p>Dễ dàng xem lại và không bỏ lỡ mốc chăm xe tiếp theo.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="care-panel">
          <div className="care-panel-top">
            <div>
              <span className="section-label">HỒ SƠ CHĂM XE</span>
              <h3>Mọi thông tin luôn trong tầm tay</h3>
            </div>
            <span className="care-spark">
              <Icon name="spark" />
            </span>
          </div>

          <div className="timeline-card">
            <div className="timeline-line" />
            <div className="timeline-item is-complete">
              <span>
                <Icon name="check" />
              </span>
              <div>
                <strong>Tiếp nhận xe</strong>
                <small>08:27 · Đã hoàn tất</small>
              </div>
            </div>
            <div className="timeline-item is-current">
              <span>
                <Icon name="wrench" />
              </span>
              <div>
                <strong>Đang bảo dưỡng</strong>
                <small>Kỹ thuật viên Nguyễn Minh H.</small>
              </div>
              <i>Đang thực hiện</i>
            </div>
            <div className="timeline-item">
              <span>
                <Icon name="helmet" />
              </span>
              <div>
                <strong>Sẵn sàng bàn giao</strong>
                <small>Dự kiến 09:35</small>
              </div>
            </div>
          </div>

          <div className="care-benefits">
            <div>
              <Icon name="shield" />
              <span>
                <strong>Minh bạch</strong>
                <small>Hạng mục & chi phí</small>
              </span>
            </div>
            <div>
              <Icon name="phone" />
              <span>
                <strong>Tiện lợi</strong>
                <small>Cập nhật tức thời</small>
              </span>
            </div>
          </div>
        </div>

        <div className="cta-strip">
          <div>
            <span>Sẵn sàng chăm xe chủ động?</span>
            <h3>Đặt lịch đầu tiên cùng HondaCare.</h3>
          </div>
          <button className="button cta-button" type="button" onClick={openBooking}>
            Đặt lịch ngay
            <Icon name="arrow" />
          </button>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand" href="#home">
              <span className="brand-mark" aria-hidden="true">
                H
              </span>
              <span>
                Honda<span>Care</span>
              </span>
            </a>
            <p>
              Nền tảng chăm sóc xe máy giúp bạn chủ động, minh bạch và an tâm
              hơn trên mọi hành trình.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <strong>Khám phá</strong>
              <a href="#services">Dịch vụ</a>
              <a href="#process">Cách hoạt động</a>
              <button type="button" onClick={openBooking}>
                Đặt lịch
              </button>
            </div>
            <div>
              <strong>Hỗ trợ</strong>
              <a href="tel:19001234">1900 1234</a>
              <a href="mailto:hello@hondacare.vn">hello@hondacare.vn</a>
              <span>Thứ 2 – Chủ nhật · 07:30–18:00</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 HondaCare. Dự án nền tảng chăm sóc xe.</span>
          <span>Điều khoản · Quyền riêng tư</span>
        </div>
      </footer>

      <button
        className="mobile-booking-button"
        type="button"
        onClick={openBooking}
      >
        <Icon name="calendar" />
        Đặt lịch bảo dưỡng
      </button>

      {bookingOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBookingOpen(false);
          }}
        >
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Đóng biểu mẫu"
              onClick={() => setBookingOpen(false)}
            >
              <Icon name="close" />
            </button>

            {submitState === "success" ? (
              <div className="booking-success">
                <span>
                  <Icon name="check" />
                </span>
                <span className="section-label">YÊU CẦU ĐÃ ĐƯỢC GHI NHẬN</span>
                <h2>Cảm ơn bạn đã chọn HondaCare!</h2>
                <p>
                  Đây là thao tác demo. Khi kết nối backend Node.js, yêu cầu sẽ
                  được lưu và xác nhận tự động.
                </p>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => setBookingOpen(false)}
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <>
                <span className="section-label">ĐẶT LỊCH NHANH</span>
                <h2 id="booking-title">Chọn lịch chăm xe phù hợp.</h2>
                <p className="modal-intro">
                  Điền thông tin bên dưới, HondaCare sẽ chuẩn bị trước khi bạn
                  đến.
                </p>

                <form className="booking-form" onSubmit={handleBookingSubmit}>
                  <label>
                    D?ch v?
                    <select name="service_id" defaultValue="" required>
                      <option value="" disabled>Ch?n d?ch v?</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name}{service.price != null ? ` - ${service.price.toLocaleString("vi-VN")}d` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Chi nh�nh
                    <select name="branch_id" defaultValue="" required>
                      <option value="" disabled>Ch?n chi nh�nh</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>{branch.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Ng�y v� gi? mong mu?n
                    <input name="dateTime" type="datetime-local" min={new Date().toISOString().slice(0, 16)} required />
                  </label>
                  <label>
                    Ghi ch�
                    <input name="customer_note" type="text" placeholder="Nhu c?u ho?c t�nh tr?ng xe (kh�ng b?t bu?c)" />
                  </label>

                  {bookingError && <p className="form-error">{bookingError}</p>}
                  <button
                    className="button button-primary submit-button"
                    type="submit"
                    disabled={submitState === "submitting"}
                  >
                    {submitState === "submitting"
                      ? "Đang ghi nhận..."
                      : "Xác nhận đặt lịch"}
                    {submitState !== "submitting" && <Icon name="arrow" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
