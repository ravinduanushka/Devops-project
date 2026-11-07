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

Health, doctor listings, registration and login remain public. Clinical endpoints
require login. Backend role permissions, staff registration restrictions and
patient ownership checks remain separate work.

Run `npm run test:auth` with local MongoDB, or set `TEST_MONGO_URI`. The test uses
the actual app with a new isolated database and deletes that test database on
completion. It does not seed or change the hospital database.
