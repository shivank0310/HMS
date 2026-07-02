const auditService = require('../services/audit.service');

function audit(action, resource) {
  return async (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode >= 400) return;
      auditService
        .log({
          userId: req.user?.sub,
          mspId: req.user?.mspId,
          action,
          resource,
          resourceId: req.params.id || req.body?.id,
          ipAddress: req.ip,
          metadata: { method: req.method, path: req.originalUrl },
        })
        .catch(() => {});
    });
    next();
  };
}

module.exports = audit;
