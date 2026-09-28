import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Patient",
    doctorDetails: {
      specialization: "",
      roomNo: ""
    },
    nurseDetails: {
      assignedWard: "",
      shiftTime: "Morning"
    },
    receptionistDetails: {
      deskNumber: ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      };

      if (formData.role === "Doctor") {
        payload.doctorDetails = formData.doctorDetails;
      } else if (formData.role === "Nurse") {
        payload.nurseDetails = formData.nurseDetails;
      } else if (formData.role === "Receptionist") {
        payload.receptionistDetails = formData.receptionistDetails;
      }

      await registerUser(payload);
      setSuccessMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="auth-page-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <img
              src="/health-logo.png"
              alt="NexusHealth Logo"
              className="auth-logo"
              onError={(e) => {
                e.currentTarget.src = "/health logo.png";
              }}
            />
            <h2 className="auth-title">Create an Account</h2>
            <p className="auth-subtitle">Join NexusHealth healthcare network</p>
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
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name *</label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Dr. Sarah Jenkins / John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-role">Role *</label>
                <select
                  id="reg-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-email">Email Address *</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="user@nexushealth.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number *</label>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 091-9118207 / +94..."
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Dynamic Role-specific fields */}
            {formData.role === "Doctor" && (
              <div className="role-specific-box">
                <h4 className="role-box-title">Doctor Credentials</h4>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      name="doctorDetails.specialization"
                      placeholder="e.g. Cardiology, Neurology"
                      value={formData.doctorDetails.specialization}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Consultation Room No.</label>
                    <input
                      type="text"
                      name="doctorDetails.roomNo"
                      placeholder="e.g. Room 302"
                      value={formData.doctorDetails.roomNo}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === "Nurse" && (
              <div className="role-specific-box">
                <h4 className="role-box-title">Nursing Assignment</h4>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Assigned Ward</label>
                    <input
                      type="text"
                      name="nurseDetails.assignedWard"
                      placeholder="e.g. Ward B - ICU"
                      value={formData.nurseDetails.assignedWard}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Shift Time</label>
                    <select
                      name="nurseDetails.shiftTime"
                      value={formData.nurseDetails.shiftTime}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.role === "Receptionist" && (
              <div className="role-specific-box">
                <h4 className="role-box-title">Desk Details</h4>
                <div className="form-group">
                  <label>Desk / Counter Number</label>
                  <input
                    type="text"
                    name="receptionistDetails.deskNumber"
                    placeholder="e.g. Front Desk #1"
                    value={formData.receptionistDetails.deskNumber}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-pass">Password * (min 6 characters)</label>
                <input
                  id="reg-pass"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password *</label>
                <input
                  id="reg-confirm"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary auth-submit-btn"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer-links">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="accent-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;