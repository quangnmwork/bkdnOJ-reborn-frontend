module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react", "unused-imports"],
  rules: {
    "react/prop-types": "off",
    "no-useless-escape": "off",
    "react/no-unescaped-entities": "off",
    "no-prototype-builtins": "off",
    "no-undef": "off",
    "getter-return": "off",
    "valid-typeof": "off",
    "no-cond-assign": "off",
    "no-empty": "off",
    "no-func-assign": "off",
    "no-unsafe-finally": "off",
    "no-useless-catch": "off",
    "react/display-name": "off",
    "no-control-regex": "off",
    "no-fallthrough": "off",
    "no-unused-vars": ["error", {argsIgnorePattern: "^_"}],
  },
};
