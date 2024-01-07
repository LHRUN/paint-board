module.exports = {
  plugins: ['stylelint-prettier'],
  extends: [
      'stylelint-config-standard',
      'stylelint-config-recess-order',
      'stylelint-config-prettier',
      'stylelint-prettier/recommended'
  ],
  overrides: [
    {
      files: ['**/*.tsx'],
      customSyntax: '@stylelint/postcss-css-in-js',
    },
  ],

  rules: {
    // Enable Prettier auto-formatting
    'prettier/prettier': true,
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["tailwind"]
      }
    ],
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$"
  }
};
