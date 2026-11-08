# Login sessions

Login creates a random token in an HttpOnly, SameSite=Lax cookie. MongoDB stores
only its SHA-256 hash and user ID. Sessions expire after eight hours; expiry is
checked even before MongoDB's TTL cleanup runs. Logout deletes the session.
Logging in again rotates the current browser's session. Replicas share MongoDB.

Dashboard routes verify `/api/auth/me`. Local storage holds display information,
not credentials; changing it cannot create a valid server session.

Deploy with HTTPS and `SESSION_COOKIE_SECURE=true` on the backend (also enabled
by `NODE_ENV=production`). HTTP localhost uses the development default. Frontend
and API should share a site through Nginx or Vite; cross-site cookies are not
configured. Set `CLIENT_ORIGIN` for your browser origins.

Health, doctor listings, patient registration and login remain public. Creating
staff or admin accounts requires an admin session. The public registration page
shows the original role choices; staff signup submissions still require an admin
session. Administrators can also create staff through the admin dashboard.
Registration never resets another account's password.

Clinical reads require login. Patient sessions receive only rows whose
`patientId` equals their immutable account ID, regardless of query parameters.
The backend sets this ID and the account name on patient-created appointments;
clients cannot override ownership. Staff retain clinical list access.
New patient signup creates a patient profile using that same ID. Staff should
use the ID displayed in the patient's portal for new clinical records.

Legacy IDs such as `P-1042` are not automatically linked by name or email.
Historical records require an operator-reviewed migration after verifying the
account and patient identity; they remain hidden from patient sessions until
then. Existing accounts without a canonical profile can still book their own
appointments. Clinical updates match patient IDs rather than names.

The patient portal displays server records and empty states. Shared localStorage
clinical snapshots, demo records, and the unverified discharge download have
been removed. Logout display data cannot reveal another patient's clinical data.
Mutation permissions are enforced by the backend:

| Action | Roles |
| --- | --- |
| Register staff/admin | Admin |
| Create patient | Admin, Receptionist |
| Update patient | Admin, Doctor, Nurse, Receptionist |
| Create appointment | Admin, Receptionist, Patient |
| Update appointment | Admin, Doctor, Receptionist |
| Create prescription or admission | Admin, Doctor |
| Update prescription status | Admin, Doctor, Nurse |
| Record individual medication administration | Admin, Nurse |
| Update admission | Admin, Doctor, Receptionist, Nurse |

`PUT /api/prescriptions/:id/medications/:medicationId` requires the selected
`patientId`. It stores per-medication administration time and the authenticated
user, and preserves that first audit on repeated requests. Creating a
prescription accepts medication instructions but ignores submitted administration
audit fields. Dispensing status alone does not establish administration.

If no admin exists, an operator can run `npm run create-admin` from `server` with
`ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PHONE`, and `ADMIN_PASSWORD` supplied through
the environment, plus `MONGO_URI` if needed. The password must have at least 12
characters. This command creates a new account only; it never overwrites an
existing email and does not run at startup. Keep these values out of Git.

Run `npm run test:auth` with local MongoDB, or set `TEST_MONGO_URI`. The test uses
the actual app with a new isolated database and deletes that test database on
completion. It does not seed or change the hospital database.
