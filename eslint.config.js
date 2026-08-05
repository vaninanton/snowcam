import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "public/**"],
  },
  js.configs.recommended,
  // Соответствует прежнему "plugin:vue/vue3-essential" из .eslintrc.cjs
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Файлы, исполняемые в Node, а не в браузере
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Корневые компоненты точек входа именуются по имени страницы
    files: ["src/Index.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  // Отключает правила, конфликтующие с Prettier — должен идти последним
  prettier,
];
