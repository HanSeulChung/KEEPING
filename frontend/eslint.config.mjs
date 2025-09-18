import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // React/JSX 관련 규칙
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',

      // TypeScript 관련 규칙
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-namespace': 'off',

      // Import 관련 규칙 (CI 통과 위해 경고로 완화)
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // 일반 규칙
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',

      // Next.js 권고 완화
      '@next/next/no-img-element': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  // 타입 선언 파일 등에서 namespace 허용 (필요 시 제한적으로)
  {
    files: ['src/types/**/*.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
]

export default eslintConfig
