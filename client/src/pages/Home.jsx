import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  const [activeCard, setActiveCard] = useState(2); // default third card highlighted like figma

  const services = [
    {
      id: 0,
      title: "Doctor Consultations",
      subtitle: "Doctor Consultations and OPD",
      description: "Expert specialist appointments and clinical care.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
          <circle cx="20" cy="10" r="2"/>
        </svg>
      )
    },
    {
      id: 1,
      title: "Ward Management",
      subtitle: "Inpatient and Ward Management",
      description: "Dedicated patient observation and comfortable ward care.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16"/>
          <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
          <path d="M2 17h20"/>
          <path d="M6 8v9"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Medical Records",
      subtitle: "Digital Health Records",
      description: "Secure, centralized access to patient health files.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    {
      id: 3,
      title: "24/7 Nursing Care",
      subtitle: "Inpatient Observation",
      description: "Round-the-clock inpatient observation and medical support.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          <path d="M12 5v6"/>
          <path d="M9 8h6"/>
        </svg>
      )
    },
    {
      id: 4,
      title: "Lab Diagnostics",
      subtitle: "Clinical Testing",
      description: "Rapid diagnostic testing and digital reports.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31"/>
          <path d="M14 9.3V2"/>
          <path d="M8.5 2h7"/>
          <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
          <path d="M5.52 16h12.96"/>
        </svg>
      )
    },
    {
      id: 5,
      title: "Pharmacy Services",
      subtitle: "Prescription Dispensing",
      description: "Fast electronic prescriptions and safe dispensing.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
          <path d="m8.5 8.5 7 7"/>
        </svg>
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* HERO SECTION MATCHING FIGMA DESIGN */}
      <section className="hero-banner-section">
        <div className="hero-banner-container">
          <img
            src="/home-page.jpeg"
            alt="Doctors team and medical care"
            className="hero-bg-img"
            onError={(e) => {
              e.currentTarget.src = "/home page .jpeg";
            }}
          />

          {/* Logo overlay on the top left */}
          <div className="hero-logo-box">
            <img
              src="/health-logo.png"
              alt="NexusHealth Logo"
              className="hero-logo-img"
              onError={(e) => {
                e.currentTarget.src = "/health logo.png";
              }}
            />
          </div>

          {/* Right-aligned Hero Content */}
          <div className="hero-content-right">
            <h1 className="hero-headline">
              Your Health is<br />Our Mission
            </h1>
            <p className="hero-tagline">
              Dedicated to advanced care and patient well-being.
            </p>
            <div className="hero-action">
              <Link to="/login" className="hero-signin-btn">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about-us" className="about-section">
        <div className="container">
          <h2 className="section-title">About Us</h2>
          <div className="about-text-wrapper">
            <p className="about-paragraph">
              &ldquo;At NexusHealth, we are dedicated to transforming healthcare delivery
              through advanced medical technology and compassionate patient care. Our platform
              connects certified medical specialists, dedicated nursing teams, and patients
              within a secure, integrated ecosystem, ensuring seamless clinical workflows, fast
              appointments, and reliable inpatient management around the clock.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* OUR SERVICES SECTION */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>

          {/* 6 Rectangles Grid */}
          <div className="services-grid">
            {services.map((service) => (
              <div
                key={service.id}
                className={`service-card ${activeCard === service.id ? "active-card" : ""}`}
                onMouseEnter={() => setActiveCard(service.id)}
              >
                <div className="service-card-header">
                  <div className="service-card-icon">{service.icon}</div>
                  <h3 className="service-card-title">{service.title}</h3>
                </div>
                <p className="service-card-desc">{service.description}</p>
                <div className="service-card-footer">
                  <span className="service-badge">{service.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER MATCHING FIGMA */}
      <section className="stats-ribbon">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Emergency Care</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Specialist Doctors</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Patients Served</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Home;
