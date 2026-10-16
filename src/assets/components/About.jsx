
import { FiArrowRight, FiZap } from "react-icons/fi";

export default function About() {
  return (
    <section className="about-section section-container" id="about">
      <div className="about-icon">
        <FiZap />
      </div>
      <div>
        <span className="section-label">BUILT FOR YOUR NEXT CHAPTER</span>
        <h2>Big ideas deserve a better workspace.</h2>
        <p>
          Plan your work, keep your team in sync, and turn your ideas into
          something real — all in one place.
        </p>
      </div>
      <a href="#get-started" className="about-link">
        Discover Nova <FiArrowRight />
      </a>
    </section>
  );
}