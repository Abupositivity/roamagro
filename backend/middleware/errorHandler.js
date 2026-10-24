module.exports = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const candidateStatus = err.statusCode || err.status;

    const statusCode =
        Number.isInteger(candidateStatus) &&
        candidateStatus >= 400 &&
        candidateStatus <= 599
            ? candidateStatus
            : 500;

    const isServerError = statusCode >= 500;
    const isProduction = process.env.NODE_ENV === 'production';

    let message = err.message || 'Request failed.';

    if (err.type === 'entity.parse.failed') {
        message = 'Invalid JSON request body.';
    } else if (err.type === 'entity.too.large') {
        message = 'Request body is too large.';
    } else if (isServerError && isProduction) {
        message = 'An unexpected server error occurred.';
    }

    if (isServerError) {
        console.error('API error:', {
            method: req.method,
            path: req.path,
            statusCode,
            message: isProduction
                ? 'Unexpected server error'
                : err.message
        });
    }

    const response = {
        success: false,
        status: isServerError ? 'error' : 'fail',
        message,
        errors: isServerError ? null : (err.errors || null)
    };

    if (!isProduction && err.stack) {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
};