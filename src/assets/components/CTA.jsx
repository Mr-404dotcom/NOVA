
import { FiArrowRight } from "react-icons/fi";

export default function CTA() {
  return (
    <section className="cta-section section-container" id="get-started">
      <div className="cta-decoration" />
      <div>
        <span className="cta-label">YOUR NEXT CHAPTER STARTS HERE</span>
        <h2>Ready to build something amazing?</h2>
        <p>Take the first step. Your next big idea starts today.</p>
      </div>
      <a
        className="button button-white"
        href="mailto:hello@example.com?subject=Getting%20started%20with%20Nova"
      >
        Let's Get Started <FiArrowRight />
      </a>
    </section>
  );
}
