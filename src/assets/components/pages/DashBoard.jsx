import { useEffect, useState } from "react";
import {
  FiActivity,
  FiBell,
  FiBox,
  FiCalendar,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiSettings,
  FiShoppingCart,
  FiShoppingBag,
  FiTag,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { getDashboardStats, getLoginStatus, login, logout } from "../../../api.js";
import CategoryManagement from "./CategoryManagement.jsx";
import ProductManagement from "./ProductManagement.jsx";

const navigationItems = [
  { label: "Dashboard", icon: FiGrid },
  { label: "Products", icon: FiBox },
  { label: "Categories", icon: FiTag },
  { label: "Shopping Cart", icon: FiShoppingCart },
  { label: "Orders", icon: FiShoppingBag },
  { label: "Customers", icon: FiUsers },
  { label: "Settings", icon: FiSettings },
];

const summaryItems = [
  { label: "Total Products", key: "total_products", icon: FiBox, tone: "violet" },
  { label: "Total Orders", key: "total_orders", icon: FiShoppingBag, tone: "blue" },
  { label: "Total Customers", key: "total_customers", icon: FiUsers, tone: "teal" },
  { label: "Total Revenue", key: "total_revenue", icon: FiActivity, tone: "amber" },
];

function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="dashboard-empty-state">
      <span className="dashboard-empty-icon"><Icon aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function SummaryCard({ label, icon: Icon, tone, value, loading }) {
  const hasValue = value !== null && value !== undefined;
  return (
    <article className="dashboard-stat-card">
      <div className={`dashboard-stat-icon ${tone}`}><Icon aria-hidden="true" /></div>
      <p>{label}</p>
      <strong aria-label={`${label}: ${hasValue ? value : "no data"}`}>{loading ? "…" : hasValue ? value : "—"}</strong>
      <span>{hasValue ? "Live store data" : "Data source not connected"}</span>
    </article>
  );
}

function AdminLogin({ checking, connectionError, error, onLogin, onRetry, onBackToStore }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    await onLogin(username, password);
    setSubmitting(false);
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="dashboard-brand-mark">N</span>
        <p className="dashboard-eyebrow">NOVA STORE ADMIN</p>
        <h1>Sign in to your store</h1>
        <p className="admin-login-copy">Use the administrator password configured on the PHP server.</p>
        {checking ? <p className="catalog-message">Checking your session…</p> : connectionError ? (
          <div className="catalog-form-error" role="alert">
            <p>{error}</p>
            <button className="catalog-button secondary" type="button" onClick={onRetry}>Retry connection</button>
          </div>
        ) : (
          <>
            <label className="admin-password-label">Username
              <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
            </label>
            <label className="admin-password-label">Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </label>
            {error && <p className="catalog-form-error" role="alert">{error}</p>}
            <button className="catalog-button primary admin-login-submit" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </>
        )}
        <button className="dashboard-back-link admin-back-link" type="button" onClick={onBackToStore}>Back to storefront</button>
      </form>
    </main>
  );
}

