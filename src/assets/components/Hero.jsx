import { FiArrowRight, FiPlay } from "react-icons/fi";
import DashboardPreview from "./DashboardPreview.jsx";

export default function Hero() {
  return (
    <section className="hero section-container" id="home">
      <div className="hero-content">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          BUILD · MANAGE · GROW
        </span>

        <h1>
          Your Ideas,
          <br />
          Built for <span className="gradient-text">Tomorrow.</span>
        </h1>

        <p className="hero-description">
          Nova is a modern platform that helps you build better projects with
          ease. Focus on what matters — we'll handle the rest.
        </p>

        <div className="hero-actions">
          <a className="button button-primary" href="#get-started">
            Get Started Free <FiArrowRight />
          </a>
          <a className="button button-ghost" href="#features">
            <span className="play-icon">
              <FiPlay />
            </span>
            Explore Features
          </a>
        </div>

        <div className="social-proof">
          <div className="avatar-stack">
            <span>J</span>
            <span>A</span>
            <span>M</span>
            <span>K</span>
          </div>
          <div>
            <p>Built for people with big ideas</p>
            <div className="rating">
              ★★★★★ <span>Made for creators</span>
            </div>
          </div>
        </div>
      </div>

      <DashboardPreview />
    </section>
  );
}
