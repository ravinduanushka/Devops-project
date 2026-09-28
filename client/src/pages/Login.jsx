import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
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
      setSuccessMessage(`Welcome back, ${userData.name}! Redirecting...`);

      setTimeout(() => {
        if (userData.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1000);
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
    <div className="page-wrapper">
      <Navbar />

      <main className="auth-page-container">
        <div className="auth-card">
          <div className="auth-header">
            <img
              src="/health-logo.png"
              alt="NexusHealth Logo"
              className="auth-logo"
              onError={(e) => {
                e.currentTarget.src = "/health logo.png";
              }}
            />
            <h2 className="auth-title">Welcome to NexusHealth</h2>
            <p className="auth-subtitle">Sign in to access your healthcare portal</p>
          </div>

          {errorMessage && (
            <div className="alert-box alert-error" role="alert">
              <span className="alert-icon">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert-box alert-success" role="alert">
              <span className="alert-icon">✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="name@nexushealth.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary auth-submit-btn"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer-links">
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="accent-link">
                Register here
              </Link>
            </p>
            <p className="admin-quick-note">
              Are you an administrator? Sign in above to manage staff and registrations.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;