# Admin dashboard logic

The Admin page's existing JSX, visible text, classes, layout and styles remain
unchanged. This refactor moves controller logic behind the same state and
handler names. Errors use the existing registration alerts and notification
banner; no new visual elements are added.

| Module                 | Responsibility                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `useAdminDashboard.js` | Compose session display, selected tab, data and forms                                     |
| `useAdminData.js`      | Health checks, one shared refresh path, partial-failure reporting and cleanup             |
| `useAdminForms.js`     | Form state, handlers, existing success/error messages and successful form resets          |
| `adminWorkflows.js`    | Payload validation, API submission, duplicate-request guards and independent data loading |

Submissions lock by action until their request completes. Failures retain form
input for correction. Only a successful API response resets a form. Appointment
dates are sent as ISO timestamps, and token allocation stays on the server.

Dashboard lists load independently. A failed list retains its last known value
and reports an error through the existing banner; an empty successful response
clears its list. Refresh generation and unmount checks prevent an older request
from overwriting a more recent one. Refresh errors do not turn a successful
registration or appointment creation into a failed save.

From `client`, run:

```sh
npm run test:admin
npm run lint:admin
npm run build
```

Tests use Node's built-in test runner and mocked API boundaries. They cover
registration roles, validation, payload normalization, appointment dates,
patient creation, duplicate requests, retries and partial data failures. They
do not replace the backend authorization tests or a browser integration test.
