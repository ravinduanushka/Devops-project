const roles = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'];
const requireRoles = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue' });
  if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission for this action' });
  return next();
};

const registrationPermission = (sessions) => (req, res, next) => {
  const role = typeof req.body.role === 'string' ? req.body.role.trim() : '';
  if (!roles.includes(role)) return res.status(400).json({ error: 'Invalid account role' });
  // Doctor, Nurse, Patient, and authorized Receptionist can register directly without prior sign in
  if (['Doctor', 'Nurse', 'Patient', 'Receptionist'].includes(role)) return next();
  return sessions.requireUser(req, res, (error) => error ? next(error) : requireRoles('Admin')(req, res, next));
};

module.exports = { requireRoles, registrationPermission };
