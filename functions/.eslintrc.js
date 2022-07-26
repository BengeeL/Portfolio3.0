module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  globals: {
    window: true,
    document: true,
    XMLHttpRequest: true,
    $: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    quotes: ["error", "double"],
  },
};
