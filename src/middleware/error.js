const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
  
    let statusCode = 500;
    let message = 'Internal server error';
  
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }
  
    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }
  
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate key error';
      }
    }
  
    if (err.message && err.message.includes('Firebase')) {
      statusCode = 401;
      message = err.message;
    }
  
    if (err.message && err.message.includes('not found')) {
      statusCode = 404;
      message = err.message;
    }
  
    if (err.message && (err.message.includes('not authorized') || err.message.includes('permission'))) {
      statusCode = 403;
      message = err.message;
    }
  
    if (err.message && (err.message.includes('invalid') || err.message.includes('required'))) {
      statusCode = 400;
      message = err.message;
    }
  
    res.status(statusCode).json({
      status: 'error',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  export default errorHandler;