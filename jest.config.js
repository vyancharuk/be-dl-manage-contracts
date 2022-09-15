module.exports = {
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.+(ts|js)',
        '**/?(*.)+(spec|test).+(ts|js)',
    ],

    setupFilesAfterEnv: ['<rootDir>/src/tests/test-setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],

};
