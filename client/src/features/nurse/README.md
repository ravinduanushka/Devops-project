# Nurse workflows

The Nurse page preserves its original JSX, labels, classes, inline styles and
layout. The controller composes separate synchronization, navigation and notice
hooks. Existing toast notifications report errors; no new UI elements are added.

The ward list comes from backend records and keeps patient IDs, including when
two patients share a name. Prescription polling loads only the selected patient's
latest prescription and clears missing or failed results. Shared pharmacy cache
data can no longer be combined with an unrelated prescription database ID.
Selecting a patient clears the previous patient's medication and vitals view.

Medication administration uses a dedicated backend endpoint that checks the
selected patient and medication. Nurse/Admin permissions apply. The server saves
the administration time and signed-in user per medication, with an atomic
compare-and-set that preserves the first administration's audit on repeat calls.
Dispensing and administration are separate: a prescription's `Dispensed` status
does not mean all its medicines were administered. The UI updates only after the
server confirms the individual medication; patient switches suppress stale save
callbacks. New prescription payloads cannot inject administration audit fields.

Vitals are validated and kept per patient in workspace memory. Handover requires
an actual nurse ID and notes. Neither has a server persistence endpoint yet;
their notices explicitly say these are local records/drafts rather than claiming
a server submission or fabricated acknowledgement.

From `client`, run `npm run test:nurse`, `npm run lint:nurse`, and `npm run build`.
From `server`, run `npm run test:medications` with local MongoDB or
`TEST_MONGO_URI`; it creates and removes an isolated test database. Client tests
use mocked API boundaries and do not substitute for a browser integration test.

Existing initial demo displays remain until backend refresh. The current view
shows the latest prescription per patient, not a longitudinal medication chart.
It does not model repeated doses of the same medicine, scheduled dose times,
clinical alerting, persistent vitals, or a durable handover workflow. Do not
describe this refactor as a complete medication-administration record system.
