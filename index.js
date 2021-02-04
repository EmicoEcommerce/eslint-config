// The thoughts behind this config are:
// We want to use recommended rules from the standard libraries as a basis.
// We will disable any rules that are inconvenient and unimportant. A
// consistent codebase (in addition to Prettier), a low learning curve and
// developer speed are important factors being considered.

// Only run code style checks on the CLI and in CI. Only rules that are
// automatically fixable are included in this set.
// With this toggle IDEs can do good linting and show code issues inline without
// continuous code style warnings breaking up the flow.
// We do want code style warnings included in the CLI/CI linting rather than as
// separate output because the formatting of eslint is more readable, and they
// both indicate issues in the way code is written that need to be fixed.
const CHECK_CODESTYLE = process.env.CODE_STYLE === 'true'
const ENABLE_EMICO_COMPONENT_LIBRARY =
  process.env.EMICO_COMPONENT_LIBRARY === 'true'
// When using GraphQL but not Apollo. See https://github.com/apollographql/eslint-plugin-graphql#common-options
const GRAPHQL_ENVIRONMENT = process.env.GRAPHQL_ENVIRONMENT || 'apollo'

const optionalRequire = (name) => {
  try {
    return require(name)
  } catch (er) {
    return undefined
  }
}
// Check if GraphQL config is available to determine if we can enable GraphQL
// linting rules. graphql/template-strings throws when there's no config.
const checkGraphqlConfig = () => {
  const hasGraphql = optionalRequire('graphql')
  if (!hasGraphql) {
    return false
  }
  const graphqlConfig = optionalRequire('graphql-config')
  if (!graphqlConfig) {
    return false
  }
  const config = graphqlConfig.loadConfigSync({
    throwOnMissing: false,
    throwOnEmpty: false,
  })
  return Boolean(config)
}
const hasGraphqlConfig = checkGraphqlConfig()

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
    // https://github.com/cypress-io/eslint-plugin-cypress#rules
    'plugin:cypress/recommended',
  ],
  plugins: hasGraphqlConfig ? ['graphql'] : [],
  rules: {
    'graphql/template-strings': hasGraphqlConfig
      ? [
          'error',
          {
            env: GRAPHQL_ENVIRONMENT,
          },
        ]
      : 'off',

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

    // Always prefer if-statements over expressions for both consistency and in general readability when paired with
    // early returns.
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: false, // a && a() might as well be a?.() or if (a) { a() }
        allowTernary: false, // ternary expressions without returning the result - just use an if-statement
        allowTaggedTemplates: false, // randomly placed strings are dead code
      },
    ],

    'no-restricted-syntax': [
      'warn',
      'WithStatement',
      {
        selector:
          "CallExpression[callee.name='setTimeout'][arguments.length!=2]",
        message: 'setTimeout must always be invoked with two arguments.',
      },
      {
        selector: "CallExpression[callee.name='useLazyQuery']",
        message:
          'Prefer apolloClient.query in handlers over useLazyQuery hooks. The useLazyQuery introduce misdirection that makes code hard to follow, especially when the behavior gets more complicated. Error handling also improves using apolloClient.query.',
      },
      {
        selector: "CallExpression[callee.name='useMutation']",
        message:
          'Prefer apolloClient.mutate in handlers over useMutation hooks. The useMutation introduce misdirection that makes code hard to follow, especially when the behavior gets more complicated. Error handling also improves using apolloClient.mutate.',
      },
    ],

    // if (!a > b) will convert a into a boolean since ! has precendence over >
    // Note: @typescript-eslint disables this for TS files since TS also checks for this.
    'no-unsafe-negation': ['error', { enforceForOrderingRelations: true }],

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
      'warn',
      { props: 'never', children: 'never' },
    ],

    curly: ['warn', 'all'],

    // When using a boolean attribute in JSX, you can set the attribute value to true or omit the value.
    // This rule will enforce one or the other to keep consistency in your code
    'react/jsx-boolean-value': ['warn', 'never'],

    // Suggests to convert () => { return x; } to () => x.
    'arrow-body-style': [
      // This is an annoying code style rule that can be fixed automatically.
      // Only check it during the precommit fix script, and in CI.
      CHECK_CODESTYLE ? 'warn' : 'off',
      'as-needed',
    ],

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
      CHECK_CODESTYLE ? 'warn' : 'off',
      {
        default: 'array-simple',
      },
    ],

    // Parameter properties can be confusing to those new to TypeScript as they are less explicit than other ways of declaring and initializing class members.
    '@typescript-eslint/no-parameter-properties': 'error',

    'import/order': [
      // This is an annoying code style rule that can be fixed automatically.
      // Only check it during the precommit fix script, and in CI.
      CHECK_CODESTYLE ? 'warn' : 'off',
      {
        groups: [
          ['external', 'builtin'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: '@emico/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    'no-implicit-coercion': 'warn',

    'import/no-useless-path-segments': 'warn',
    // Shorter, no useless var, and not really a big difference
    'import/no-anonymous-default-export': 'off',

    // endregion

    // Every dependency should be in the package.json
    'import/no-extraneous-dependencies': 'warn',

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

    'prettier/prettier': CHECK_CODESTYLE ? 'warn' : 'off',
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
