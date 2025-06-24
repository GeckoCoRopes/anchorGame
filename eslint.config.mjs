import { defineConfig } from "eslint/config";
import jsonc from "eslint-plugin-jsonc";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended", "plugin:jsonc/recommended-with-jsonc"),

    plugins: {
        jsonc,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },
    },

    rules: {},
}, {
    files: ["**/*.json"],
    extends: compat.extends("plugin:jsonc/recommended-with-jsonc"),

    rules: {
        "jsonc/sort-keys": "off",
        "jsonc/no-comments": "error",
        "jsonc/comma-dangle": "error",
    },
}]);