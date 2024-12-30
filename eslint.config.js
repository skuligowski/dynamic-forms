import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": [ "error" ],
      "react/jsx-filename-extension": [ "warn", { "extensions": [ ".tsx" ] } ],
      "import/extensions": [ "error", "ignorePackages", { "ts": "never", "tsx": "never" } ],
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": [ "error" ],
      "@typescript-eslint/explicit-function-return-type": [ "error", { "allowExpressions": true } ],
      "max-len": [ "warn", { "code": 100, "ignoreComments": true, "ignoreUrls": true } ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import/prefer-default-export": "off",
      "react/prop-types": "off",
      "prettier/prettier": [ "error", { "endOfLine": "auto" } ]
    }
  }
];