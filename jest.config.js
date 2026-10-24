module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '<rootDir>/backend/tests/**/*.test.js',
        '<rootDir>/backend/tests/**/*.spec.js'
    ],
    collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/tests/**',
        '!backend/**/__tests__/**',
        '!backend/**/node_modules/**',
        '!backend/index.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'json', 'clover'],
    clearMocks: true,
    restoreMocks: true
};
