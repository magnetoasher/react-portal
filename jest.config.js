/** @format */

module.exports = {
  setTimeout: 10000,
  preset: 'ts-jest', // 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.svg$': 'jest-svg-transformer',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/!(target)/?(*.)+(spec|test).[jt]s?(x)'],
  setupFiles: ['./jest.setup.ts'],
  testPathIgnorePatterns: ['/.next/', '/.nest/', '/node_modules/'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
};
