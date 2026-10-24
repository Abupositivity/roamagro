
const express = require('express');
const expressSession = require('express-session');
const path = require('path');
const request = require('supertest');

const createApp = require('../app');

const originalEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    MONGO_URI: process.env.MONGO_URI
};

const restoreEnvironmentValue = (key, value) => {
    if (value === undefined) {
        delete process.env[key];
    } else {
        process.env[key] = value;
    }
};

const createTestApp = () =>
    createApp({
        sessionStore: new expressSession.MemoryStore()
    });

describe('Application configuration and security', () => {
    beforeEach(() => {
        process.env.NODE_ENV = 'test';
        process.env.FRONTEND_URL = 'http://localhost:3000';
        process.env.SESSION_SECRET =
            'test-session-secret-for-app-tests';
    });

    afterAll(() => {
        Object.entries(originalEnvironment).forEach(([key, value]) => {
            restoreEnvironmentValue(key, value);
        });
    });

    test('rejects a malformed frontend origin', () => {
        process.env.FRONTEND_URL = 'not-a-valid-origin';

        expect(() => createTestApp()).toThrow(
            'Invalid FRONTEND_URL origin: not-a-valid-origin'
        );
    });

    test('rejects a frontend URL containing a path', () => {
        process.env.FRONTEND_URL =
            'http://localhost:3000/dashboard';

        expect(() => createTestApp()).toThrow(
            'FRONTEND_URL must contain valid origins without paths'
        );
    });

    test('rejects unsupported frontend protocols', () => {
        process.env.FRONTEND_URL = 'ftp://localhost:3000';

        expect(() => createTestApp()).toThrow(
            'FRONTEND_URL must contain valid origins without paths'
        );
    });

    test('rejects HTTP frontend origins in production', () => {
        process.env.NODE_ENV = 'production';
        process.env.FRONTEND_URL = 'http://localhost:3000';

        expect(() => createTestApp()).toThrow(
            'Production frontend origins must use HTTPS.'
        );
    });

    test('accepts an HTTPS frontend origin in production', async () => {
        process.env.NODE_ENV = 'production';
        process.env.FRONTEND_URL = 'https://roamagro.example';

        const app = createTestApp();

        expect(app.get('trust proxy')).toBe(1);

        const response = await request(app).get('/api/v1/health');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('accepts multiple valid frontend origins', async () => {
        process.env.FRONTEND_URL =
            'http://localhost:3000, http://localhost:3001';

        const app = createTestApp();

        const response = await request(app)
            .get('/api/v1/health')
            .set('Origin', 'http://localhost:3001');

        expect(response.status).toBe(200);
        expect(response.headers['access-control-allow-origin'])
            .toBe('http://localhost:3001');
        expect(response.headers['access-control-allow-credentials'])
            .toBe('true');
    });

    test('allows requests without an Origin header', async () => {
        const app = createTestApp();

        const response = await request(app).get('/api/v1/health');

        expect(response.status).toBe(200);
    });

    test('rejects an origin not in the configured allowlist', async () => {
        const app = createTestApp();

        const response = await request(app)
            .get('/api/v1/health')
            .set('Origin', 'https://untrusted.example');

        expect(response.status).toBe(403);
    });

    test('handles CORS preflight for an allowed origin', async () => {
        const app = createTestApp();

        const response = await request(app)
            .options('/api/v1/health')
            .set('Origin', 'http://localhost:3000')
            .set('Access-Control-Request-Method', 'GET')
            .set('Access-Control-Request-Headers', 'authorization');

        expect(response.status).toBe(204);
        expect(response.headers['access-control-allow-origin'])
            .toBe('http://localhost:3000');
        expect(response.headers['access-control-allow-credentials'])
            .toBe('true');
    });

    test('disables the X-Powered-By header', async () => {
        const app = createTestApp();

        const response = await request(app).get('/api/v1/health');

        expect(response.headers['x-powered-by']).toBeUndefined();
    });

    test('sets security headers on API responses', async () => {
        const app = createTestApp();

        const response = await request(app).get('/api/v1/health');

        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBeDefined();
        expect(response.headers['content-security-policy']).toBeDefined();
    });

    test('rejects an unknown route through the not-found handler', async () => {
        const app = createTestApp();

        const response = await request(app)
            .get('/route-that-does-not-exist');

        expect(response.status).toBe(404);
    });
});

describe('Production frontend fallback', () => {
    let staticSpy;
    let sendFileSpy;

    beforeEach(() => {
        process.env.NODE_ENV = 'production';
        process.env.FRONTEND_URL = 'https://roamagro.example';
        process.env.SESSION_SECRET =
            'test-session-secret-for-app-tests';

        // Isolate fallback routing from the physical frontend build.
        staticSpy = jest.spyOn(express, 'static')
            .mockImplementation(() => (req, res, next) => next());

        // Simulate a successful index.html response.
        sendFileSpy = jest.spyOn(express.response, 'sendFile')
            .mockImplementation(function (filePath) {
                return this.status(200)
                    .type('html')
                    .send('<html><body>RoamAgro frontend</body></html>');
            });
    });

    afterEach(() => {
        sendFileSpy.mockRestore();
        staticSpy.mockRestore();
    });

    test('serves the frontend for a client-side route', async () => {
        const app = createTestApp();

        const response = await request(app).get('/dashboard');

        expect(response.status).toBe(200);
        expect(response.text).toContain('RoamAgro frontend');
        expect(sendFileSpy).toHaveBeenCalledTimes(1);

        const sentPath = sendFileSpy.mock.calls[0][0];

        expect(path.basename(sentPath)).toBe('index.html');
        expect(sentPath).toContain(
            path.join('frontend', 'build')
        );
    });

    test('does not serve the frontend for an unknown API route', async () => {
        const app = createTestApp();

        const response = await request(app).get('/api/unknown');

        expect(response.status).toBe(404);
        expect(sendFileSpy).not.toHaveBeenCalled();
    });

    test('does not serve the frontend for an unknown versioned API route', async () => {
        const app = createTestApp();

        const response = await request(app)
            .get('/api/v1/unknown-endpoint');

        expect(response.status).toBe(404);
        expect(sendFileSpy).not.toHaveBeenCalled();
    });

    it('forwards frontend sendFile errors to the error handler', async () => {
        sendFileSpy.mockImplementation(function (filePath, callback) {
            const error = new Error('Frontend build unavailable');

            if (callback) {
                callback(error);
            }

            return this;
        });

        const response = await request(createTestApp())
            .get('/dashboard');

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            'An unexpected server error occurred.'
        );
    });
});