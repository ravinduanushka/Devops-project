export const emptyPatient = () => ({
  bedNo: "",
  patientName: "",
  pid: "",
  age: "",
  gender: "",
  bloodGroup: "",
  allergy: "",
  admissionDate: "",
  condition: "",
  conditionColor: "",
  attendingPhysician: "",
});

export function mapNursePatients(patients) {
  return patients
    .filter((patient) => patient.status === "Admitted")
    .map((patient) => ({
      ...emptyPatient(),
      dbId: patient._id,
      pid: patient.patientId || "",
      patientName: patient.name,
      bedNo: patient.wardNumber?.split("/").at(-1).trim() || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      allergy: patient.allergies || "",
      admissionDate: patient.admittedAt
        ? new Date(patient.admittedAt).toLocaleDateString()
        : "",
      condition: "Stable",
      conditionColor: "nurse-cond-stable",
      attendingPhysician:
        typeof patient.assignedDoctor === "object"
          ? patient.assignedDoctor?.name || ""
          : patient.assignedDoctor || "",
    }));
}

export function selectPrescription(records, patientId) {
  if (!patientId) return null;
  return (
    records
      .filter((record) => record.patientId === patientId)
      .sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      )[0] || null
  );
}

export function medicationSchedule(prescription) {
  return (prescription?.medications || []).map((medication, index) => ({
    id: medication._id,
    scheduledTime: `${index + 1})`,
    medName: medication.name,
    dosage: medication.dosage || "",
    instructions: medication.instructions || medication.frequency || "",
    nurseVerification: medication.administeredAt
      ? `Verified by Nurse ${medication.administeredByName || ""}`
      : "Pending Verification",
    status: medication.administeredAt ? "Administered" : "Mark Given",
    isAdministered: Boolean(medication.administeredAt),
  }));
}

export async function saveMedication(api, prescription, patient, medicationId) {
  if (
    !prescription?._id ||
    !patient.pid ||
    prescription.patientId !== patient.pid
  )
    throw new Error("Select a prescription belonging to the current patient.");
  if (
    !prescription.medications.some(
      (medication) => medication._id === medicationId,
    )
  )
    throw new Error("Select a medication from the current prescription.");
  const response = await api.administerMedication(
    prescription._id,
    medicationId,
    patient.pid,
  );
  if (
    response.data?.patientId !== patient.pid ||
    !response.data.medications?.some(
      (medication) =>
        medication._id === medicationId && medication.administeredAt,
    )
  ) {
    throw new Error(
      "The server did not confirm medication administration. Refresh before trying again.",
    );
  }
  return response;
}

export function validateVitals(input, patientId) {
  if (!patientId) throw new Error("Select a patient before recording vitals.");
  for (const value of Object.values(input)) {
    if (
      String(value).trim() === "" ||
      !Number.isFinite(Number(value)) ||
      Number(value) <= 0
    )
      throw new Error("Enter valid numeric vitals in all fields.");
  }
  if (Number(input.spO2) > 100) throw new Error("SpO2 cannot exceed 100%.");
  return { ...input };
}

export function prepareHandover(notes, nurseId, checks) {
  if (!nurseId.trim() || !notes.trim())
    throw new Error("Enter an oncoming nurse ID and clinical notes.");
  return {
    notes: notes.trim(),
    nurseId: nurseId.trim(),
    checks: { ...checks },
  };
}
