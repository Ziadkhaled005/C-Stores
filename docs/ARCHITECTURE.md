# Architecture Overview

This project is a Vite + React application with a componentized structure located under `src/app`.

Top-level folders (key ones):

- `src/main.tsx` - application entry
- `src/app/App.tsx` - root app and route outlet
- `src/app/routes.ts` - route declarations
- `src/app/store.ts` - application state store
- `src/app/components` - UI components and feature pages

UI components are organized by feature (e.g., `dashboard`, `pos`, `inventory`), and shared UI primitives live under `components/ui`.

Styling

- Tailwind and custom CSS files live in `src/imports/styles` and top-level CSS files are `index.css`, `tailwind.css`, `theme.css`.

Build system

- Vite is used as the dev server and bundler. See `vite.config.ts` for customizations.
