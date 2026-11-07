import { useCallback, useEffect, useRef, useState } from "react";

export default function useNurseNotice() {
  const [toastMessage, setToastMessage] = useState("");
  const timer = useRef(null);
  const showToast = useCallback((message) => {
    clearTimeout(timer.current);
    setToastMessage(message);
    timer.current = setTimeout(() => setToastMessage(""), 4500);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { toastMessage, showToast };
}
