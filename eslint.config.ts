import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "public/**"],
  },
  js.configs.recommended,
  // Синтаксические правила без привязки к типам: за типы отвечает tsc,
  // а type-aware набор заметно замедляет линт без выигрыша для проекта
  // такого размера.
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Конфиги исполняются в Node, а не в браузере
    files: ["*.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  // Отключает правила, конфликтующие с Prettier — должен идти последним
  prettier,
);
