import { useState, useRef, useEffect } from "react";

export default function useDoctorNavigation() {
  const [activeNav, setActiveNav] = useState("PatientQueue");
  const isManualScroll = useRef(false);
  const scrollTimer = useRef(null);
  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  // Auto-switch sidebar active category as user scrolls down the page
  useEffect(() => {
    const sections = [
      { id: "patient-queue-card", nav: "PatientQueue" },
      { id: "ward-rounds-card", nav: "WardRounds" },
      { id: "prescriptions-card", nav: "Prescriptions" },
      { id: "medical-records-card", nav: "MedicalReports" },
    ];

    const handleScroll = () => {
      if (isManualScroll.current) return;

      const scrollPosition = window.scrollY + 220;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveNav(sections[i].nav);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sidebar smooth scrolling when manually clicked
  const scrollToSection = (id, navName) => {
    setActiveNav(navName);
    isManualScroll.current = true;
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -20;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 850);
  };

  return { activeNav, scrollToSection };
}
