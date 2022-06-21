export default {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
    testEnvironment: 'node',
    // ts-jest doesn't support nodenext module resolution?
    moduleNameMapper: {
        '(.*)\\.js': '$1',
    },
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    // projects: ['packages/metaschema-model'],
};
