// src/helpers/errorHandler.js

/**
 * Express error handler.
 * Catches any error passed to next(err) or thrown in async routes,
 * logs it, and returns a clean JSON response.
 */
function errorHandler(err, req, res, next) {
    // 1) Log full error for debugging
    console.error(err);

    // 2) Determine status code (allow controllers to set err.status)
    const status = err.statusCode || err.status || 500;

    // 3) Send JSON error response
    res.status(status).json({
        error: err.message || 'Internal Server Error'
    });
}

module.exports = errorHandler;