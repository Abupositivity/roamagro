module.exports = (err, req, res, next) => {

    console.error('❌ Error:', err);

    res.status(err.statusCode || 500).json({

        success: false,

        status: err.status || 'error',

        message: err.message || 'Internal Server Error',

        errors: err.errors || null,

        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
        }),

    });

};