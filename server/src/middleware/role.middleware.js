const { sendError } = require('../utils/response');

/**
 * Role-based authorization middleware.
 * Ensures the authenticated user has at least one of the permitted roles.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. This resource requires one of the following roles: ${allowedRoles.join(', ')}.`,
        403
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };
