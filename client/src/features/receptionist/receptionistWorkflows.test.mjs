import { test } from "node:test";
import assert from "node:assert/strict";
import {
  patientRegistrationPayload,
  tokenPayload,
  saveBedAllocation,
  saveDischarge,
  totalBill,
} from "./receptionistWorkflows.js";
import { createActionRunner } from "../shared/actionRunner.js";

const recordId = "0123456789abcdef01234567";
const discharge = () => ({
  pid: "patient-b",
  paymentStatus: "Payment Completed",
  charges: [{ amount: "10.25" }],
});

test("registration preserves age zero and never substitutes demo patient details", () => {
  const form = {
    fullName: " Baby ",
    age: "0",
    gender: "Other",
    contactNumber: "123",
  };
  const payload = patientRegistrationPayload(form, "patient-id");
  assert.equal(payload.age, 0);
  assert.equal(payload.name, "Baby");
  assert.equal(form.fullName, " Baby ");
  assert.throws(
    () => patientRegistrationPayload({ ...form, age: "" }, "id"),
    /valid patient age/,
  );
  assert.throws(
    () => patientRegistrationPayload({ ...form, age: "-1" }, "id"),
    /valid patient age/,
  );
});

test("token creation extracts the selected patient ID and delegates numbering to the backend", () => {
  const payload = tokenPayload({
    searchPatient: "Patient (PID: account-id)",
    selectedDoctor: "Dr. Example - Cardiology",
    clinicUnit: "Cardiology",
  });
  assert.equal(payload.patientId, "account-id");
  assert.equal(payload.patientName, "Patient");
  assert.equal(payload.doctorName, "Dr. Example");
  assert.equal(payload.tokenNumber, undefined);
  assert.throws(
    () =>
      tokenPayload({
        searchPatient: "Patient (NIC: 1234)",
        selectedDoctor: "Dr. Example",
      }),
    /Patient ID/,
  );
});

test("bed allocation validates availability and updates the admission using its database ID", async () => {
  let sent;
  const api = {
    updateAdmission: async (id, fields) => {
      sent = { id, fields };
      return { data: { _id: id } };
    },
  };
  const patient = { dbId: recordId, ward: "Ward A" };
  await saveBedAllocation(api, patient, { id: "Bed-A", status: "available" });
  assert.deepEqual(sent, {
    id: recordId,
    fields: { status: "Bed Allocated", bedNo: "Bed-A", ward: "Ward A" },
  });
  await assert.rejects(
    saveBedAllocation(api, patient, { id: "Bed-A", status: "occupied" }),
    /available bed/,
  );
  await assert.rejects(
    saveBedAllocation(
      api,
      { dbId: "P-1042" },
      { id: "Bed-A", status: "available" },
    ),
    /linked to the database/,
  );
});

test("a missing admission response is not treated as a saved allocation", async () => {
  await assert.rejects(
    saveBedAllocation(
      { updateAdmission: async () => ({ data: null }) },
      { dbId: recordId },
      { id: "Bed-A", status: "available" },
    ),
    /no longer exists/,
  );
});

test("billing sums decimal charges in cents and rejects invalid amounts", () => {
  assert.equal(totalBill([{ amount: "0.10" }, { amount: "0.20" }]), 0.3);
  for (const amount of ["-1", "invalid", Infinity])
    assert.throws(() => totalBill([{ amount }]), /non-negative/);
});

test("discharge chooses the patient by ID even when names are identical", async () => {
  let target;
  await saveDischarge(
    {
      getPatients: async () => ({
        data: [
          {
            _id: "record-a",
            patientId: "patient-a",
            name: "Same Name",
            status: "Discharge Approved",
          },
          {
            _id: "record-b",
            patientId: "patient-b",
            name: "Same Name",
            status: "Discharge Approved",
          },
        ],
      }),
      updatePatient: async (id, fields) => {
        target = { id, fields };
        return { data: { _id: id } };
      },
    },
    discharge(),
  );
  assert.deepEqual(target, {
    id: "record-b",
    fields: { status: "Discharged", wardNumber: "" },
  });
});

test("discharge requires completed payment and backend doctor approval", async () => {
  let updates = 0;
  const api = {
    getPatients: async () => ({
      data: [{ _id: recordId, patientId: "patient-b", status: "Admitted" }],
    }),
    updatePatient: async () => {
      updates++;
    },
  };
  await assert.rejects(
    saveDischarge(api, { ...discharge(), paymentStatus: "Pending Payment" }),
    /Complete payment/,
  );
  await assert.rejects(
    saveDischarge(api, discharge()),
    /Doctor discharge approval/,
  );
  assert.equal(updates, 0);
});

test("ambiguous or missing patient IDs cannot finalize discharge", async () => {
  const row = {
    _id: recordId,
    patientId: "patient-b",
    status: "Discharge Approved",
  };
  for (const rows of [[], [row, row]]) {
    await assert.rejects(
      saveDischarge({ getPatients: async () => ({ data: rows }) }, discharge()),
      /exactly one/,
    );
  }
});

for (const key of ["registration", "token", "bed", "discharge"]) {
  test(`${key}: API failure cannot publish local success or alter the grid`, async () => {
    let published = false;
    const errors = [];
    const run = createActionRunner({
      onPending: () => {},
      onError: (error) => errors.push(error),
    });
    assert.equal(
      await run(
        key,
        async () => {
          throw new Error("Backend unavailable");
        },
        () => {
          published = true;
        },
      ),
      false,
    );
    assert.equal(published, false);
    assert.equal(errors.at(-1), "Backend unavailable");
  });
}

test("rapid repeated token submissions make only one request", async () => {
  const run = createActionRunner({ onPending: () => {}, onError: () => {} });
  let finish,
    requests = 0;
  const save = () => {
    requests++;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const first = run("token", save, () => {});
  assert.equal(await run("token", save, () => {}), false);
  assert.equal(requests, 1);
  finish({});
  assert.equal(await first, true);
});
