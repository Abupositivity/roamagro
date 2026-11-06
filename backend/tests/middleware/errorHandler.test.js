const errorHandler = require('../../middleware/errorHandler');

describe('errorHandler middleware', () => {
    let req;
    let res;
    let next;
    let consoleErrorSpy;
    let originalNodeEnv;

    const makeError = (message, properties = {}) =>
        Object.assign(new Error(message), properties);

    const getResponse = () => res.json.mock.calls[0][0];

    const getLogDetails = () =>
        consoleErrorSpy.mock.calls[0][1];

    beforeEach(() => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';

        req = {
            method: 'GET',
            path: '/api/test'
        };

        res = {
            headersSent: false,
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        next = jest.fn();

        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();

        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = originalNodeEnv;
        }
    });

    describe('when response headers have already been sent', () => {
        it('passes the error to next without sending another response', () => {
            const error = new Error('Headers already sent');
            res.headersSent = true;

            errorHandler(error, req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe('HTTP status code handling', () => {
        it('uses a valid statusCode property', () => {
            const error = makeError('Invalid input', {
                statusCode: 422
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    status: 'fail',
                    message: 'Invalid input',
                    errors: null
                })
            );

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('uses status when statusCode is not provided', () => {
            const error = makeError('Not found', {
                status: 404
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    status: 'fail',
                    message: 'Not found'
                })
            );
        });

        it.each([
            ['status below 400', 399],
            ['status above 599', 600],
            ['string status', '400'],
            ['fractional status', 400.5],
            ['zero status', 0]
        ])('defaults to 500 for %s', (_description, status) => {
            const error = makeError('Something failed', {
                status
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    status: 'error',
                    message: 'Something failed',
                    errors: null
                })
            );

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        });

        it('prefers statusCode when both status fields are present', () => {
            const error = makeError('Validation failed', {
                statusCode: 422,
                status: 400
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
        });

        it('uses 500 when no valid status is supplied', () => {
            const error = new Error('Unexpected failure');

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('uses a valid statusCode even when status is invalid', () => {
            const error = makeError('Invalid request', {
                statusCode: 409,
                status: 'invalid'
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(getResponse().status).toBe('fail');
        });

        it('uses 500 when statusCode is invalid and nonzero', () => {
            const error = makeError('Unexpected failure', {
                statusCode: '400',
                status: 404
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(getResponse().status).toBe('error');
        });

        it.each([400, 401, 403, 404, 409, 422, 429])(
            'classifies HTTP %i as a client error',
            (statusCode) => {
                const error = makeError('Request rejected', {
                    statusCode
                });

                errorHandler(error, req, res, next);

                expect(res.status).toHaveBeenCalledWith(
                    statusCode
                );

                expect(getResponse()).toEqual(
                    expect.objectContaining({
                        success: false,
                        status: 'fail',
                        message: 'Request rejected'
                    })
                );

                expect(consoleErrorSpy).not.toHaveBeenCalled();
            }
        );
    });

    describe('client errors', () => {
        it('returns validation errors when supplied', () => {
            const validationErrors = [
                {
                    field: 'email',
                    message: 'Email is required'
                }
            ];

            const error = makeError('Validation failed', {
                statusCode: 400,
                errors: validationErrors
            });

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                status: 'fail',
                message: 'Validation failed',
                errors: validationErrors,
                stack: expect.any(String)
            });

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('returns null errors when the error has no errors property', () => {
            const error = makeError('Forbidden', {
                statusCode: 403
            });

            errorHandler(error, req, res, next);

            expect(getResponse()).toEqual(
                expect.objectContaining({
                    success: false,
                    status: 'fail',
                    message: 'Forbidden',
                    errors: null
                })
            );
        });

        it('returns null errors when the errors property is falsy', () => {
            const error = makeError('Bad request', {
                statusCode: 400,
                errors: undefined
            });

            errorHandler(error, req, res, next);

            expect(getResponse().errors).toBeNull();
        });

        it('uses a fallback message when the error message is empty', () => {
            const error = makeError('', {
                statusCode: 400
            });

            errorHandler(error, req, res, next);

            expect(getResponse().message).toBe(
                'Request failed.'
            );
        });

        it('does not log validation errors', () => {
            const error = makeError('Invalid field', {
                statusCode: 422,
                errors: [
                    {
                        field: 'name',
                        message: 'Invalid name'
                    }
                ]
            });

            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(getResponse().status).toBe('fail');
        });
    });

    describe('request body errors', () => {
        it('returns a specific message for malformed JSON', () => {
            const error = makeError('Parser details', {
                status: 400,
                type: 'entity.parse.failed'
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(getResponse()).toEqual(
                expect.objectContaining({
                    success: false,
                    status: 'fail',
                    message: 'Invalid JSON request body.',
                    errors: null
                })
            );
        });

        it('returns a specific message for an oversized request body', () => {
            const error = makeError('Payload too large', {
                status: 413,
                type: 'entity.too.large'
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(413);

            expect(getResponse()).toEqual(
                expect.objectContaining({
                    success: false,
                    status: 'fail',
                    message: 'Request body is too large.',
                    errors: null
                })
            );
        });
    });

    describe('server errors in development', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('returns the error message and stack and logs request details', () => {
            const error = new Error('Database unavailable');

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                status: 'error',
                message: 'Database unavailable',
                errors: null,
                stack: expect.any(String)
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'API error:',
                {
                    method: 'GET',
                    path: '/api/test',
                    statusCode: 500,
                    errorName: 'Error',
                    errorCode: undefined,
                    errorMessage: 'Database unavailable',
                    stack: error.stack
                }
            );
        });

        it('logs the error name and code when provided', () => {
            const error = makeError('Database connection failed', {
                name: 'MongoServerError',
                code: 11000,
                statusCode: 500
            });

            errorHandler(error, req, res, next);

            expect(getLogDetails()).toEqual({
                method: 'GET',
                path: '/api/test',
                statusCode: 500,
                errorName: 'MongoServerError',
                errorCode: 11000,
                errorMessage: 'Database connection failed',
                stack: error.stack
            });
        });

        it('does not include a stack when the error has no stack', () => {
            const error = {
                message: 'Server failure',
                statusCode: 500
            };

            errorHandler(error, req, res, next);

            expect(getResponse()).not.toHaveProperty('stack');
            expect(getResponse().message).toBe('Server failure');
        });

        it('uses the fallback message when a server error has no message', () => {
            errorHandler(
                { statusCode: 500 },
                req,
                res,
                next
            );

            expect(getResponse().message).toBe(
                'Request failed.'
            );
        });

        it('does not expose server error validation details', () => {
            const error = makeError('Internal failure', {
                statusCode: 500,
                errors: [
                    {
                        secret: 'internal-data'
                    }
                ]
            });

            errorHandler(error, req, res, next);

            expect(getResponse().errors).toBeNull();
        });
    });

    describe('server errors in production', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'production';
        });

        it('hides internal error details and omits the stack', () => {
            const error = new Error(
                'Sensitive database credentials'
            );

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                status: 'error',
                message: 'An unexpected server error occurred.',
                errors: null
            });

            expect(getResponse()).not.toHaveProperty('stack');

            expect(JSON.stringify(getResponse()))
                .not.toContain('Sensitive database credentials');
        });

        it('logs the original error details without exposing them in the response', () => {
            const error = new Error('Private internal details');

            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'API error:',
                {
                    method: 'GET',
                    path: '/api/test',
                    statusCode: 500,
                    errorName: 'Error',
                    errorCode: undefined,
                    errorMessage: 'Private internal details',
                    stack: error.stack
                }
            );

            expect(getResponse().message).toBe(
                'An unexpected server error occurred.'
            );

            expect(JSON.stringify(getResponse()))
                .not.toContain('Private internal details');
        });

        it('preserves the specific malformed JSON message', () => {
            const error = makeError('Parser internals', {
                statusCode: 400,
                type: 'entity.parse.failed'
            });

            errorHandler(error, req, res, next);

            expect(getResponse()).toEqual(
                expect.objectContaining({
                    status: 'fail',
                    message: 'Invalid JSON request body.'
                })
            );
        });

        it('preserves the specific oversized body message', () => {
            const error = makeError('Body internals', {
                statusCode: 413,
                type: 'entity.too.large'
            });

            errorHandler(error, req, res, next);

            expect(getResponse()).toEqual(
                expect.objectContaining({
                    status: 'fail',
                    message: 'Request body is too large.'
                })
            );
        });

        it('does not expose the stack for client errors', () => {
            const error = makeError('Invalid input', {
                statusCode: 400
            });

            errorHandler(error, req, res, next);

            expect(getResponse()).not.toHaveProperty('stack');
        });

        it('preserves safe client error messages', () => {
            const error = makeError('Access denied', {
                statusCode: 403
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(getResponse().message).toBe('Access denied');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('hides validation details for server errors', () => {
            const error = makeError('Internal validation failed', {
                statusCode: 500,
                errors: [
                    {
                        field: 'internalSecret',
                        message: 'Private value'
                    }
                ]
            });

            errorHandler(error, req, res, next);

            expect(getResponse()).toEqual({
                success: false,
                status: 'error',
                message: 'An unexpected server error occurred.',
                errors: null
            });
        });

        it('does not expose error names or codes in the response', () => {
            const error = makeError('Internal database failure', {
                statusCode: 503,
                name: 'MongoServerError',
                code: 11000
            });

            errorHandler(error, req, res, next);

            const response = getResponse();

            expect(response).not.toHaveProperty('errorName');
            expect(response).not.toHaveProperty('errorCode');
            expect(response).not.toHaveProperty('errorMessage');
            expect(response).not.toHaveProperty('stack');

            expect(response.message).toBe(
                'An unexpected server error occurred.'
            );

            expect(getLogDetails()).toEqual(
                expect.objectContaining({
                    errorName: 'MongoServerError',
                    errorCode: 11000,
                    errorMessage: 'Internal database failure'
                })
            );
        });
    });

    describe('server error logging', () => {
        it.each([500, 502, 503])(
            'logs server errors with status %i',
            (statusCode) => {
                const error = makeError('Service failed', {
                    statusCode
                });

                errorHandler(error, req, res, next);

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'API error:',
                    expect.objectContaining({
                        method: 'GET',
                        path: '/api/test',
                        statusCode,
                        errorName: 'Error',
                        errorMessage: 'Service failed',
                        stack: error.stack
                    })
                );
            }
        );

        it('logs the request method and path', () => {
            req.method = 'POST';
            req.path = '/api/marketplace';

            const error = makeError('Listing creation failed', {
                statusCode: 500
            });

            errorHandler(error, req, res, next);

            expect(getLogDetails()).toEqual(
                expect.objectContaining({
                    method: 'POST',
                    path: '/api/marketplace',
                    statusCode: 500
                })
            );
        });

        it('does not log client errors', () => {
            const error = makeError('Not found', {
                statusCode: 404
            });

            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('logs server errors exactly once', () => {
            const error = makeError('Unexpected failure', {
                statusCode: 500
            });

            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        });

        it('does not call next after sending an error response', () => {
            const error = makeError('Unexpected failure', {
                statusCode: 500
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(next).not.toHaveBeenCalled();
        });
    });
});