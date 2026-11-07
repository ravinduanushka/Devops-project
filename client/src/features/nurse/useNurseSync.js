import { useEffect } from "react";
import { getPatients, getPrescriptions } from "../../services/api";
import {
  emptyPatient,
  mapNursePatients,
  selectPrescription,
  medicationSchedule,
} from "./nurseWorkflows";

export default function useNurseSync({
  patientId,
  syncVersion,
  setInpatientList,
  setActivePatient,
  setActiveRxRecord,
  setMedSchedule,
  showToast,
}) {
  useEffect(() => {
    let active = true,
      refreshing = false;
    const refresh = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const response = await getPatients();
        if (!active) return;
        if (!Array.isArray(response.data))
          throw new Error("Invalid patient response");
        const patients = mapNursePatients(response.data);
        setInpatientList(patients);
        setActivePatient(
          (previous) =>
            patients.find(
              (patient) => patient.pid && patient.pid === previous.pid,
            ) || emptyPatient(),
        );
      } catch {
        if (active)
          showToast(
            "Unable to refresh the ward list. Please check your connection.",
          );
      } finally {
        refreshing = false;
      }
    };
    refresh();
    const interval = setInterval(refresh, 4000);
    for (const event of ["nexus_bed_allocated", "nexus_bed_freed", "storage"])
      window.addEventListener(event, refresh);
    return () => {
      active = false;
      clearInterval(interval);
      for (const event of ["nexus_bed_allocated", "nexus_bed_freed", "storage"])
        window.removeEventListener(event, refresh);
    };
  }, [setInpatientList, setActivePatient, showToast]);

  useEffect(() => {
    let active = true,
      refreshing = false;
    const refresh = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const response = patientId ? await getPrescriptions() : { data: [] };
        if (!active) return;
        if (!Array.isArray(response.data))
          throw new Error("Invalid prescription response");
        const record = selectPrescription(response.data, patientId);
        setActiveRxRecord(
          record
            ? {
                ...record,
                dbId: record._id,
                orderId: `RX-${record._id.slice(-4)}`,
              }
            : null,
        );
        setMedSchedule(medicationSchedule(record));
      } catch {
        if (active) {
          setActiveRxRecord(null);
          setMedSchedule([]);
          showToast(
            "Unable to load this patient’s prescription. Refresh before administering medication.",
          );
        }
      } finally {
        refreshing = false;
      }
    };
    refresh();
    const interval = setInterval(refresh, 4000);
    for (const event of ["nexus_prescription_issued", "storage"])
      window.addEventListener(event, refresh);
    return () => {
      active = false;
      clearInterval(interval);
      for (const event of ["nexus_prescription_issued", "storage"])
        window.removeEventListener(event, refresh);
    };
  }, [patientId, syncVersion, setActiveRxRecord, setMedSchedule, showToast]);
}
