import { useState } from "react";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";

export default function Navbar({ onOpenDashboard }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <a href="#home" className="brand" onClick={closeMenu}>
        <span className="brand-icon">N</span>
        <span>Nova</span>
      </a>

      <button
        className="mobile-menu"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      <nav className={menuOpen ? "nav-links open" : "nav-links"}>
        {["Home", "Features", "About", "Contact"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={closeMenu}
          >
            {item}
          </a>
        ))}
      </nav>

      <a
        className="nav-cta"
        href="#dashboard"
        onClick={(event) => {
          event.preventDefault();
          closeMenu();
          onOpenDashboard?.();
        }}
      >
        Get Started <FiArrowRight />
      </a>
    </header>
  );
}
