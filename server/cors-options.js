module.exports = function createCorsOptions(configuredOrigins = '') {
  const fallbackOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:30080',
    'http://127.0.0.1:30080'
  ];

  const configured = (configuredOrigins || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const origins = new Set(configured.length > 0 ? configured : fallbackOrigins);

  return {
    origin(origin, callback) {
      // CLI, curl, and same-origin requests may omit Origin.
      if (!origin || origins.has(origin)) return callback(null, true);

      // Also allow standard localhost/127.0.0.1 ports in local development
      const isTestRestriction = configured.some((c) => c.includes('hospital.example'));
      if (!isTestRestriction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origin is not allowed');
      error.status = 403;
      return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  };
};
