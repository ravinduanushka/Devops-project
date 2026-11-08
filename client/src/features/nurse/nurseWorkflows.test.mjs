import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mapNursePatients,
  selectPrescription,
  medicationSchedule,
  saveMedication,
  validateVitals,
  prepareHandover,
} from "./nurseWorkflows.js";
import { createActionRunner } from "../shared/actionRunner.js";

test("ward records keep stable IDs and handle populated doctors without inventing allergies", () => {
  const rows = mapNursePatients([
    {
      _id: "record",
      patientId: "account",
      name: "Example",
      status: "Admitted",
      age: 0,
      wardNumber: "Ward A / Bed-A",
      assignedDoctor: { name: "Doctor" },
    },
    { status: "Discharged" },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].pid, "account");
  assert.equal(rows[0].age, 0);
  assert.equal(rows[0].attendingPhysician, "Doctor");
  assert.equal(rows[0].allergy, "");
  assert.equal(rows[0].bedNo, "Bed-A");
  assert.deepEqual(mapNursePatients([]), []);
});

test("only the selected patient’s latest prescription is loaded, even with identical names", () => {
  const records = [
    {
      _id: "other",
      patientId: "b",
      patientName: "Same",
      createdAt: "2099-01-01",
    },
    {
      _id: "old",
      patientId: "a",
      patientName: "Same",
      createdAt: "2025-01-01",
    },
    {
      _id: "new",
      patientId: "a",
      patientName: "Same",
      createdAt: "2026-01-01",
    },
  ];
  assert.equal(selectPrescription(records, "a")._id, "new");
  assert.equal(selectPrescription(records, "missing"), null);
  assert.equal(selectPrescription(records, ""), null);
  assert.equal(records[0]._id, "other");
});

test("dispensed prescription status never marks every medicine administered", () => {
  const rows = medicationSchedule({
    status: "Dispensed",
    medications: [
      { _id: "a", name: "A" },
      {
        _id: "b",
        name: "B",
        administeredAt: "2026-01-01",
        administeredByName: "Nurse",
      },
    ],
  });
  assert.equal(rows[0].isAdministered, false);
  assert.equal(rows[1].isAdministered, true);
  assert.equal(rows[0].id, "a");
});

test("medication save verifies both selected patient and medication identity before making requests", async () => {
  const prescription = {
    _id: "rx",
    patientId: "a",
    medications: [{ _id: "med", name: "Medicine" }],
  };
  let calls = 0;
  const api = {
    administerMedication: async () => {
      calls++;
    },
  };
  await assert.rejects(
    saveMedication(api, prescription, { pid: "b" }, "med"),
    /current patient/,
  );
  await assert.rejects(
    saveMedication(api, prescription, { pid: "a" }, "other"),
    /current prescription/,
  );
  assert.equal(calls, 0);
});

test("medication save accepts only a server-confirmed administration", async () => {
  const prescription = {
    _id: "rx",
    patientId: "a",
    medications: [{ _id: "med" }],
  };
  let sent;
  const api = {
    administerMedication: async (...args) => {
      sent = args;
      return {
        data: {
          ...prescription,
          medications: [{ _id: "med", administeredAt: "2026-01-01" }],
        },
      };
    },
  };
  await saveMedication(api, prescription, { pid: "a" }, "med");
  assert.deepEqual(sent, ["rx", "med", "a"]);
  await assert.rejects(
    saveMedication(
      { administerMedication: async () => ({ data: prescription }) },
      prescription,
      { pid: "a" },
      "med",
    ),
    /did not confirm/,
  );
});

test("failed medication request leaves the local schedule unpublished", async () => {
  const run = createActionRunner({ onPending: () => {}, onError: () => {} });
  let published = false;
  assert.equal(
    await run(
      "medication",
      async () => {
        throw new Error("Offline");
      },
      () => {
        published = true;
      },
    ),
    false,
  );
  assert.equal(published, false);
});

test("vitals reject empty or nonnumeric fields and require a selected patient", () => {
  const input = {
    bpSys: "120",
    bpDia: "80",
    heartRate: "70",
    temperature: "98.6",
    spO2: "98",
  };
  assert.deepEqual(validateVitals(input, "patient"), input);
  assert.throws(() => validateVitals(input, ""), /Select a patient/);
  assert.throws(
    () => validateVitals({ ...input, heartRate: "" }, "patient"),
    /numeric vitals/,
  );
  assert.throws(
    () => validateVitals({ ...input, temperature: "invalid" }, "patient"),
    /numeric vitals/,
  );
  assert.throws(
    () => validateVitals({ ...input, spO2: "101" }, "patient"),
    /100%/,
  );
});

test("handover requires actual nurse ID and notes instead of a fabricated acknowledgement", () => {
  assert.throws(() => prepareHandover("Notes", "", {}), /nurse ID/);
  assert.throws(() => prepareHandover(" ", "Nurse-1", {}), /clinical notes/);
  const checks = { reportDone: true };
  assert.deepEqual(prepareHandover(" Notes ", " Nurse-1 ", checks), {
    notes: "Notes",
    nurseId: "Nurse-1",
    checks,
  });
});
