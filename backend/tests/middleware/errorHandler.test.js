
const errorHandler = require('../../middleware/errorHandler');

describe('errorHandler middleware', () => {
    let req;
    let res;
    let next;
    let consoleErrorSpy;
    let originalNodeEnv;

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
            const error = Object.assign(new Error('Invalid input'), {
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
        });

        it('uses status when statusCode is not provided', () => {
            const error = Object.assign(new Error('Not found'), {
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
            const error = Object.assign(new Error('Something failed'), {
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
            const error = Object.assign(new Error('Validation failed'), {
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
    });

    describe('client errors', () => {
        it('returns validation errors when supplied', () => {
            const validationErrors = [
                { field: 'email', message: 'Email is required' }
            ];
            const error = Object.assign(new Error('Validation failed'), {
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
            const error = Object.assign(new Error('Forbidden'), {
                statusCode: 403
            });

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    status: 'fail',
                    message: 'Forbidden',
                    errors: null
                })
            );
        });

        it('returns null errors when the errors property is falsy', () => {
            const error = Object.assign(new Error('Bad request'), {
                statusCode: 400,
                errors: undefined
            });

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    errors: null
                })
            );
        });

        it('uses a fallback message when the error message is empty', () => {
            const error = Object.assign(new Error(''), {
                statusCode: 400
            });

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Request failed.'
                })
            );
        });
    });

    describe('request body errors', () => {
        it('returns a specific message for malformed JSON', () => {
            const error = Object.assign(new Error('Parser details'), {
                status: 400,
                type: 'entity.parse.failed'
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    status: 'fail',
                    message: 'Invalid JSON request body.',
                    errors: null
                })
            );
        });

        it('returns a specific message for an oversized request body', () => {
            const error = Object.assign(new Error('Payload too large'), {
                status: 413,
                type: 'entity.too.large'
            });

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(413);
            expect(res.json).toHaveBeenCalledWith(
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
        it('returns the error message and stack and logs request details', () => {
            process.env.NODE_ENV = 'development';

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

            expect(consoleErrorSpy).toHaveBeenCalledWith('API error:', {
                method: 'GET',
                path: '/api/test',
                statusCode: 500,
                message: 'Database unavailable'
            });
        });

        it('does not include a stack when the error has no stack', () => {
            process.env.NODE_ENV = 'development';

            const error = {
                message: 'Server failure',
                statusCode: 500
            };

            errorHandler(error, req, res, next);

            const response = res.json.mock.calls[0][0];

            expect(response).not.toHaveProperty('stack');
            expect(response.message).toBe('Server failure');
        });

        it('uses the fallback message when a server error has no message', () => {
            process.env.NODE_ENV = 'development';

            errorHandler({ statusCode: 500 }, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Request failed.'
                })
            );
        });
    });

    describe('server errors in production', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'production';
        });

        it('hides internal error details and omits the stack', () => {
            const error = new Error('Sensitive database credentials');

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                status: 'error',
                message: 'An unexpected server error occurred.',
                errors: null
            });

            expect(res.json.mock.calls[0][0]).not.toHaveProperty('stack');
            expect(JSON.stringify(res.json.mock.calls[0][0]))
                .not.toContain('Sensitive database credentials');
        });

        it('logs a generic message instead of the internal error message', () => {
            const error = new Error('Private internal details');

            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).toHaveBeenCalledWith('API error:', {
                method: 'GET',
                path: '/api/test',
                statusCode: 500,
                message: 'Unexpected server error'
            });
        });

        it('preserves the specific malformed JSON message', () => {
            const error = Object.assign(new Error('Parser internals'), {
                statusCode: 400,
                type: 'entity.parse.failed'
            });

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'fail',
                    message: 'Invalid JSON request body.'
                })
            );
        });

        it('preserves the specific oversized body message', () => {
            const error = Object.assign(new Error('Body internals'), {
                statusCode: 413,
                type: 'entity.too.large'
            });

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'fail',
                    message: 'Request body is too large.'
                })
            );
        });

        it('does not expose the stack for client errors', () => {
            const error = Object.assign(new Error('Invalid input'), {
                statusCode: 400
            });

            errorHandler(error, req, res, next);

            expect(res.json.mock.calls[0][0]).not.toHaveProperty('stack');
        });
    });

    describe('server error logging', () => {
        it.each([500, 502, 503])(
            'logs server errors with status %i',
            (statusCode) => {
                const error = Object.assign(new Error('Service failed'), {
                    statusCode
                });

                errorHandler(error, req, res, next);

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'API error:',
                    expect.objectContaining({
                        method: 'GET',
                        path: '/api/test',
                        statusCode
                    })
                );
            }
        );

        it('does not log client errors', () => {
            const error = Object.assign(new Error('Not found'), {
                statusCode: 404
            });

            errorHandler(error, req, res, next);

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });
});