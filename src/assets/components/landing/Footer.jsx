
import { useState } from "react";
import {
  FiArrowRight,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
} from "react-icons/fi";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubscribe(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

    try {
      const response = await fetch(`${apiBaseUrl}/newsletter.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "We couldn't save your subscription. Please try again.");
      }

      setMessage(result.message || "Thanks for subscribing.");
      setEmail("");
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Could not reach the subscription service. Check that the PHP API is running and try again."
          : error instanceof Error
            ? error.message
            : "Could not reach the subscription service. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
            <button type="submit" aria-label="Subscribe" disabled={isSubmitting}>
              {isSubmitting ? "…" : <FiArrowRight />}
            </button>
          </form>
          {message && <small className="form-message" role="status" aria-live="polite">{message}</small>}
        </div>
      </div>

      <div className="footer-bottom section-container">
        <span>© {new Date().getFullYear()} Nova. All rights reserved.</span>
        <a href="#home">Back to top ↑</a>
      </div>
    </footer>
  );
}
