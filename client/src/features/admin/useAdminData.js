import { useCallback, useEffect, useRef, useState } from "react";
import { getPatients, getAppointments, checkHealth } from "../../services/api";
import { fetchDashboardData } from "./adminWorkflows";

export default function useAdminData(setNotification) {
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [serverTimestamp, setServerTimestamp] = useState("");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const active = useRef(false);
  const generation = useRef(0);
  const loadDashboardData = useCallback(() => {
    const request = ++generation.current;
    if (!active.current) return Promise.resolve();
    return fetchDashboardData({ getPatients, getAppointments })
      .then((result) => {
        // Only the newest request may update the current dashboard.
        if (!active.current || request !== generation.current) return;
        if (result.data.patients) setPatients(result.data.patients);
        if (result.data.appointments) setAppointments(result.data.appointments);
        if (result.errors.length)
          setNotification({ type: "error", message: result.errors.join(" ") });
      })
      .catch(() => {
        if (active.current && request === generation.current) {
          setNotification({
            type: "error",
            message: "Failed to load dashboard data. Please try again.",
          });
        }
      })
      .finally(() => {
        if (active.current && request === generation.current)
          setLoadingData(false);
      });
  }, [setNotification]);

  const refreshDashboardData = useCallback(() => {
    setLoadingData(true);
    return loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    active.current = true;
    let cancelled = false;
    checkHealth()
      .then(({ data }) => {
        if (cancelled) return;
        setServerStatus(data?.status === "UP" ? "ONLINE (UP)" : "UNKNOWN");
        if (data?.status === "UP")
          setServerTimestamp(
            new Date(data.timestamp || Date.now()).toLocaleTimeString(),
          );
      })
      .catch(() => {
        if (!cancelled) setServerStatus("OFFLINE / DISCONNECTED");
      });
    loadDashboardData();
    return () => {
      cancelled = true;
      active.current = false;
    };
  }, [loadDashboardData]);
  return {
    serverStatus,
    serverTimestamp,
    patients,
    appointments,
    loadingData,
    loadDashboardData: refreshDashboardData,
  };
}
