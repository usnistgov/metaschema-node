import base from './jest.config.base';

export default {
    ...base,
    coverageDirectory: '<rootDir>/coverage',
    projects: ['<rootDir>/packages/*/jest.config.ts'],
};
