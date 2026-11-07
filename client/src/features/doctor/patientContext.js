export const cleanPatientId = (value = "") =>
  String(value).replace(/^#/, "").trim();

export function doctorName(user) {
  if (!user?.name) return "Doctor";
  return user.name.startsWith("Dr.") ? user.name : `Dr. ${user.name}`;
}

export function resolveQueuePatient(entry, catalog) {
  const token = entry.token.replace(/^#/, "");
  const existing = catalog[token];
  // Tokens can be reused in old fixtures; identity must agree before reusing notes.
  if (
    entry.patientId &&
    existing &&
    existing.dbId &&
    existing.dbId === entry.dbId &&
    cleanPatientId(existing.pid) === cleanPatientId(entry.patientId)
  ) {
    return entry.dbId ? { ...existing, dbId: entry.dbId } : existing;
  }
  const profile = entry.profile || {};
  return {
    token,
    name: entry.patientName,
    age: entry.age || "",
    gender: profile.gender || "",
    pid: cleanPatientId(entry.patientId),
    dbId: entry.dbId || "",
    room: entry.room || "",
    bloodGroup: profile.bloodGroup || "",
    allergy: profile.allergies || "",
    vitals: { bp: "", pulse: "", temp: "" },
    pastHistory: [],
    symptoms: "",
    diagnosis: profile.diagnosis || "",
    medications: [],
    diagnostics: {
      bloodTests: false,
      urineTest: false,
      xRay: false,
      ecg: false,
    },
    followUpAdvice: "",
  };
}

export function requireDatabasePatient(patient) {
  if (!/^[a-f\d]{24}$/i.test(patient?.dbId || "")) {
    throw new Error(
      "Select a patient linked to a database record before saving this action.",
    );
  }
  return patient.dbId;
}

export async function savePatientUpdate(updatePatient, patient, fields) {
  const id = requireDatabasePatient(patient);
  const response = await updatePatient(id, fields);
  if (!response.data?._id) {
    throw new Error(
      "The patient record no longer exists. Refresh and select the patient again.",
    );
  }
  return response;
}
