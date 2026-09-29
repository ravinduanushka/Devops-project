import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

// Animated counter component for the stats ribbon
function AnimatedCounter({ end, suffix = "", prefix = "", decimals = 0, isVisible, duration = 1800 }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic curve for smooth middle-speed deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * end;
      setVal(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setVal(end);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, end, duration]);

  const formatted = decimals > 0
    ? val.toFixed(decimals)
    : Math.floor(val).toLocaleString();

  return <>{prefix}{formatted}{suffix}</>;
}

function Home() {
  const [activeCard, setActiveCard] = useState(2); // default third card highlighted
  const [servicesVisible, setServicesVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  const servicesRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const servicesEl = servicesRef.current;
    const statsEl = statsRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === servicesEl && entry.isIntersecting) {
            setServicesVisible(true);
          }
          if (entry.target === statsEl && entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (servicesEl) observer.observe(servicesEl);
    if (statsEl) observer.observe(statsEl);

    return () => {
      if (servicesEl) observer.unobserve(servicesEl);
      if (statsEl) observer.unobserve(statsEl);
    };
  }, []);

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
      {/* NO NAVBAR/HEADER - Starts directly with Hero banner as requested */}

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

          {/* Logo overlay in the clean white space above the doctor's head */}
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

      {/* OUR SERVICES SECTION (White BG + Outline borders #36727c + Scroll pop-up transition) */}
      <section id="services" className="services-section" ref={servicesRef}>
        <div className="container">
          <h2 className="section-title">Our Services</h2>

          {/* 6 Rectangles Grid with Scroll Pop-up Transition */}
          <div className={`services-grid ${servicesVisible ? "visible" : ""}`}>
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

      {/* STATS BANNER WITH COUNT-UP ANIMATION FROM 0 */}
      <section className="stats-ribbon" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter
                  end={24}
                  suffix="/7"
                  isVisible={statsVisible}
                  duration={1800}
                />
              </div>
              <div className="stat-label">Emergency Care</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter
                  end={50}
                  suffix="+"
                  isVisible={statsVisible}
                  duration={1800}
                />
              </div>
              <div className="stat-label">Specialist Doctors</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter
                  end={10000}
                  suffix="+"
                  isVisible={statsVisible}
                  duration={1800}
                />
              </div>
              <div className="stat-label">Patients Served</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter
                  end={99.9}
                  decimals={1}
                  suffix="%"
                  isVisible={statsVisible}
                  duration={1800}
                />
              </div>
              <div className="stat-label">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHITE GAP BETWEEN STATS BANNER AND FOOTER - FIGMA IMAGE 4 STYLE */}
      <div className="stats-footer-gap" aria-hidden="true"></div>

      {/* FOOTER MATCHING FIGMA */}
      <Footer />
    </div>
  );
}

export default Home;
