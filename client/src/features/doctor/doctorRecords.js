export function mapDoctorAppointments(appointments, patients) {
  const byId = new Map(
    patients
      .filter((patient) => patient.patientId)
      .map((patient) => [patient.patientId, patient]),
  );
  return appointments.map((appointment) => {
    const patient = byId.get(appointment.patientId);
    return {
      token: `#${String(appointment.tokenNumber).padStart(2, "0")}`,
      appointmentId: appointment._id,
      patientId: appointment.patientId || "",
      dbId: patient?._id || "",
      profile: patient,
      patientName: appointment.patientName,
      age: patient?.age || "",
      estimatedTime: appointment.dateTime
        ? new Date(appointment.dateTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      status: appointment.status || "Waiting",
      statusColor:
        appointment.status === "In Consultation"
          ? "status-teal"
          : appointment.status === "Completed"
            ? "status-blue"
            : "status-mint",
    };
  });
}

export function mapWardPatients(patients) {
  return patients
    .filter((patient) => patient.status === "Admitted")
    .map((patient) => ({
      id: patient._id,
      dbId: patient._id,
      patientId: patient.patientId,
      bedNo: patient.wardNumber || "Not allocated",
      patientName: patient.name,
      admissionDate: patient.admittedAt
        ? new Date(patient.admittedAt).toLocaleDateString()
        : "",
      condition: "Stable",
      conditionColor: "cond-stable",
      nurseSummary: patient.diagnosis || "No diagnosis recorded",
      actionType: "discharge",
    }));
}
