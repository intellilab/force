module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
    require.resolve('@gera2ld/plaid-react/eslint/react'),
  ],
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  rules: {
  },
};
