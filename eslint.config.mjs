import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  // Ignore build output and dependencies.
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // Base JS + TypeScript rules for all source.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React client (browser environment).
  {
    files: ['src/client/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 19 with the automatic JSX runtime needs no React import.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Node server.
  {
    files: ['src/server/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Tests (Vitest, jsdom).
  {
    files: ['test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Playwright E2E tests and root config files (Node environment).
  {
    files: ['e2e/**/*.ts', '*.config.{ts,mjs,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
