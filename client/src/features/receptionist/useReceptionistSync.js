import { useEffect } from "react";
import { getDoctors, getAdmissions } from "../../services/api";

export default function useReceptionistSync({
  setDoctorsList,
  showToast,
  setPendingAdmissions,
  setBedAssignPatient,
  setDischargeData,
}) {
  useEffect(() => {
    let active = true;
    const fetchDoctors = () => {
      getDoctors()
        .then((res) => {
          if (active && Array.isArray(res.data)) {
            setDoctorsList(res.data);
          }
        })
        .catch(() => {
          if (active) showToast("Unable to refresh the doctor list.");
        });
    };

    fetchDoctors();
    window.addEventListener("nexus_doctors_updated", fetchDoctors);
    return () => {
      active = false;
      window.removeEventListener("nexus_doctors_updated", fetchDoctors);
    };
  }, [setDoctorsList, showToast]);

  useEffect(() => {
    let active = true;
    const fetchAdmissionsData = async () => {
      let localOrders = [];
      try {
        const stored = localStorage.getItem("nexus_pending_admissions");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localOrders = parsed;
          }
        }
      } catch {
        showToast(
          "Cached workflow data could not be read. Refresh from the server.",
        );
      }

      try {
        const res = await getAdmissions();
        if (!Array.isArray(res.data))
          throw new Error("Invalid admissions response");
        localOrders = res.data
          .filter((order) => order.status === "Pending Bed Allocation")
          .map((order) => ({
            orderId: order._id ? `ADM-${order._id.slice(-4)}` : "ADM-DB",
            patientName: order.patientName,
            patientId: order.patientId,
            doctorName: order.doctorName,
            ward: order.ward || "Ward 3B",
            orderNotes: order.orderNotes,
            diagnosis: order.diagnosis,
            status: order.status,
            timestamp: new Date(
              order.createdAt || Date.now(),
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            dbId: order._id,
          }));
      } catch {
        if (active)
          showToast(
            "Unable to refresh admission orders. Please check your connection.",
          );
      }

      if (!active) return;
      setPendingAdmissions(localOrders);
      if (!localOrders.length)
        setBedAssignPatient((previous) => ({ ...previous, dbId: undefined }));
      if (localOrders.length > 0) {
        const topOrder = localOrders[0];
        setBedAssignPatient({
          name: topOrder.patientName || "Kamal Perera",
          id: topOrder.patientId || "P-1042",
          doctor: topOrder.doctorName || "Dr. Vance",
          ward: topOrder.ward || "Ward 3B",
          diagnosis:
            topOrder.diagnosis ||
            "Acute bronchitis with mild bronchial irritation",
          dbId: topOrder.dbId,
        });
      }
    };

    fetchAdmissionsData();

    const handleNewAdmission = (e) => {
      const order = e?.detail;
      if (order) {
        showToast(
          `⚡ Inpatient admission request received for ${order.patientName}: "${order.orderNotes || "Admit to Ward 3B"}"!`,
        );
      }
      fetchAdmissionsData();
    };

    window.addEventListener("nexus_admission_ordered", handleNewAdmission);
    window.addEventListener("storage", fetchAdmissionsData);
    const interval = setInterval(fetchAdmissionsData, 4000);

    return () => {
      active = false;
      window.removeEventListener("nexus_admission_ordered", handleNewAdmission);
      window.removeEventListener("storage", fetchAdmissionsData);
      clearInterval(interval);
    };
  }, [showToast, setPendingAdmissions, setBedAssignPatient]);

  useEffect(() => {
    const syncClearance = () => {
      try {
        const storedClearance = localStorage.getItem(
          "nexus_discharge_clearance",
        );
        if (storedClearance) {
          const parsed = JSON.parse(storedClearance);
          if (parsed && parsed.patientName) {
            setDischargeData((prev) => ({
              ...prev,
              patientName: parsed.patientName,
              bedNo: parsed.bedNo || "Bed-02A",
              pid: parsed.pid || "P-1042",
              doctorClearance:
                parsed.doctorClearance || "Cleared by Dr. Robert Vance",
              isDoctorCleared: true,
              currentStatus: "Doctor Cleared - Financial Settlement Ready",
            }));
          }
        }
      } catch {
        showToast(
          "Cached workflow data could not be read. Refresh from the server.",
        );
      }
    };

    syncClearance();

    const handleClearanceApproved = (e) => {
      const data = e?.detail;
      if (data) {
        showToast(
          `⚡ Doctor clearance received for ${data.patientName} (${data.bedNo}): "${data.doctorClearance}"!`,
        );
      }
      syncClearance();
    };

    window.addEventListener(
      "nexus_discharge_approved",
      handleClearanceApproved,
    );
    window.addEventListener("storage", syncClearance);
    return () => {
      window.removeEventListener(
        "nexus_discharge_approved",
        handleClearanceApproved,
      );
      window.removeEventListener("storage", syncClearance);
    };
  }, [showToast, setDischargeData]);
}
