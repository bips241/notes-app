const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Custom application errors
  if (err.message === 'User with this email or username already exists') {
    return res.status(400).json({
      message: 'User with this email or username already exists'
    });
  }

  if (err.message === 'Invalid credentials or account deactivated') {
    return res.status(401).json({
      message: 'Invalid credentials or account deactivated'
    });
  }

  if (err.message === 'Account is deactivated') {
    return res.status(401).json({
      message: 'Account is deactivated'
    });
  }

  if (err.message === 'Invalid credentials') {
    return res.status(401).json({
      message: 'Invalid credentials'
    });
  }

  if (err.message === 'Note not found or access denied') {
    return res.status(404).json({
      message: 'Note not found'
    });
  }

  if (err.message === 'Note not found or you are not the owner') {
    return res.status(403).json({
      message: 'Access denied'
    });
  }

  if (err.message === 'Note not found or no write permission') {
    return res.status(403).json({
      message: 'Insufficient permissions'
    });
  }

  if (err.message === 'User not found') {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  if (err.message === 'Email already exists' || err.message === 'Username already exists') {
    return res.status(400).json({
      message: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;