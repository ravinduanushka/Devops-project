const { randomBytes, createHash } = require('node:crypto');

const COOKIE = 'hospital_session';
const LIFETIME = 8 * 60 * 60 * 1000;
const digest = (token) => createHash('sha256').update(token).digest('hex');
const options = () => ({
  httpOnly: true,
  secure: process.env.SESSION_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
});

module.exports = function createSessions(Session, User) {
  const readToken = (req) => {
    const value = (req.headers.cookie || '').split(';').map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    return /^[a-f0-9]{64}$/.test(value || '') ? value : null;
  };
  const revoke = async (req) => {
    const token = readToken(req);
    if (token) await Session.deleteOne({ tokenHash: digest(token) });
  };
  return {
    async issue(req, res, user) {
      await revoke(req);
      const token = randomBytes(32).toString('hex');
      await Session.create({ tokenHash: digest(token), user: user._id, expiresAt: new Date(Date.now() + LIFETIME) });
      res.cookie(COOKIE, token, { ...options(), maxAge: LIFETIME });
    },
    async requireUser(req, res, next) {
      try {
        const token = readToken(req);
        const session = token && await Session.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
        const user = session && await User.findById(session.user).select('-password');
        if (!user) return res.status(401).json({ error: 'Please sign in to continue' });
        req.user = user;
        return next();
      } catch (error) { return next(error); }
    },
    async logout(req, res, next) {
      try {
        await revoke(req);
        res.clearCookie(COOKIE, options());
        return res.sendStatus(204);
      } catch (error) { return next(error); }
    }
  };
};
