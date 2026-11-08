# Receptionist workflow logic

The page retains its original JSX, visible text, classes, inline styles and
layout. Controller, synchronization, navigation and notice logic live in hooks.
Failures use the existing toast rather than adding UI elements.

| Module                         | Responsibility                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `useReceptionistDashboard.js`  | Form state, workflow handlers and page bindings                                 |
| `useReceptionistSync.js`       | Doctor/admission refreshes and legacy cross-tab subscriptions                   |
| `useReceptionistNavigation.js` | Sidebar scrolling, scroll tracking and cleanup                                  |
| `useReceptionistNotice.js`     | Existing toast lifetime and timer cleanup                                       |
| `receptionistWorkflows.js`     | Registration/token payloads, allocation/discharge checks and billing validation |
| `../shared/actionRunner.js`    | Shared save-before-publish sequencing and duplicate submission protection       |

Registration, token issuance, bed allocation and discharge publish local changes
only after backend acknowledgement. Failed requests do not update patient tags,
mark beds occupied, free beds or display a success confirmation. Local publishing
failures after a successful save are reported separately to avoid blind retries.

Tokens require an explicit patient ID; a NIC or unlabelled name cannot fall back
to a different selected patient. Bed allocation requires an available bed and a
database admission order. The backend admission endpoint synchronizes the patient
record, replacing the old second update that matched by name. Discharge resolves
exactly one patient ID, verifies saved doctor approval and completed payment, and
clears the patient's ward. The backend patient update route accepts an empty ward
string so a discharge can actually clear it.

Run from `client`:

```sh
npm run test:receptionist
npm run lint:receptionist
npm run test:doctor
npm run build
```

From `server`, `npm run test:permissions` checks role protection and ward clearing
using an isolated temporary database. Client tests use mocked API boundaries and
do not substitute for end-to-end tests.

## Remaining limitations

Existing sample displays, local-storage billing/clearance snapshots, four-digit
random display IDs and fixed bed-capacity assumptions remain. These display IDs
do not automatically link to a patient's login account. Historical account links
require verification as documented in `server/AUTH.md`. Bed availability is still
checked on the client; allocation is not an atomic server reservation across
multiple receptionists. Billing totals and summaries are not a persistent payment
ledger. The added payment/approval checks improve this client's workflow; they
are not a replacement for backend enforcement of those business rules.
