export function patientRegistrationPayload(form, patientId) {
  const age = Number(form.age);
  if (!form.fullName.trim() || !patientId)
    throw new Error("Patient name and Patient ID are required.");
  if (form.age === "" || !Number.isFinite(age) || age < 0)
    throw new Error("Enter a valid patient age.");
  return {
    name: form.fullName.trim(),
    patientId,
    age,
    gender: form.gender,
    contact: form.contactNumber,
    bloodGroup: form.bloodGroup,
    allergies: form.allergies,
    nic: form.nicNumber,
    status: "Registered",
  };
}

export function tokenPayload(form) {
  const patientName = form.searchPatient.split(" (")[0].trim();
  const patientId = form.searchPatient
    .match(/(?:PID|ID):\s*([^)]+)/i)?.[1]
    .trim();
  const doctorName = form.selectedDoctor.split(" - ")[0].trim();
  if (!patientName || !patientId || !doctorName)
    throw new Error(
      "Select a patient with a Patient ID and a doctor before issuing a token.",
    );
  return {
    patientName,
    patientId,
    doctorName,
    department: form.clinicUnit,
    dateTime: new Date().toISOString(),
    status: "Waiting",
    type: "In-Person Consultation",
    fee: form.fee,
  };
}

export async function saveBedAllocation(api, patient, bed) {
  if (!bed || bed.status !== "available")
    throw new Error("Choose an available bed before confirming allocation.");
  if (!/^[a-f\d]{24}$/i.test(patient.dbId || ""))
    throw new Error("Select an admission order linked to the database.");
  const response = await api.updateAdmission(patient.dbId, {
    status: "Bed Allocated",
    bedNo: bed.id,
    ward: patient.ward || "Ward 3B",
  });
  if (!response.data?._id)
    throw new Error(
      "The admission order no longer exists. Refresh before allocating a bed.",
    );
  return response;
}

export function totalBill(charges) {
  return (
    charges.reduce((sum, charge) => {
      const amount = Number(charge.amount);
      if (!Number.isFinite(amount) || amount < 0)
        throw new Error("Charge amounts must be valid non-negative numbers.");
      return sum + Math.round(amount * 100);
    }, 0) / 100
  );
}

export async function saveDischarge(api, data) {
  if (data.paymentStatus !== "Payment Completed")
    throw new Error("Complete payment before finalizing discharge.");
  totalBill(data.charges);
  const response = await api.getPatients();
  const matches = Array.isArray(response.data)
    ? response.data.filter(
        (patient) => patient.patientId && patient.patientId === data.pid,
      )
    : [];
  if (matches.length !== 1)
    throw new Error(
      "The Patient ID must identify exactly one database record.",
    );
  if (matches[0].status !== "Discharge Approved")
    throw new Error(
      "Doctor discharge approval must be saved before finalizing discharge.",
    );
  const saved = await api.updatePatient(matches[0]._id, {
    status: "Discharged",
    wardNumber: "",
  });
  if (!saved.data?._id)
    throw new Error(
      "The patient record no longer exists. Refresh before discharging.",
    );
  return saved;
}
