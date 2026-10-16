
import { useState } from "react";
import {
  FiArrowRight,
  FiFacebook,
  FiGithub,
  FiInstagram,
  FiLinkedin,
} from "react-icons/fi";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubscribe(event) {
    event.preventDefault();

    if (!email.trim()) return;

    setMessage("Thanks! Connect a backend to save newsletter subscriptions.");
  }

  return (
    <footer className="footer" id="contact">
      <div className="footer-main section-container">
        <div className="footer-brand">
          <a href="#home" className="brand">
            <span className="brand-icon">N</span>
            <span>Nova</span>
          </a>
          <p>Build better. Create more. Go further.</p>
          <nav className="footer-social-links" aria-label="Social media">
            <a
              href="https://github.com"
              className="social-link"
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer"
            >
              <FiGithub />
            </a>
            <a
              href="https://facebook.com"
              className="social-link"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <FiFacebook />
            </a>
            <a
              href="https://instagram.com"
              className="social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <FiInstagram />
            </a>
            <a
              href="https://linkedin.com"
              className="social-link"
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
            >
              <FiLinkedin />
            </a>
          </nav>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <a href="#features">Features</a>
          <a href="#about">About us</a>
          <a href="#get-started">Get started</a>
        </div>

        <div className="footer-column">
          <h4>Resources</h4>
          <a href="#features">Our tools</a>
          <a href="#contact">Contact</a>
          <a href="mailto:hello@example.com">Support</a>
        </div>

        <div className="newsletter">
          <h4>Stay in the loop</h4>
          <p>Get updates and ideas delivered to your inbox.</p>
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              placeholder="Enter your email"
              aria-label="Your email address"
              required
            />
            <button type="submit" aria-label="Subscribe">
              <FiArrowRight />
            </button>
          </form>
          {message && <small className="form-message">{message}</small>}
        </div>
      </div>

      <div className="footer-bottom section-container">
        <span>© {new Date().getFullYear()} Nova. All rights reserved.</span>
        <a href="#home">Back to top ↑</a>
      </div>
    </footer>
  );
}
