
import {
  FiArrowUpRight,
  FiLayers,
  FiShield,
  FiUsers,
  FiZap,
} from "react-icons/fi";

export default function Features() {
  const features = [
    {
      icon: <FiZap />,
      color: "purple",
      title: "Fast & Reliable",
      description:
        "Enjoy a fast, smooth experience designed to keep your workflow moving.",
    },
    {
      icon: <FiShield />,
      color: "green",
      title: "Secure by Design",
      description:
        "Keep your projects organized with security and privacy in mind.",
    },
    {
      icon: <FiUsers />,
      color: "blue",
      title: "Collaborate Easily",
      description:
        "Bring your team together and make working on projects effortless.",
    },
    {
      icon: <FiLayers />,
      color: "pink",
      title: "Modern & Flexible",
      description:
        "A clean, intuitive workspace that adapts to the way you work.",
    },
  ];

  return (
    <section className="features-section section-container" id="features">
      <div className="section-heading">
        <span className="section-label">OUR FEATURES</span>
        <h2>
          Everything You Need to Build
          <br />
          Your Next <span className="gradient-text">Big Thing.</span>
        </h2>
        <p>
          Powerful tools designed to help you work smarter, move faster, and
          achieve more.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className={`feature-icon ${feature.color}`}>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <a href="#get-started" aria-label={`Learn about ${feature.title}`}>
              <FiArrowUpRight />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
