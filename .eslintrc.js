/** @format */

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'graphql',
    'json',
    'react',
    'react-hooks',
    'eslint-comments',
    'jest',
    'promise',
    'prettier',
    'jsx-a11y'
  ],
  settings: {
    'react': {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
    'import/ignore': ['.coffee$', '.(scss|less|css)$', '.(svg|png|jpe?g|webp|gif)(\\?*)$'],
  },
  globals: {
    window: true,
    document: true,
    process: true,
    __DEV__: true,
    __SERVER__: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/babel',
    'prettier/react',
    'plugin:jsx-a11y/recommended'
  ],
  parserOptions: {
    sourceType: 'module',
    jsx: true,
    useJSXTextNode: true,
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        parser: 'typescript',
        printWidth: 120,
        singleQuote: true,
        useTabs: false,
        tabWidth: 2,
        semi: true,
        bracketSpacing: true,
        trailingComma: 'all',
        arrowParens: 'always',
        insertPragma: true,
        quoteProps: 'consistent',
        jsxSingleQuote: false,
        jsxBracketSameLine: false,
        htmlWhitespaceSensivity: 'css',
        proseWrap: 'never',
      },
    ],
    // TODO: what ?!
    'react/jsx-props-no-spreading': 0,
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    'no-confusing-arrow': ['error', { allowParens: true }],
    'max-len': ['error', { code: 120, ignoreUrls: true }],
    '@typescript-eslint/no-object-literal-type-assertion': 0,
    'no-nested-ternary': 0,
    'no-useless-constructor': 0,
    '@typescript-eslint/no-var-requires': 0,
    'no-param-reassign': 1,
    'class-methods-use-this': 0,
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 1,
    'no-underscore-dangle': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'react/prop-types': 0,
    'global-require': 1,
    'no-plusplus': [
      2,
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    // https://github.com/typescript-eslint/typescript-eslint/issues/1232
    '@typescript-eslint/indent': [
      'off',
      2,
      {
        flatTernaryExpressions: false,
        ignoreComments: true,
        SwitchCase: 1,
        VariableDeclarator: {
          var: 2,
          let: 2,
          const: 3,
        },
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 'first' },
        FunctionExpression: { parameters: 'first' },
        CallExpression: { arguments: 'first' },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 'first',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 1,
    '@typescript-eslint/no-explicit-any': 0,
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    'no-debugger': 1,
    'new-cap': 'off',
    'no-extra-boolean-cast': 0,
    'indent': ['error'],
    'react/jsx-one-expression-per-line': 'off',
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        optionalDependencies: true,
      },
    ],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'react/forbid-prop-types': 'off',
    'no-var-requires': 'off',
    'arrow-body-style': 0,
    'dot-notation': 0,
    'no-console': 'off',
    'react/jsx-key': 0,
    'semi': ['error', 'always'],
    'react/sort-comp': 1,
    'no-prototype-builtins': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 1,
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': 'off',
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/no-empty-interface': 0,
    'react/no-unused-state': 1,
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
        typedefs: true,
      },
    ],
    'unicorn/prevent-abbreviations': 'off',
    'import/extensions': 0,
    'no-empty-function': 0,
    'import/no-default-export': 0,
    'unicorn/filename-case': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/no-empty-interface': 1,
    'no-empty-pattern': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-parameter-properties': [
      'error',
      {
        allows: ['private readonly', 'public readonly'],
      },
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
  },
};