export default function Dashboard({ onBackToStore }) {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState("checking");
  const [authError, setAuthError] = useState("");
  const [authRetry, setAuthRetry] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let current = true;
    getLoginStatus().then((result) => {
      if (current) setAuthStatus(result.authenticated ? "authenticated" : "signed-out");
    }).catch((error) => {
      if (!current) return;
      setAuthError(error.message || "Could not connect to the PHP API.");
      setAuthStatus("connection-error");
    });
    return () => { current = false; };
  }, [authRetry]);

  useEffect(() => {
    if (authStatus !== "authenticated") return undefined;
    let current = true;
    getDashboardStats().then((result) => {
      if (current) setDashboardStats(result.data);
    }).catch((error) => {
      if (current) setStatsError(error.message || "Could not load dashboard statistics.");
    }).finally(() => {
      if (current) setStatsLoading(false);
    });
    return () => { current = false; };
  }, [authStatus]);

  async function handleLogin(username, password) {
    setAuthError("");
    setStatsLoading(true);
    setStatsError("");
    setDashboardStats(null);
    try {
      await login(username, password);
      setAuthStatus("authenticated");
    } catch (error) {
      setAuthError(error.message || "Sign in failed.");
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setAuthStatus("signed-out");
      setActiveSection("Dashboard");
    } catch (error) {
      setAuthError(error.message || "Could not sign out.");
    }
  }

  if (authStatus !== "authenticated") {
    return <AdminLogin
      checking={authStatus === "checking"}
      connectionError={authStatus === "connection-error"}
      error={authError}
      onLogin={handleLogin}
      onRetry={() => { setAuthError(""); setAuthStatus("checking"); setAuthRetry((retry) => retry + 1); }}
      onBackToStore={onBackToStore}
    />;
  }

  function selectSection(label) {
    setActiveSection(label);
    setSidebarOpen(false);
  }

  return (
    <div className={`nova-dashboard${sidebarOpen ? " sidebar-open" : ""}`}>
      <aside className="dashboard-sidebar" aria-label="Store dashboard navigation">
        <button className="dashboard-brand" onClick={onBackToStore} type="button">
          <span className="dashboard-brand-mark">N</span>
          <span>NOVA <small>STORE</small></span>
        </button>

        <p className="dashboard-nav-label">STORE MANAGEMENT</p>
        <nav className="dashboard-nav">
          {navigationItems.map(({ label, icon: Icon }) => (
            <button
              className={activeSection === label ? "active" : ""}
              key={label}
              type="button"
              aria-current={activeSection === label ? "page" : undefined}
              onClick={() => selectSection(label)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-sidebar-note">
            <span className="dashboard-note-icon"><FiLayers aria-hidden="true" /></span>
            <p>Product totals are live. Orders, customers, and sales need their own store records.</p>
          </div>
          <button className="dashboard-back-link" type="button" onClick={onBackToStore}>
            Back to storefront
          </button>
          <button className="dashboard-back-link" type="button" onClick={handleLogout}>
            <FiLogOut aria-hidden="true" /> Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="dashboard-mobile-menu"
            type="button"
            aria-label={sidebarOpen ? "Close dashboard menu" : "Open dashboard menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <label className="dashboard-search">
            <FiSearch aria-hidden="true" />
            <input disabled placeholder="Search products in the Products view" />
          </label>
          <button className="dashboard-notifications" type="button" aria-label="Notifications unavailable" disabled>
            <FiBell aria-hidden="true" />
          </button>
          <div className="dashboard-profile" aria-label="NOVA Store workspace">
            <span className="dashboard-profile-avatar">N</span>
            <span><strong>NOVA Store</strong><small>Store workspace</small></span>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow">STORE OVERVIEW</p>
              <h1>{activeSection === "Dashboard" ? "Good morning, welcome to NOVA Store!" : activeSection}</h1>
              <p className="dashboard-welcome-copy">
                {activeSection === "Dashboard"
                  ? "Product totals are live. Orders and sales will appear when those store records are available."
                  : `The ${activeSection.toLowerCase()} view is ready for your store data.`}
              </p>
            </div>
            <div className="dashboard-period"><FiCalendar aria-hidden="true" /> Overview</div>
          </section>

          {activeSection === "Products" ? <ProductManagement /> : activeSection === "Categories" ? <CategoryManagement /> : activeSection === "Dashboard" ? (
            <>
              {statsError && <p className="catalog-page-error" role="alert">{statsError}</p>}
              <section className="dashboard-summary-grid" aria-label="Store summary">
                {summaryItems.map((item) => <SummaryCard key={item.label} {...item} value={dashboardStats?.[item.key]} loading={statsLoading} />)}
              </section>

              <section className="dashboard-panel-grid">
                <article className="dashboard-panel dashboard-chart-panel">
                  <div className="dashboard-panel-heading">
                    <div><h2>Sales overview</h2><p>Monthly sales and order trends</p></div>
                    <span className="dashboard-panel-pill">No data yet</span>
                  </div>
                  <EmptyState icon={FiActivity} title="Sales data will appear here">
                    Connect an orders API to see real monthly sales. No sample figures are shown.
                  </EmptyState>
                </article>

                <article className="dashboard-panel dashboard-orders-panel">
                  <div className="dashboard-panel-heading">
                    <div><h2>Recent orders</h2><p>Your latest store orders</p></div>
                    <span className="dashboard-panel-pill">No data yet</span>
                  </div>
                  <EmptyState icon={FiShoppingBag} title="No orders to show">
                    Recent orders will appear after order data is connected.
                  </EmptyState>
                </article>
              </section>
            </>
          ) : (
            <section className="dashboard-panel dashboard-section-panel">
              <EmptyState
                icon={navigationItems.find((item) => item.label === activeSection)?.icon || FiLayers}
                title={`${activeSection} data is not connected`}
              >
                This project currently has no product, cart, order, customer, or settings API for this view. Connect the corresponding backend before using it with live store data.
              </EmptyState>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
