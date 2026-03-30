import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended, // The spread operator is required here
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // 1. Disable the 'any' error (You already have this)
      '@typescript-eslint/no-explicit-any': 'off',

      // 2. Disable the "Don't set state in Effect" warning
      // This allows you to sync your Redux data to your Form data without errors
      'react-hooks/exhaustive-deps': 'warn', 
      
      // 3. Stop it from complaining about unused variables (optional but helpful)
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
)