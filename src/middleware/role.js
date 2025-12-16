export const role = (...allowedRoles) => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
          });
        }
  
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            status: 'error',
            message: 'You do not have permission to perform this action'
          });
        }
  
        next();
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    };
  };
  
  export const userOnly = role('user');
  export const vendorOnly = role('vendor');
  export const adminOnly = role('admin');
  export const userOrVendor = role('user', 'vendor');
  export const vendorOrAdmin = role('vendor', 'admin');