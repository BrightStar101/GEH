/**
 * errorMiddleware.js
 * ------------------
 * Global error handler for the GEH backend.
 * Logs error stack trace and ensures consistent API response structure.
 *
 * Applied at the end of the middleware chain to catch async/route exceptions.
 */

/**
 * Global error-handling middleware for all API routes
 * Logs standardized diagnostic payloads and ensures safe JSON responses.
 *
 * @param {Error} err - Captured error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next() middleware
 */
function errorHandler(err, req, res, next) {
  const errorInfo = {
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    error: err.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  console.error('❌ [GEH ErrorHandler] Uncaught Exception:', errorInfo);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: 'An unexpected error occurred.',
    traceId: req.headers['x-request-id'] || null,
    environment: process.env.NODE_ENV || 'production',
  });
}

module.exports = {
  errorHandler
};
