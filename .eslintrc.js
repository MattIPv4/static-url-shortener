module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    plugins: [
        'jsdoc',
    ],
    extends: [
        'eslint:recommended',
        'plugin:jsdoc/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2018,
    },
    settings: {
        jsdoc: {
            tagNamePreference: {
                returns: 'return',
            },
            preferredTypes: {
                Function: 'function',
            },
        },
    },
    rules: {
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always',
            },
        ],
        'arrow-parens': [
            'error',
            'as-needed',
        ],
        'arrow-spacing': 'error',
        'object-curly-spacing': [
            'error',
            'always',
        ],
        'array-bracket-spacing': [
            'error',
            'always',
        ],
        'no-console': 'off',
        'no-var': 'error',
        'prefer-const': 'error',
        indent: [
            'error',
            4,
        ],
        semi: [
            'error',
            'always',
        ],
        quotes: [
            'error',
            'single',
        ],
        'quote-props': [
            'error',
            'as-needed',
        ],
        'object-curly-newline': [
            'error',
            {
                multiline: true,
                consistent: true,
            },
        ],
        'comma-dangle': [
            'error',
            'always-multiline',
        ],
        'comma-spacing': [
            'error',
            {
                before: false,
                after: true,
            },
        ],
        'comma-style': [
            'error',
            'last',
        ],
        'eol-last': 'error',
        'key-spacing': [
            'error',
            {
                beforeColon: false,
                afterColon: true,
            },
        ],
        'keyword-spacing': [
            'error',
            {
                before: true,
                after: true,
            },
        ],
        'block-spacing': 'error',
        'space-in-parens': [
            'error',
            'never',
        ],
        'space-before-blocks': 'error',
        'no-trailing-spaces': 'error',
        'semi-spacing': [
            'error',
            {
                before: false,
                after: true,
            },
        ],
        'space-infix-ops': 'error',
        'linebreak-style': [
            'error',
            'unix',
        ],
        'max-len': [
            'error',
            {
                code: 120,
                ignoreComments: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        'jsdoc/require-returns-description': 'off',
        'jsdoc/no-undefined-types': 'off',
        'jsdoc/newline-after-description': [
            'error',
            'never',
        ],
        'jsdoc/require-jsdoc': [
            'error',
            {
                require: {
                    ArrowFunctionExpression: true,
                    ClassDeclaration: true,
                    ClassExpression: true,
                    FunctionDeclaration: true,
                    FunctionExpression: true,
                    MethodDefinition: true,
                },
            },
        ],
    },
};
