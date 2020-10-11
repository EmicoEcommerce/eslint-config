// The thoughts behind this config are:
// We want to use recommended rules from the standard libraries as a basis.
// We will disable any rules that are inconvenient and unimportant. A
// consistent codebase (in addition to Prettier), a low learning curve and
// developer speed are important factors being considered.

// Only run Prettier on the CLI and in CI. This way IDEs can do good linting and
// show inline issues without Prettier warnings everywhere. We do want Prettier
// included in the linting rather than as separate output because the formatting
// of eslint is more readable, and they both indicate code issues that need to
// be fixed. We just don't want Prettier to put a red underline underneath all
// code not yet Prettier formatted.
const ENABLE_PRETTIER = process.env.PRETTIER === 'true'
const ENABLE_EMICO_COMPONENT_LIBRARY =
  process.env.EMICO_COMPONENT_LIBRARY === 'true'

module.exports = {
  root: true,
  extends: [
    'react-app',
    // https://github.com/eslint/eslint/blob/master/conf/eslint-recommended.js
    'eslint:recommended',
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/index.js#L115
    'plugin:react/recommended',
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/eslint-recommended.ts
    'plugin:@typescript-eslint/eslint-recommended',
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/recommended.json
    'plugin:@typescript-eslint/recommended',
    // We enable the prettier plugin even if ENABLE_PRETTIER is false since it
    // also disables rules that would conflict with Prettier. We need these
    // overrides even if we're ignoring Prettier rule problems.
    // https://prettier.io/docs/en/integrating-with-linters.html#recommended-configuration
    'plugin:prettier/recommended',
    // See https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore for
    // reasons why.
    // https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore/blob/master/lib/rules/all.js
    'plugin:you-dont-need-lodash-underscore/compatible',
  ],
  rules: {
    // region Syntax

    // Codebase consistency and ease of use
    'react/prefer-stateless-function': 'warn',

    // Swift removed ++ and -- completely for various good reasons:
    // https://github.com/apple/swift-evolution/blob/master/proposals/0004-remove-pre-post-inc-decrement.md#disadvantages-of-these-operators
    // Use one of the following instead:
    // foo(i++) -> foo(i); i += 1
    // foo(++i) -> i += 1; foo(i)
    // i-- -> i -= 1
    // for (let i = 0; i < arr.length; i++) -> for (let i = 0; i < arr.length; i += 1)
    // NOTE: For the last one, prefer arr.forEach(func)/map/reduce instead.
    'no-plusplus': 'warn',

    // TODO: Rule to encourage foreach/map/reduce over for

    // endregion

    // region Types

    // Allow implicit return types. This should make it easier to change code
    // as it doesn't require you to change a load of types in addition. In React
    // code it would be doubly annoying, as we'd have to specify the return type
    // of each functional component.
    // This should not have an impact on type safety, as any input relying on a
    // specific type should have that type specified.
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Allow explicit property/parameter types so they can be consistent with
    // their sibling properties/parameters that have no default value.
    '@typescript-eslint/no-inferrable-types': [
      'warn',
      {
        ignoreParameters: true,
        ignoreProperties: true,
      },
    ],

    // Standardise the user of type assertion style
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      },
    ],

    // endregion

    // region enforce emico components

    'react/forbid-elements': ENABLE_EMICO_COMPONENT_LIBRARY
      ? [
          'error',
          {
            forbid: [
              {
                element: 'img',
                message:
                  'use <Image> instead so that the correct image CDN is used',
              },
              {
                element: 'a',
                message:
                  'use <Link> instead to make sure internal linking works, and analytics is working as expected',
              },
              {
                element: 'button',
                message:
                  'use <ButtonPrimary> or <ButtonSecondary> instead to make sure the correct styling is used, or use <ButtonUnstyled> as a base',
              },
            ],
          },
        ]
      : 'off',

    // endregion

    // region Code style

    // Disable specific member delimiter style for interfaces and type literals.
    // We don't need an eslint rule for this, as Prettier will already enforce
    // this.
    '@typescript-eslint/member-delimiter-style': 'off',

    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'never' },
    ],

    curly: ['error', 'all'],

    // When using a boolean attribute in JSX, you can set the attribute value to true or omit the value.
    // This rule will enforce one or the other to keep consistency in your code
    'react/jsx-boolean-value': ['error', 'never'],

    // Suggests to convert () => { return x; } to () => x.
    'arrow-body-style': ['error', 'as-needed'],

    // Do not require explicit visibility declarations for class members.
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'off',
        overrides: {
          parameterProperties: 'off',
          accessors: 'off',
          // public constructor() would be silly
          constructors: 'no-public',
          methods: 'off',
          properties: 'off',
        },
      },
    ],

    // Requires using either ‘T[]’ or ‘Array' for arrays.
    // enforces use of T[] if T is a simple type (primitive or type reference).
    '@typescript-eslint/array-type': [
      2,
      {
        default: 'array-simple',
      },
    ],

    // Parameter properties can be confusing to those new to TypeScript as they are less explicit than other ways of declaring and initializing class members.
    '@typescript-eslint/no-parameter-properties': 'error',

    'import/order': [
      'error',
      {
        groups: [
          ['external', 'builtin'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always-and-inside-groups',
      },
    ],

    'no-implicit-coercion': 'error',

    'import/no-useless-path-segments': 'error',

    // endregion

    // Every dependency should be in the package.json
    'import/no-extraneous-dependencies': 'error',

    // For example see https://git.emico.nl/magento-2/react-components/commit/28bea2e284ee51ca3f7db9a17894d50c68250789
    'no-restricted-imports': [
      'error',
      {
        name: '..',
        message: "Importing '..' can cause issues that are hard to find.",
      },
      {
        name: '.',
        message: "Importing '.' can cause issues that are hard to find.",
      },
    ],

    // Allow using any characters in children texts to keep things easy to
    // maintain and concise. We internationalize all messages anyway, so
    // translators can use the correct typography for their language and we
    // can do whatever is quickest.
    'react/no-unescaped-entities': 0,

    'prettier/prettier': ENABLE_PRETTIER ? 'error' : 'off',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        // We only write JS when we need something to run in node.js without
        // first compiling it. In that case, usually, we can't use module
        // imports either.
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
}
