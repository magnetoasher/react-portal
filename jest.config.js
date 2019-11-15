/** @format */

module.exports = {
  testTimeout: 180000,
  preset: 'ts-jest', // 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/apps/portal/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/apps/portal/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.svg$': 'jest-svg-transformer',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/(*.)+(spec|test).[jt]s?(x)'],
  setupFiles: ['./jest.setup.ts'],
  testPathIgnorePatterns: ['/.next/', '/node_modules/', '/target/'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
};
