const globals = require('globals');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2, 10, 50, 100, 200, 201, 400, 401, 403, 404, 409, 500, 1000],
          ignoreArrayIndexes: true,
          enforceConst: true,
        },
      ],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|next|res' }],
      'global-require': 'warn',
    },
  },
];
