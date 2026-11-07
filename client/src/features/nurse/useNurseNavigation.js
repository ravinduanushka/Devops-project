import { useState, useRef, useEffect } from "react";
export default function useNurseNavigation() {
  const [activeNav, setActiveNav] = useState("WardMonitoring");
  const isManualScroll = useRef(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Auto-switch sidebar active category as user scrolls down the page
  useEffect(() => {
    const sections = [
      { id: "ward-monitoring-card", nav: "WardMonitoring" },
      { id: "vital-recording-card", nav: "VitalRecording" },
      { id: "med-administration-card", nav: "MedAdministration" },
      { id: "shift-handover-card", nav: "ShiftHandover" },
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
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 850);
  };

  return { activeNav, scrollToSection };
}
