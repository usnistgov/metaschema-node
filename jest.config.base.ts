export default {
    clearMocks: true,
    collectCoverage: true,
    coverageProvider: 'v8',
    testEnvironment: 'node',
    // ts-jest doesn't support nodenext module resolution?
    moduleNameMapper: {
        '(.*)\\.js': '$1',
    },
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
};
