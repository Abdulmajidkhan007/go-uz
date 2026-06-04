import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      "dist",
      ".turbo",
      ".expo",
      "coverage",
      "build",
      "*.local"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "packages/!(types|validation|api|ui|theme|utils|constants|config|assets)/**",
              from: "apps/**",
              message:
                "Packages cannot import from apps. Only app/platform-specific code belongs in apps/*"
            },
            {
              target: "packages/(types|validation|api|ui|theme|utils|constants|config)/**",
              from: "node_modules/(react-native|react-dom|@mui/*)/**",
              message:
                "Platform-agnostic packages must not import React Native, React DOM, or Material-UI"
            }
          ]
        }
      ],
      "import/no-unresolved": "error",
      "import/order": [
        "warn",
        {
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "pathGroups": [
            {
              "pattern": "@vroom/**",
              "group": "internal",
              "position": "after"
            }
          ],
          "newlines-between": "always",
          "alphabeticalOrder": true,
          "caseInsensitive": true
        }
      ]
    }
  }
);
