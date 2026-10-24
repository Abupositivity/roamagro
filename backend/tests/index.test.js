
const connectDB = require('../config/db');
const createApp = require('../app');

jest.mock('../config/db', () => jest.fn());
jest.mock('../app', () => jest.fn());

const { startServer, validateEnvironment } = require('../index');

const ENV_KEYS = [
    'MONGO_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
    'FRONTEND_URL',
    'NODE_ENV',
    'PORT'
];

const originalEnvironment = Object.fromEntries(
    ENV_KEYS.map(key => [key, process.env[key]])
);

describe('Backend startup and environment validation', () => {
    let fakeServer;
    let fakeApp;
    let exitSpy;
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        process.env.MONGO_URI = 'mongodb://localhost:27017/roamagro_test';
        process.env.JWT_SECRET = 'j'.repeat(40);
        process.env.SESSION_SECRET = 's'.repeat(40);
        process.env.FRONTEND_URL = 'http://localhost:3000';
        process.env.NODE_ENV = 'test';
        process.env.PORT = '5001';

        fakeServer = {
            on: jest.fn()
        };

        fakeApp = {
            listen: jest.fn((port, callback) => {
                if (callback) callback();
                return fakeServer;
            })
        };

        connectDB.mockReset().mockResolvedValue(undefined);
        createApp.mockReset().mockReturnValue(fakeApp);

        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined);
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();

        for (const key of ENV_KEYS) {
            const originalValue = originalEnvironment[key];

            if (originalValue === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = originalValue;
            }
        }
    });

    describe('validateEnvironment', () => {
        test('accepts valid configuration and returns allowed origins', () => {
            expect(validateEnvironment()).toEqual([
                'http://localhost:3000'
            ]);
        });

        test('rejects missing required environment variables', () => {
            delete process.env.MONGO_URI;
            delete process.env.JWT_SECRET;

            expect(() => validateEnvironment()).toThrow(
                'Missing required environment variables: MONGO_URI, JWT_SECRET'
            );
        });

        test('rejects a JWT secret shorter than 32 characters', () => {
            process.env.JWT_SECRET = 'too-short';

            expect(() => validateEnvironment()).toThrow(
                'JWT_SECRET must contain at least 32 characters.'
            );
        });

        test('rejects a session secret shorter than 32 characters', () => {
            process.env.SESSION_SECRET = 'too-short';

            expect(() => validateEnvironment()).toThrow(
                'SESSION_SECRET must contain at least 32 characters.'
            );
        });

        test('requires FRONTEND_URL in production', () => {
            process.env.NODE_ENV = 'production';
            delete process.env.FRONTEND_URL;

            expect(() => validateEnvironment()).toThrow(
                'FRONTEND_URL must be configured in production.'
            );
        });

        test('rejects malformed frontend origins', () => {
            process.env.FRONTEND_URL = 'not-a-url';

            expect(() => validateEnvironment()).toThrow(
                'Invalid FRONTEND_URL origin: not-a-url'
            );
        });

        test('rejects frontend URLs containing paths', () => {
            process.env.FRONTEND_URL =
                'http://localhost:3000/dashboard';

            expect(() => validateEnvironment()).toThrow(
                'FRONTEND_URL must contain valid origins without paths'
            );
        });

        test('rejects unsupported frontend protocols', () => {
            process.env.FRONTEND_URL = 'ftp://localhost:3000';

            expect(() => validateEnvironment()).toThrow(
                'FRONTEND_URL must contain valid origins without paths'
            );
        });

        test('rejects HTTP origins in production', () => {
            process.env.NODE_ENV = 'production';
            process.env.FRONTEND_URL = 'http://localhost:3000';

            expect(() => validateEnvironment()).toThrow(
                'Production frontend origins must use HTTPS.'
            );
        });

        test('accepts multiple HTTPS origins in production', () => {
            process.env.NODE_ENV = 'production';
            process.env.FRONTEND_URL =
                'https://roamagro.example, https://admin.roamagro.example';

            expect(validateEnvironment()).toEqual([
                'https://roamagro.example',
                'https://admin.roamagro.example'
            ]);
        });
    });

    describe('startServer', () => {
        test('connects to the database before starting the server', async () => {
            const server = await startServer();

            expect(connectDB).toHaveBeenCalledTimes(1);
            expect(createApp).toHaveBeenCalledTimes(1);
            expect(fakeApp.listen).toHaveBeenCalledWith(
                '5001',
                expect.any(Function)
            );
            expect(server).toBe(fakeServer);
            expect(fakeServer.on).toHaveBeenCalledWith(
                'error',
                expect.any(Function)
            );
            expect(exitSpy).not.toHaveBeenCalled();
        });

        test('uses port 5000 when PORT is not configured', async () => {
            delete process.env.PORT;

            await startServer();

            expect(fakeApp.listen).toHaveBeenCalledWith(
                5000,
                expect.any(Function)
            );
        });

        test('does not connect to the database when validation fails', async () => {
            delete process.env.JWT_SECRET;

            await startServer();

            expect(connectDB).not.toHaveBeenCalled();
            expect(createApp).not.toHaveBeenCalled();
            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'RoamAgro startup failed:',
                expect.stringContaining('Missing required environment variables')
            );
        });

        test('exits when the database connection fails', async () => {
            connectDB.mockRejectedValue(new Error('Database connection failed'));

            await startServer();

            expect(createApp).not.toHaveBeenCalled();
            expect(fakeApp.listen).not.toHaveBeenCalled();
            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'RoamAgro startup failed:',
                'Database connection failed'
            );
        });

        test('exits when the HTTP server emits an error', async () => {
            const server = await startServer();
            const errorHandler = fakeServer.on.mock.calls.find(
                ([event]) => event === 'error'
            )[1];

            const error = new Error('Port already in use');
            errorHandler(error);

            expect(server).toBe(fakeServer);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'RoamAgro server failed to start:',
                'Port already in use'
            );
            expect(exitSpy).toHaveBeenCalledWith(1);
        });
    });
});