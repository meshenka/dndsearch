module.exports = {
  extends: ['algolia', 'algolia/jest'],
  globals: {
    'instantsearch': true
  },
  rules: {
    'no-console': 0,
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
