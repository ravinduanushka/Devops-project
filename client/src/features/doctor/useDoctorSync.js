import { mapDoctorAppointments, mapWardPatients } from "./doctorRecords";
import { useEffect } from "react";
import { getPatients, getAppointments } from "../../services/api";

// Keeps polling and legacy cross-tab event cleanup out of the page component.
export default function useDoctorSync({
  setQueueList,
  setWardPatients,
  onError,
}) {
  // Load backend database appointments & sync with Receptionist token updates in real-time
  useEffect(() => {
    let active = true;
    let refreshing = false;
    const fetchDbData = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const [patientsRes, apptsRes] = await Promise.allSettled([
          getPatients(),
          getAppointments(),
        ]);

        if (!active) return;
        const failures = [patientsRes, apptsRes].filter(
          (result) => result.status === "rejected",
        );
        onError(
          failures.length
            ? "Some doctor records could not be refreshed. Please check your connection."
            : "",
        );

        if (
          apptsRes.status === "fulfilled" &&
          Array.isArray(apptsRes.value.data)
        ) {
          const patients =
            patientsRes.status === "fulfilled" ? patientsRes.value.data : [];
          setQueueList(mapDoctorAppointments(apptsRes.value.data, patients));
        }
        if (
          patientsRes.status === "fulfilled" &&
          Array.isArray(patientsRes.value.data)
        ) {
          setWardPatients(mapWardPatients(patientsRes.value.data));
        }
      } catch (err) {
        if (active)
          onError(
            err.response?.data?.error || "Unable to refresh doctor records.",
          );
      } finally {
        refreshing = false;
      }
    };

    fetchDbData();

    // Event listener for instant token dispatch from Receptionist Portal
    const handleQueueUpdate = (event) => {
      let activeTok = event?.detail;
      if (!activeTok) {
        try {
          activeTok = JSON.parse(localStorage.getItem("nexus_active_token"));
        } catch {
          activeTok = null;
        }
      }

      if (activeTok && activeTok.token) {
        setQueueList((prev) => {
          const newEntry = {
            token: activeTok.token,
            patientName: activeTok.patientName || "Kamal Perera",
            age: activeTok.age || "",
            patientId: activeTok.patientId || "",
            dbId: activeTok.dbId || "",
            estimatedTime: activeTok.estimatedTime || "10:15 AM",
            status: activeTok.status || "Waiting",
            statusColor: "status-mint",
          };
          return [
            newEntry,
            ...prev.filter((item) => item.token !== newEntry.token),
          ];
        });
      }
    };

    const handleBedAllocated = (e) => {
      let allocated = e?.detail;
      if (!allocated) {
        try {
          allocated = JSON.parse(localStorage.getItem("nexus_allocated_bed"));
        } catch {
          allocated = null;
        }
      }
      if (allocated && allocated.patientName) {
        setWardPatients((prev) => {
          const entry = {
            id: Date.now(),
            bedNo: allocated.bedNo || "Bed-02A",
            patientName: allocated.patientName,
            admissionDate: "Oct 09, 2026",
            condition: "Stable",
            conditionColor: "cond-stable",
            nurseSummary:
              allocated.diagnosis ||
              "Admitted under Ward 3B for continuous clinical care",
            actionType: "discharge",
            dbId: allocated.dbId || "",
            patientId: allocated.pid || "",
          };
          return [
            entry,
            ...prev.filter(
              (p) =>
                p.bedNo !== entry.bedNo && p.patientName !== entry.patientName,
            ),
          ];
        });
      }
    };

    const handleBedFreed = (e) => {
      const data = e?.detail;
      const freedBed = data?.bedNo || "Bed-02A";
      setWardPatients((prev) =>
        prev.map((p) =>
          p.bedNo === freedBed
            ? {
                ...p,
                condition: "Discharged",
                conditionColor: "cond-discharged",
              }
            : p,
        ),
      );
    };

    window.addEventListener("nexus_queue_updated", handleQueueUpdate);
    window.addEventListener("nexus_bed_allocated", handleBedAllocated);
    window.addEventListener("nexus_bed_freed", handleBedFreed);
    window.addEventListener("storage", handleQueueUpdate);
    window.addEventListener("storage", handleBedAllocated);
    window.addEventListener("storage", handleBedFreed);
    const interval = setInterval(fetchDbData, 3500);

    return () => {
      active = false;
      window.removeEventListener("nexus_queue_updated", handleQueueUpdate);
      window.removeEventListener("nexus_bed_allocated", handleBedAllocated);
      window.removeEventListener("nexus_bed_freed", handleBedFreed);
      window.removeEventListener("storage", handleQueueUpdate);
      window.removeEventListener("storage", handleBedAllocated);
      window.removeEventListener("storage", handleBedFreed);
      clearInterval(interval);
    };
  }, [setQueueList, setWardPatients, onError]);
}
