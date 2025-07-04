const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Admin access required' 
      });
    }

    next();
  };
};

const adminOnly = roleMiddleware(['admin']);
const userOrAdmin = roleMiddleware(['user', 'admin']);

module.exports = {
  roleMiddleware,
  adminOnly,
  userOrAdmin
};