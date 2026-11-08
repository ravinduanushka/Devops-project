import { useState, useRef, useEffect } from "react";

export default function useReceptionistNavigation() {
  const [activeNav, setActiveNav] = useState("PatientRegistration");
  const isManualScroll = useRef(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Sidebar and workflow smooth scrolling
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

  // Auto-switch sidebar active category as user scrolls down the page
  useEffect(() => {
    const sections = [
      { id: "patient-registration-card", nav: "PatientRegistration" },
      { id: "token-generation-card", nav: "TokenGeneration" },
      { id: "bed-allocation-card", nav: "BedAllocation" },
      { id: "discharge-billing-card", nav: "Discharge&BillingClearance" },
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

  return { activeNav, scrollToSection };
}
