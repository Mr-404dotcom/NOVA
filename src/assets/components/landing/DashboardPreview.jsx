
import {
  FiBell,
  FiCheck,
  FiCode,
  FiGrid,
  FiLayers,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

export default function DashboardPreview() {
  const stats = [
    { label: "Total Projects", value: "12", change: "+12%" },
    { label: "Active Tasks", value: "08", change: "+8%" },
    { label: "Completed", value: "24", change: "+24%" },
  ];

  const activity = [
    { icon: <FiLayers />, title: "New project created", time: "2 min ago" },
    { icon: <FiCheck />, title: "Task completed", time: "15 min ago" },
    { icon: <FiUsers />, title: "Team member joined", time: "1 hour ago" },
  ];

  return (
    <div className="dashboard-scene">
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />

      <div className="floating-code">
        <FiCode />
      </div>

      <div className="dashboard">
        <aside className="dashboard-sidebar">
          <div className="mini-brand">
            <span className="brand-icon">N</span> Nova
          </div>

          <div className="side-item active">
            <FiGrid /> Dashboard
          </div>
          <div className="side-item">
            <FiLayers /> Projects
          </div>
          <div className="side-item">
            <FiCheck /> Tasks
          </div>
          <div className="side-item">
            <FiUsers /> Team
          </div>
        </aside>

        <div className="dashboard-content">
          <div className="dashboard-topbar">
            <span className="search-placeholder">⌕ Search anything...</span>
            <FiBell />
            <div className="avatar">J</div>
          </div>

          <div className="dashboard-heading">
            <div>
              <h3>Good morning, Justine!</h3>
              <p>Here's what's happening with your projects.</p>
            </div>
            <span className="online-dot" />
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>
                  <FiTrendingUp /> {stat.change}
                </small>
              </div>
            ))}
          </div>

          <div className="dashboard-lower">
            <div className="chart-card">
              <div className="card-heading">
                <strong>Project Growth</strong>
                <span>Last 6 months</span>
              </div>

              <div className="chart">
                <div className="chart-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <svg
                  viewBox="0 0 320 130"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Illustrative upward project growth chart"
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6558ff" stopOpacity=".22" />
                      <stop offset="100%" stopColor="#6558ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 110 C25 100 25 78 55 85 S85 45 112 63 S145 83 175 48 S215 60 242 25 S285 40 320 5 L320 130 L0 130 Z"
                    fill="url(#chartFill)"
                  />
                  <path
                    d="M0 110 C25 100 25 78 55 85 S85 45 112 63 S145 83 175 48 S215 60 242 25 S285 40 320 5"
                    fill="none"
                    stroke="#6558ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="chart-months">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>

            <div className="activity-card">
              <strong>Recent Activity</strong>
              {activity.map((item) => (
                <div className="activity-item" key={item.title}>
                  <div className="activity-icon">{item.icon}</div>
                  <div>
                    <p>{item.title}</p>
                    <small>{item.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
