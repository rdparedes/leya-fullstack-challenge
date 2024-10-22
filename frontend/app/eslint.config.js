export default [
  {
    // Flat config: ignore patterns
    ignores: [
      "node_modules",
      "scripts/*",
      "config/*",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      ".DS_Store",
      "package.json",
      "tsconfig.json",
      "**/*.md",
      "build",
      ".eslintrc.cjs",
      "eslint.config.cjs",
      "**/.*" // Ignore all dotfiles (like .gitignore)
    ],
  },
  {
    // Language options (ES Modules, JSX)
    languageOptions: {
      ecmaVersion: 2021,  // ES2021 syntax support
      sourceType: 'module',
      globals: {
        window: 'readonly', // For browser-based globals
        document: 'readonly',
        Edit: 'writable',
        console: 'writable',
        _: 'writable',
        $: 'writable',
      },
      ecmaFeatures: {
        jsx: true, // Enable JSX parsing
      },
    },

    // Plugins to be used
    plugins: {
      react: import('eslint-plugin-react'),
      'react-hooks': import('eslint-plugin-react-hooks'),
      prettier: import('eslint-plugin-prettier'),
      '@typescript-eslint': import('@typescript-eslint/eslint-plugin'),
      'react-refresh': import('eslint-plugin-react-refresh'),
      import: import('eslint-plugin-import'),
    },

    // ESLint rule configurations (extends equivalent in Flat Config)
    rules: {
      ...(await import('eslint-plugin-react')).configs.recommended.rules,
      ...(await import('eslint-plugin-react-hooks')).configs.recommended.rules,
      ...(await import('@typescript-eslint/eslint-plugin')).configs.recommended.rules,
      ...(await import('eslint-plugin-prettier')).configs.recommended.rules,
      'prettier/prettier': 'error', // Prettier formatting as an ESLint rule
    },

    settings: {
      react: {
        version: 'detect',  // Automatically detect the React version
      },
    },
  },
];