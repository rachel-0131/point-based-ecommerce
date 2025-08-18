/* eslint-disable quote-props */
module.exports = {
    root: true,
    env: {
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        sourceType: 'module',
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: [
        '/lib/**/*', // Ignore built files.
    ],
    plugins: ['@typescript-eslint/eslint-plugin'],
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
        ],
        'object-curly-spacing': ['error', 'always'],
        quotes: ['error', 'single'],
        'import/no-unresolved': 0,
        indent: 'off',
        'require-jsdoc': 'off',
        'valid-jsdoc': 'off',
        'prefer-promise-reject-errors': 'off',
        'space-before-function-paren': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        camelcase: 'off',
        'new-cap': 'off',
        'operator-linebreak': [
            'error',
            'after',
            {
                overrides: {
                    ':': 'before',
                    '?': 'before',
                },
            },
        ],
    },
};