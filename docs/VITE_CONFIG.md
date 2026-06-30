# Vite Configuration

Source: `vite.config.ts`

---

## Plugins

Three plugins are registered in order:

### 1. `figmaAssetResolver` (custom)

A local Vite plugin that resolves imports prefixed with `figma:asset/`.

**How it works:**

- Any import of the form `figma:asset/<filename>` is remapped to `src/assets/<filename>`.
- This allows Figma-exported components to reference assets using a virtual module ID instead of relative paths.

**Example:**

```ts
import icon from 'figma:asset/icon.svg'
// resolves to → src/assets/icon.svg
```

> Do not remove or rename this plugin. It is required for Figma-generated component imports to resolve correctly.

### 2. `@vitejs/plugin-react`

Standard React plugin — enables JSX transform and Fast Refresh in development.

### 3. `@tailwindcss/vite`

Tailwind CSS v4 Vite plugin. Required even if Tailwind utility classes are not actively used in a given file — do not remove it.

---

## Path Alias

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

`@` is aliased to the `src/` directory.

**Usage in code:**

```ts
import { PRODUCTS } from '@/app/data'
import Button from '@/app/components/ui/button'
```

This avoids deep relative imports (`../../../`) throughout the codebase.

---

## Asset handling

```ts
assetsInclude: ['**/*.svg', '**/*.csv']
```

SVG and CSV files are treated as static assets and can be imported directly into components.

> Never add `.css`, `.tsx`, or `.ts` files to `assetsInclude` — Vite handles those through its normal transform pipeline.

---

## What is NOT configured here

- No dev server proxy (no backend API exists — all data is in-memory).
- No custom build output directory (uses Vite default: `dist/`).
- No environment variable handling beyond Vite defaults (`import.meta.env`).
- No SSR configuration.
