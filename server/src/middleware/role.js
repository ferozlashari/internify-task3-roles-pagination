const AppError = require('../utils/AppError');

// Role-based access control. Usage: router.get('/', protect, authorize('admin'), handler)
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: you do not have permission to perform this action', 403));
  }
  next();
};
