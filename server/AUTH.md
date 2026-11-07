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
offers only Patient; administrators create staff through the admin dashboard.
Registration never resets another account's password.

Clinical reads require login. Patient ownership checks remain separate work.
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
| Update admission | Admin, Doctor, Receptionist, Nurse |

If no admin exists, an operator can run `npm run create-admin` from `server` with
`ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PHONE`, and `ADMIN_PASSWORD` supplied through
the environment, plus `MONGO_URI` if needed. The password must have at least 12
characters. This command creates a new account only; it never overwrites an
existing email and does not run at startup. Keep these values out of Git.

Run `npm run test:auth` with local MongoDB, or set `TEST_MONGO_URI`. The test uses
the actual app with a new isolated database and deletes that test database on
completion. It does not seed or change the hospital database.
