module.exports = function createCorsOptions(configuredOrigins = '') {
  const origins = new Set((configuredOrigins || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ].join(',')).split(',').map((value) => value.trim()).filter(Boolean));

  return {
    origin(origin, callback) {
      // CLI and same-origin requests may omit Origin. This is not authentication.
      if (!origin || origins.has(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed');
      error.status = 403;
      return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  };
};
