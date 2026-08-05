import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "public/**"],
  },
  js.configs.recommended,
  // Синтаксические правила без привязки к типам: type-aware набор не умеет
  // типизировать .vue и выдаёт any на каждый импорт SFC. За типы отвечает
  // vue-tsc — он видит и шаблоны тоже.
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Разбор <script lang="ts"> внутри .vue
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
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
