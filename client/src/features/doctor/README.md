# Doctor workspace

The doctor page composes four dashboard cards and owns their shared patient and
form state. The existing card markup, element IDs and CSS classes are preserved.

| Module                                     | Responsibility                                                      |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `components/doctor/PatientQueueCard.jsx`   | Queue and consultation controls                                     |
| `components/doctor/WardRoundsCard.jsx`     | Ward table and discharge controls                                   |
| `components/doctor/PrescriptionCard.jsx`   | Prescription form and medication list                               |
| `components/doctor/MedicalRecordsCard.jsx` | Clinical notes and admission controls                               |
| `useDoctorSync.js`                         | Backend polling, cross-tab subscriptions and cleanup                |
| `useDoctorNavigation.js`                   | Sidebar, scroll tracking and timer cleanup                          |
| `useDoctorNotice.js`                       | Toast lifetime and timer cleanup                                    |
| `useDoctorActions.js`, `actionRunner.js`   | Pending saves, duplicate-click protection and errors                |
| `doctorRecords.js`, `patientContext.js`    | ID-based record mapping and patient-context validation              |
| `legacyDoctorData.js`                      | Existing sample profiles, explicitly separated from backend records |

## Saving an action

The page builds a payload and calls `runAction(key, save, publish)`. The runner
blocks another save with the same key while a request is pending. It waits for
the backend before publishing any local state, cross-tab event, or success
message. API failures display an error and leave success callbacks uncalled.
If local publishing fails after the server saved, the message explicitly says
that the server already saved and advises a refresh instead of a blind retry.

Prescriptions, admissions, notes and discharge require selection of a patient
with a database record ID. A display ID such as `P-1042` is not a MongoDB record
ID. Queue records join patients by `patientId`, never by name. Selecting a new
patient clears the previous patient's medication, diagnostics and advice. A
sample token cannot inject demo clinical notes into a real patient context.

## Verification

From `client`:

```sh
npm run test:doctor
npm run lint:doctor
npm run build
```

The tests use Node's built-in runner without adding runtime dependencies. They
exercise the shared save coordinator used by all four clinical actions, failure
handling, duplicate requests and patient identity mapping. They do not replace
an end-to-end browser check against the deployed backend.

## Remaining limitations

Legacy cross-tab events and sample initial displays remain for compatibility.
Successful backend refreshes replace queue and ward lists, including empty
responses. The sample profiles cannot be used to save clinical changes without
a linked database record. Ward occupancy figures still use the existing fixed
capacity assumptions. Hold/Complete and several auxiliary buttons retain their
existing notification-only behavior. The backend currently saves diagnosis
through the patient update route; symptoms and vitals remain in workspace state.
Do not describe these remaining controls as completed persistence workflows.
