import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("nexus_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("nexus_user");
    setUser(null);
    navigate("/");
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <img
            src="/health-logo.png"
            alt="NexusHealth Logo"
            className="navbar-logo"
            onError={(e) => {
              e.currentTarget.src = "/health logo.png";
            }}
          />
          <span className="navbar-brand-name">Nexus<span className="brand-accent">Health</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <button
            type="button"
            className="nav-link-btn"
            onClick={() => scrollToSection("about-us")}
          >
            About Us
          </button>
          <button
            type="button"
            className="nav-link-btn"
            onClick={() => scrollToSection("services")}
          >
            Our Services
          </button>
          <Link
            to="/doctor"
            className="nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            Doctor
          </Link>
          <Link
            to="/patient"
            className="nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            Patient
          </Link>
          <Link
            to="/nurse"
            className="nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            Nurse
          </Link>
          <Link
            to="/admin"
            className="nav-item admin-badge-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Admin Panel
          </Link>

          <div className="nav-auth-group">
            {user ? (
              <div className="user-logged-box">
                <span className="user-greeting">
                  Hi, <strong>{user.name}</strong> ({user.role})
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-btn nav-btn-outline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-btn nav-btn-signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="nav-btn nav-btn-register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
