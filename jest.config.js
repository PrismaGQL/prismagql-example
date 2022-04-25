/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transform: {
    '^.+\\.(t|j)s$': ['@swc-node/jest'],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  setupFiles: ['jest-date-mock'],
  globals: {
    executeId: `${Date.now()}-${Math.round(Math.random() * 100)}`,
  },
  setupFilesAfterEnv: ['./src/jest.setup.ts'],
}
