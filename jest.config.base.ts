import { Config } from 'jest';

export default {
    clearMocks: true,
    // override with --coverage flag when running jest
    collectCoverage: false,
    coverageDirectory: '<rootDir>/coverage',
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 50,
            lines: 80,
            statements: 80,
        },
    },
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
} as Config;
