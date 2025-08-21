const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: ['tsconfig.json', 'tsconfig.dev.json'],
                sourceType: 'module',
                tsconfigRootDir: process.cwd(),
            },
            globals: {
                process: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                global: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'import': importPlugin,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
            ],
            'object-curly-spacing': ['error', 'always'],
            'quotes': ['error', 'single'],
            'import/no-unresolved': 0,
            'indent': 'off',
            'require-jsdoc': 'off',
            'valid-jsdoc': 'off',
            'prefer-promise-reject-errors': 'off',
            'space-before-function-paren': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'camelcase': 'off',
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
    },
    {
        files: ['test/**/*.ts', 'test/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
            },
        },
    },
    {
        ignores: ['lib/**/*'],
    },
];