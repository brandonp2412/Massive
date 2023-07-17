module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js'],
      rules: {
        'jsx-quotes': 0,
        'prettier/prettier': 0,
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        semi: 'off',
        curly: 'off',
        'react/react-in-jsx-scope': 'off',
        'react-native/no-inline-styles': 'off',
        'no-spaced-func': 'off',
      },
    },
  ],
  ignorePatterns: ['coverage/'],
}
