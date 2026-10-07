import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });

      const userData = response.data;
      localStorage.setItem("nexus_user", JSON.stringify(userData));
      setSuccessMessage(`Welcome back, ${userData.name}!`);

      setTimeout(() => {
        if (userData.role === "Doctor") {
          navigate("/doctor");
        } else if (userData.role === "Admin") {
          navigate("/admin");
        } else if (userData.role === "Patient") {
          navigate("/patient");
        } else {
          navigate("/");
        }
      }, 700);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-login-page">
      {/* LEFT PANE - WHITE BACKGROUND */}
      <div className="login-left-pane">
        {/* Top-left Brand Logo */}
        <Link to="/" className="login-logo-link" title="Back to Home">
          <img
            src="/health-logo.png"
            alt="NexusHealth Logo"
            className="login-top-logo"
            onError={(e) => {
              e.currentTarget.src = "/health logo.png";
            }}
          />
        </Link>

        {/* Center Form Section */}
        <div className="login-form-center">
          <h1 className="login-heading">Login to Your Account</h1>
          <p className="login-social-sub">Login using social networks</p>

          {/* Social Network Circles */}
          <div className="login-social-circles">
            {/* Facebook circle */}
            <button
              type="button"
              className="social-circle fb-circle"
              aria-label="Login with Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </button>

            {/* Google+ circle */}
            <button
              type="button"
              className="social-circle gp-circle"
              aria-label="Login with Google"
            >
              <span className="gp-text">G+</span>
            </button>

            {/* LinkedIn circle */}
            <button
              type="button"
              className="social-circle in-circle"
              aria-label="Login with LinkedIn"
            >
              <span className="in-text">in</span>
            </button>
          </div>

          {/* OR Divider */}
          <div className="login-divider">
            <span className="divider-line"></span>
            <span className="divider-text">OR</span>
            <span className="divider-line"></span>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="alert-box alert-error" role="alert" style={{ marginBottom: "14px" }}>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert-box alert-success" role="alert" style={{ marginBottom: "14px" }}>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actual Login Form */}
          <form onSubmit={handleSubmit} className="login-actual-form">
            <div className="input-pill-wrapper">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-pill"
              />
            </div>

            <div className="input-pill-wrapper password-pill-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-pill"
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="login-btn-center">
              <button
                type="submit"
                disabled={loading}
                className="login-submit-pill"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT PANE - TEAL BACKGROUND (#3bab99) */}
      <div className="login-right-pane">
        <Link to="/" className="login-back-home-link" title="Back to Home">
          Back to Home
        </Link>
        <div className="login-right-content">
          <h2 className="join-heading">Join NexusHealth</h2>
          <p className="join-description">
            Create an account for patient care<br />
            or<br />
            hospital staff access.
          </p>
          <div className="join-action">
            <Link to="/register" className="join-signup-btn">
              sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;