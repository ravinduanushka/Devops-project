import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registrationPayload,
  patientPayload,
  appointmentPayload,
  initialRegistrationForm,
  registerStaff,
  addPatient,
  addAppointment,
  createAdminSubmission,
  fetchDashboardData,
  errorMessage,
} from "./adminWorkflows.js";

const validRegistration = () => ({
  ...initialRegistrationForm(),
  name: " Example Doctor ",
  email: " doctor@example.test ",
  phone: " 123 ",
  password: "secret-password",
  confirmPassword: "secret-password",
});

test("registration sends normalized identity and only the selected role details", async () => {
  for (const [role, detail] of [
    ["Doctor", "doctorDetails"],
    ["Nurse", "nurseDetails"],
    ["Receptionist", "receptionistDetails"],
  ]) {
    const form = { ...validRegistration(), role };
    const original = structuredClone(form);
    let sent;
    const response = await registerStaff(
      {
        registerUser: async (payload) => {
          sent = payload;
          return { status: 201 };
        },
      },
      form,
    );
    assert.equal(response.status, 201);
    assert.equal(sent.name, "Example Doctor");
    assert.equal(sent.email, "doctor@example.test");
    assert.deepEqual(sent[detail], form[detail]);
    assert.notEqual(sent[detail], form[detail]);
    for (const other of [
      "doctorDetails",
      "nurseDetails",
      "receptionistDetails",
    ].filter((name) => name !== detail))
      assert.equal(sent[other], undefined);
    assert.deepEqual(form, original);
  }
});

test("invalid passwords and whitespace-only identity never reach registration API", () => {
  let requests = 0;
  const api = {
    registerUser: () => {
      requests++;
    },
  };
  assert.throws(
    () => registerStaff(api, { ...validRegistration(), password: "short" }),
    /at least 6/,
  );
  assert.throws(
    () =>
      registerStaff(api, {
        ...validRegistration(),
        confirmPassword: "different",
      }),
    /do not match/,
  );
  assert.throws(
    () => registerStaff(api, { ...validRegistration(), name: "   " }),
    /required/,
  );
  assert.equal(requests, 0);
});

test("patient and admin registration contain no staff-specific details", () => {
  for (const role of ["Patient", "Admin"]) {
    const payload = registrationPayload({ ...validRegistration(), role });
    assert.equal(payload.doctorDetails, undefined);
    assert.equal(payload.nurseDetails, undefined);
    assert.equal(payload.receptionistDetails, undefined);
  }
});

test("appointment sends the selected local date as ISO and omits client token numbers", async () => {
  const form = {
    patientName: " Patient ",
    doctorName: " Doctor ",
    dateTime: "2099-06-15T14:30",
    tokenNumber: 999,
  };
  let payload;
  await addAppointment(
    {
      createAppointment: async (data) => {
        payload = data;
      },
    },
    form,
  );
  assert.deepEqual(payload, {
    patientName: "Patient",
    doctorName: "Doctor",
    dateTime: new Date(form.dateTime).toISOString(),
  });
  assert.equal(form.tokenNumber, 999);
});

test("missing, invalid and past appointment dates are rejected before submission", () => {
  let requests = 0;
  const api = {
    createAppointment: () => {
      requests++;
    },
  };
  for (const dateTime of ["", "invalid", "2020-01-01T10:00"]) {
    assert.throws(
      () =>
        addAppointment(api, {
          patientName: "Patient",
          doctorName: "Doctor",
          dateTime,
        }),
      /future appointment/,
    );
  }
  assert.throws(
    () =>
      appointmentPayload({
        patientName: " ",
        doctorName: "Doctor",
        dateTime: "2099-01-01T12:00",
      }),
    /required/,
  );
  assert.equal(requests, 0);
});

test("patient creation normalizes age and name without mutating the form", async () => {
  const form = {
    name: " Patient ",
    age: "42",
    diagnosis: "Review",
    assignedDoctor: "",
    wardNumber: "Ward A",
  };
  let sent;
  await addPatient(
    {
      createPatient: async (payload) => {
        sent = payload;
      },
    },
    form,
  );
  assert.equal(sent.age, 42);
  assert.equal(sent.name, "Patient");
  assert.equal(form.age, "42");
  for (const age of ["-1", "invalid", Infinity])
    assert.throws(() => patientPayload({ ...form, age }), /non-negative/);
});

for (const key of ["registration", "patient", "appointment"]) {
  test(`${key}: rejected saves clear pending state and permit a later retry`, async () => {
    const pending = [];
    const submit = createAdminSubmission((keys) => pending.push(keys));
    const failure = { response: { data: { error: "Permission denied" } } };
    const result = await submit(key, async () => {
      throw failure;
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, failure);
    assert.deepEqual(pending.at(-1), []);
    assert.equal((await submit(key, async () => ({ status: 201 }))).ok, true);
  });
}

test("repeated submission while a request is pending creates only one API request", async () => {
  const submit = createAdminSubmission(() => {});
  let finish,
    requests = 0;
  const save = () => {
    requests++;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const first = submit("registration", save);
  assert.deepEqual(await submit("registration", save), {
    ok: false,
    busy: true,
  });
  assert.equal(requests, 1);
  finish({ status: 201 });
  assert.equal((await first).ok, true);
});

test("dashboard preserves independent successful responses when the other endpoint fails", async () => {
  const patients = [{ _id: "patient" }];
  const result = await fetchDashboardData({
    getPatients: async () => ({ data: patients }),
    getAppointments: async () => {
      throw new Error("Offline");
    },
  });
  assert.deepEqual(result.data, { patients });
  assert.deepEqual(result.errors, ["Unable to load appointments."]);
});

test("empty backend lists replace stale lists while malformed responses report an error", async () => {
  const empty = await fetchDashboardData({
    getPatients: async () => ({ data: [] }),
    getAppointments: async () => ({ data: [] }),
  });
  assert.deepEqual(empty, {
    data: { patients: [], appointments: [] },
    errors: [],
  });
  const invalid = await fetchDashboardData({
    getPatients: async () => ({ data: {} }),
    getAppointments: async () => ({ data: null }),
  });
  assert.equal(invalid.errors.length, 2);
  assert.deepEqual(invalid.data, {});
});

test("errors support backend messages, network failures, and missing error details", () => {
  assert.equal(
    errorMessage(
      { response: { data: { message: "Duplicate account" } } },
      "Fallback",
    ),
    "Duplicate account",
  );
  assert.equal(
    errorMessage(new Error("Network unavailable"), "Fallback"),
    "Network unavailable",
  );
  assert.equal(errorMessage(null, "Fallback"), "Fallback");
});
