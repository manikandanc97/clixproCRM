const { getRoleAccess } = require("../config/rbac.config");

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // req.user comes from auth middleware
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access forbidden: insufficient permissions",
        });
      }

      req.userAccess = getRoleAccess(userRole);
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Role validation failed",
      });
    }
  };
};

const permissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      const access = getRoleAccess(userRole);
      const hasAllPermissions = requiredPermissions.every((permission) =>
        access.permissions.includes(permission),
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: "Access forbidden: permission denied",
        });
      }

      req.userAccess = access;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission validation failed",
      });
    }
  };
};

const hasAnyPermissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      const access = getRoleAccess(userRole);
      const hasAtLeastOne = requiredPermissions.some((permission) =>
        access.permissions.includes(permission),
      );

      if (!hasAtLeastOne) {
        return res.status(403).json({
          success: false,
          message: "Access forbidden: permission denied",
        });
      }

      req.userAccess = access;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission validation failed",
      });
    }
  };
};

module.exports = {
  roleMiddleware,
  permissionMiddleware,
  hasAnyPermissionMiddleware,
};
