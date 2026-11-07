import { test } from "node:test";
import assert from "node:assert/strict";
import { createActionRunner } from "./actionRunner.js";
import {
  cleanPatientId,
  doctorName,
  resolveQueuePatient,
  requireDatabasePatient,
  savePatientUpdate,
} from "./patientContext.js";
import { mapDoctorAppointments, mapWardPatients } from "./doctorRecords.js";

function runner() {
  const pending = [],
    errors = [];
  return {
    run: createActionRunner({
      onPending: (keys) => pending.push(keys),
      onError: (error) => errors.push(error),
    }),
    pending,
    errors,
  };
}

for (const action of ["prescription", "admission", "notes", "discharge"]) {
  test(`${action}: publish only after backend acknowledgement`, async () => {
    const { run, pending } = runner();
    const events = [];
    const saved = { data: { _id: "saved-record" } };
    assert.equal(
      await run(
        action,
        async () => {
          events.push("save");
          return saved;
        },
        (response) => {
          assert.equal(response, saved);
          events.push("publish");
        },
      ),
      true,
    );
    assert.deepEqual(events, ["save", "publish"]);
    assert.deepEqual(pending, [[action], []]);
  });
  test(`${action}: API failure cannot publish a successful workflow`, async () => {
    const { run, pending, errors } = runner();
    let published = false;
    const failure = { response: { data: { error: "Permission denied" } } };
    assert.equal(
      await run(
        action,
        async () => {
          throw failure;
        },
        () => {
          published = true;
        },
      ),
      false,
    );
    assert.equal(published, false);
    assert.equal(errors.at(-1), "Permission denied");
    assert.deepEqual(pending.at(-1), []);
    assert.equal(
      await run(
        action,
        async () => ({}),
        () => {},
      ),
      true,
    );
  });
}

test("double-click during an outstanding save does not issue a duplicate request", async () => {
  const { run } = runner();
  let finish,
    requests = 0;
  const save = () => {
    requests++;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const first = run("prescription", save, () => {});
  assert.equal(await run("prescription", save, () => {}), false);
  assert.equal(requests, 1);
  finish({});
  assert.equal(await first, true);
});

test("a local publishing failure reports that the database save already succeeded", async () => {
  const { run, errors } = runner();
  let requests = 0;
  assert.equal(
    await run(
      "admission",
      async () => {
        requests++;
      },
      () => {
        throw new Error("Storage full");
      },
    ),
    false,
  );
  assert.equal(requests, 1);
  assert.match(errors.at(-1), /Saved to the server/);
});

test("reused tokens cannot load a different patient profile or carry over medication", () => {
  const catalog = {
    "05": {
      pid: "old-patient",
      diagnosis: "Other diagnosis",
      medications: [{ name: "Other medication" }],
    },
  };
  const patient = resolveQueuePatient(
    { token: "#05", patientName: "Current patient", patientId: "new-patient" },
    catalog,
  );
  assert.equal(patient.pid, "new-patient");
  assert.equal(patient.diagnosis, "");
  assert.deepEqual(patient.medications, []);
  assert.deepEqual(
    resolveQueuePatient({ token: "#05", patientId: "old-patient" }, catalog)
      .medications,
    [],
  );
  catalog["05"].dbId = "0123456789abcdef01234567";
  assert.equal(
    resolveQueuePatient(
      { token: "#05", patientId: "old-patient", dbId: catalog["05"].dbId },
      catalog,
    ).diagnosis,
    "Other diagnosis",
  );
});

test("doctor records join by patient ID even when two people have the same name", () => {
  const rows = mapDoctorAppointments(
    [
      {
        _id: "appointment",
        tokenNumber: 3,
        patientId: "patient-b",
        patientName: "Same Name",
      },
    ],
    [
      { _id: "record-a", patientId: "patient-a", name: "Same Name", age: 21 },
      { _id: "record-b", patientId: "patient-b", name: "Same Name", age: 40 },
    ],
  );
  assert.equal(rows[0].dbId, "record-b");
  assert.equal(rows[0].age, 40);
  assert.equal(rows[0].token, "#03");
  assert.deepEqual(mapDoctorAppointments([], []), []);
});

test("ward mapping retains IDs and excludes patients who are not admitted", () => {
  const patients = mapWardPatients([
    {
      _id: "record",
      patientId: "account",
      name: "Admitted",
      status: "Admitted",
    },
    { _id: "other", status: "Registered" },
  ]);
  assert.equal(patients.length, 1);
  assert.equal(patients[0].dbId, "record");
  assert.equal(patients[0].patientId, "account");
  assert.deepEqual(mapWardPatients([]), []);
});

test("saving notes or discharge requires a database record, not a display patient ID", () => {
  assert.throws(
    () => requireDatabasePatient({ dbId: "P-1042" }),
    /database record/,
  );
  assert.throws(() => requireDatabasePatient({}), /database record/);
  const id = "0123456789abcdef01234567";
  assert.equal(requireDatabasePatient({ dbId: id }), id);
  assert.equal(cleanPatientId("#P-1042"), "P-1042");
  assert.equal(doctorName({ name: "Dr. Existing" }), "Dr. Existing");
  assert.equal(doctorName({ name: "New" }), "Dr. New");
});

test("notes and discharge reject a missing record even if the API returns HTTP success", async () => {
  const patient = { dbId: "0123456789abcdef01234567" };
  await assert.rejects(
    savePatientUpdate(async () => ({ data: null }), patient, {
      status: "Discharge Approved",
    }),
    /no longer exists/,
  );
  let request;
  const response = await savePatientUpdate(
    async (id, fields) => {
      request = { id, fields };
      return { data: { _id: id } };
    },
    patient,
    { diagnosis: "Reviewed" },
  );
  assert.equal(response.data._id, patient.dbId);
  assert.deepEqual(request, {
    id: patient.dbId,
    fields: { diagnosis: "Reviewed" },
  });
});
