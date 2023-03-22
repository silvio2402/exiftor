// eslint-disable-next-line jest/no-jest-import
import type { Config } from 'jest';

/**
 * See https://jestjs.io/docs/configuration.
 */
const config: Config = {
  // rootDir: './',
  roots: ['../src/main/__tests__'],
  // testMatch: [
  //   '**/__tests__/**/*.[jt]s?(x)',
  //   '**/?(*.)+(spec|test).[tj]s?(x)',
  // ],
  moduleDirectories: ['node_modules', 'release/app/node_modules', 'src'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/.erb/mocks/fileMock.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  setupFiles: ['../.erb/scripts/check-build-exists.ts'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['release/app/dist/'],
  transform: {
    '\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
};

export default config;
