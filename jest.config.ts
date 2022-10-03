import { Config } from 'jest';

import base from './jest.config.base';

export default {
    ...base,
    projects: ['<rootDir>/packages/*/jest.config.ts'],
} as Config;
