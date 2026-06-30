const db = require('../config/db');
const { Audit } = db;

const { AUDIT_ENABLED } = process.env;

module.exports = (actionName) => {
  return async (req, res, next) => {
    if (AUDIT_ENABLED !== 'true') return next();

    const start = Date.now();
    const user = req.user || {};

    
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        const duration = Date.now() - start;
        await Audit.create({
          userId: user.id || null,
          action: actionName,
          entity: req.baseUrl || req.path,
          entityId: body && body.id ? String(body.id) : null,
          details: {
            method: req.method,
            path: req.originalUrl,
            body: req.body,
            statusCode: res.statusCode,
            durationMs: duration
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || ''
        });
      } catch (e) {
        console.error('Audit log failed', e);
      }
      return originalJson(body);
    };

    next();
  };
};
