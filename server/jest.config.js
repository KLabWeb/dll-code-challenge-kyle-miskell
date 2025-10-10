export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const roots = ['<rootDir>/tests'];
export const testMatch = ['**/*.test.ts'];
export const collectCoverageFrom = [
  'src/**/*.ts',
  '!src/**/*.d.ts',
  '!src/index.ts'
];
export const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1'
};
export const coverageThreshold = {
  global: {
    statements: 90,
    branches: 75,
    functions: 70,
    lines: 90
  }
};
