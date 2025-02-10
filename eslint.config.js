import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/*.ts'],
    ignores: ['src/commands/browser/stagehand/stagehandScript.ts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: 'tsconfig.json'
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        'varsIgnorePattern': '^_|^[A-Z][a-zA-Z]+$',
        'argsIgnorePattern': '^_|^[a-z][a-zA-Z]+$',
        'args': 'none',
        'ignoreRestSiblings': true
      }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'error'
    }
  }
]; 