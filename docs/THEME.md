# Theme & Design Tokens

Source: `src/theme.css`

This file defines the entire visual design system for C Store using CSS custom properties (variables). It integrates with Tailwind CSS v4 via the `@theme inline` block, which maps CSS variables to Tailwind utility classes automatically.

---

## How it works

There are three layers:

1. **`:root`** — declares light mode token values as CSS variables.
2. **`.dark`** — overrides those same variables for dark mode.
3. **`@theme inline`** — exposes every variable as a Tailwind color/radius utility (e.g. `bg-background`, `text-foreground`, `border-border`).

Dark mode is activated by adding the `.dark` class to an ancestor element. The custom variant is declared as:

```css
@custom-variant dark (&:is(.dark *));
```

This means dark styles apply to any element that is a descendant of a `.dark`-classed element.

---

## Token reference

### Colors — Light / Dark

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#ffffff` | near-black | Page background |
| `--foreground` | near-black | near-white | Default text |
| `--card` | `#ffffff` | near-black | Card surfaces |
| `--card-foreground` | near-black | near-white | Text on cards |
| `--popover` | white | near-black | Dropdown / popover background |
| `--popover-foreground` | near-black | near-white | Text in popovers |
| `--primary` | `#030213` | near-white | Primary buttons, key actions |
| `--primary-foreground` | white | dark | Text on primary elements |
| `--secondary` | light blue-grey | dark grey | Secondary buttons, tags |
| `--secondary-foreground` | `#030213` | near-white | Text on secondary elements |
| `--muted` | `#ececf0` | dark grey | Subtle backgrounds, disabled states |
| `--muted-foreground` | `#717182` | mid-grey | Placeholder text, secondary labels |
| `--accent` | `#e9ebef` | dark grey | Hover states, highlighted rows |
| `--accent-foreground` | `#030213` | near-white | Text on accented elements |
| `--destructive` | `#d4183d` | dark red | Delete buttons, error states |
| `--destructive-foreground` | `#ffffff` | light red | Text on destructive elements |
| `--border` | `rgba(0,0,0,0.1)` | dark grey | Dividers, input borders |
| `--input` | `transparent` | dark grey | Input border color |
| `--input-background` | `#f3f3f5` | — | Input fill color |
| `--switch-background` | `#cbced4` | — | Toggle switch track |
| `--ring` | mid-grey | darker grey | Focus ring |

### Chart colors

Five chart palette tokens used by recharts components in `Dashboard` and `ReportsPage`:

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | warm orange | blue |
| `--chart-2` | teal | green |
| `--chart-3` | slate blue | yellow |
| `--chart-4` | yellow-green | purple |
| `--chart-5` | gold | coral |

These map to Tailwind utilities `text-chart-1` through `text-chart-5` and are also consumed directly as CSS variables in recharts `<Line stroke="var(--chart-1)" />` patterns.

### Sidebar tokens

A separate set of tokens scopes the sidebar independently from the main surface, allowing different treatment per theme:

| Token | Purpose |
|---|---|
| `--sidebar` | Sidebar background |
| `--sidebar-foreground` | Sidebar text |
| `--sidebar-primary` | Active nav item |
| `--sidebar-primary-foreground` | Text on active nav item |
| `--sidebar-accent` | Hovered nav item |
| `--sidebar-accent-foreground` | Text on hovered nav item |
| `--sidebar-border` | Sidebar dividers |
| `--sidebar-ring` | Focus ring inside sidebar |

### Border radius

A single base radius is defined and scaled:

| Token | Value | Tailwind utility |
|---|---|---|
| `--radius` | `0.625rem` | — |
| `--radius-sm` | `radius - 4px` | `rounded-sm` |
| `--radius-md` | `radius - 2px` | `rounded-md` |
| `--radius-lg` | `radius` | `rounded-lg` |
| `--radius-xl` | `radius + 4px` | `rounded-xl` |

### Typography

| Token | Value |
|---|---|
| `--font-size` | `16px` (base, set on `html`) |
| `--font-weight-medium` | `500` |
| `--font-weight-normal` | `400` |

The global body font is **Cairo** (loaded externally — either via Google Fonts in the HTML or via the receipt print window). This applies RTL-compatible Arabic typography across the entire app.

Default heading scale (from `@layer base`):

| Element | Size token | Weight |
|---|---|---|
| `h1` | `--text-2xl` | medium |
| `h2` | `--text-xl` | medium |
| `h3` | `--text-lg` | medium |
| `h4` | `--text-base` | medium |
| `label` | `--text-base` | medium |
| `button` | `--text-base` | medium |
| `input` | `--text-base` | normal |

> All of these can be overridden by Tailwind utility classes (e.g. `text-sm`, `font-bold`) since they are defined in `@layer base`.

---

## How to use tokens in components

Because `@theme inline` maps every token to a Tailwind color, use them as standard utilities:

```tsx
// backgrounds
<div className="bg-background text-foreground" />
<div className="bg-card text-card-foreground" />

// state colors
<button className="bg-primary text-primary-foreground" />
<button className="bg-destructive text-destructive-foreground" />

// subtle / muted
<p className="text-muted-foreground" />
<div className="bg-muted" />

// borders
<div className="border border-border" />

// sidebar (used inside Layout.tsx)
<aside className="bg-sidebar text-sidebar-foreground" />
```

To reference a token in a recharts prop or inline style:

```tsx
<Line stroke="var(--chart-1)" />
```

---

## Adding or changing tokens

1. Add the CSS variable to `:root` (and to `.dark` if it needs a dark override).
2. Add a corresponding entry in the `@theme inline` block so Tailwind generates the utility class.
3. Use `bg-<token-name>` / `text-<token-name>` in components.

Do not hardcode hex values in component files — always reference a token so dark mode works correctly.
