import { useCallback, useEffect, useRef, useState } from "react";

export default function useDoctorNotice() {
  const [toastMessage, setToastMessage] = useState("");
  const timer = useRef(null);
  const showToast = useCallback((message) => {
    clearTimeout(timer.current);
    setToastMessage(message);
    timer.current = setTimeout(() => setToastMessage(""), 4000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { toastMessage, showToast };
}
