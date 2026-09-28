import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

function Home() {
  const [activeCard, setActiveCard] = useState(2); // default third card highlighted like figma

  const services = [
    {
      id: 0,
      title: "Doctor Consultations and OPD",
      description: "Expert specialist appointments and clinical care. Doctor Consultations & OPD"
    },
    {
      id: 1,
      title: "Inpatient and Ward Management",
      description: "Dedicated patient observation and comfortable ward care."
    },
    {
      id: 2,
      title: "Medical Records",
      description: "Secure, centralized access to patient health files."
    },
    {
      id: 3,
      title: "24/7 Nursing Care",
      description: "Round-the-clock inpatient observation and medical support."
    },
    {
      id: 4,
      title: "Lab Diagnostics",
      description: "Rapid diagnostic testing and digital reports."
    },
    {
      id: 5,
      title: "Pharmacy Services",
      description: "Fast electronic prescriptions and safe dispensing."
    }
  ];

  return (
    <div className="page-wrapper">
      {/* NO NAVBAR/HEADER - Starts immediately with the Hero banner as requested */}

      {/* HERO SECTION MATCHING FIGMA DESIGN (Image 1) */}
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

          {/* Logo overlay on top left */}
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

      {/* OUR SERVICES SECTION (Image 2 - 6 clean gray rectangles without icons or pills) */}
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
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-desc">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER MATCHING FIGMA (Image 3) */}
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

      {/* FOOTER MATCHING FIGMA (Image 3 & 4 with Clinic Us and Support + Social plugins) */}
      <Footer />
    </div>
  );
}

export default Home;
