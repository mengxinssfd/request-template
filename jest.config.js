module.exports = {
  // 默认为node
  // testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  collectCoverageFrom: ['packages/**/src/**.ts', '!**/packages/**/dist/**'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  testRegex: '(/__tests__/.*\\.(test|spec))\\.(jsx?|tsx?)$',
  moduleNameMapper: {
    '^request-template$': '<rootDir>/packages/request-template/src',
    '^@request-template/(.*?)$': '<rootDir>/packages/$1/src',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
