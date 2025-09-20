// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next.js 기본 규칙 + TS 규칙
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 프로젝트 전역 규칙
  {
    rules: {
      /* React 관련 */
      "react/react-in-jsx-scope": "off", // Next.js에서는 필요 없음
      "react/prop-types": "off", // TS 프로젝트라 불필요
      "react/display-name": "off", // 익명 컴포넌트 이름 경고 제거

      /* TS 관련 */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }, // _prefix는 허용
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn", // any는 완전 금지 대신 경고만
      "@typescript-eslint/no-namespace": "off", // namespace 허용 (필요 시)

      /* Import 관련 */
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      /* 일반 규칙 */
      "prefer-const": "error",
      "no-console": "warn", // 개발 중 console.log 허용, 배포 전에 쉽게 잡기
      "no-debugger": "error",

      /* Next.js 권고 완화 */
      "@next/next/no-img-element": "warn", // img 태그 쓸 수는 있음
      "react/no-unescaped-entities": "warn",
    },
  },

  // 타입 정의 파일 전용 규칙
  {
    files: ["src/types/**/*.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
    },
  },
];
