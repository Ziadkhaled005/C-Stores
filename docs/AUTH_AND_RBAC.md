# Authentication & RBAC (Authorization)

This document explains how the project currently handles authentication and role-based UI labeling.

> Important: The codebase uses **in-memory seed data**; there is no backend API.

---

## 1) Authentication

### Source

- `src/app/store.ts`
- `src/app/data.ts`
- `src/app/components/auth/LoginPage.tsx`
- `src/app/components/layout/Layout.tsx`

### Mechanism

Authentication is managed by Zustand.

#### `useAuthStore` (Zustand)

Located in `src/app/store.ts`.

- State fields:
    - `user: User | null`
    - `isAuthenticated: boolean`
- Actions:
    - `login(email, password): boolean`
        - Looks up `USERS` array from `src/app/data.ts`.
        - If email+password match, sets `{ user, isAuthenticated: true }`.
    - `logout()`

### Route protection

The project does not use an explicit `ProtectedRoute` component.
Instead, protection is implemented in the root layout:

#### `Layout.tsx`

- It reads `isAuthenticated` from `useAuthStore`.
- `useEffect` redirects to `/login` when `!isAuthenticated`.
- If unauthenticated, it returns `null`.

### Login experience

- `LoginPage.tsx` provides:
    - Email/password form
    - Error banner on failure
    - Quick login buttons for seeded users

---

## 2) RBAC / Permissions

### What exists in this repo

- `Role` union type and `USERS` seeded roles are present in `src/app/store.ts` and `src/app/data.ts`.
- `ROLE_LABELS` map is used by the UI (layout + login) to display a role name.

### What is NOT enforced (yet)

In the files inspected so far:

- There is no centralized permission check like `can('action')`.
- The nav sidebar does not appear to hide/show routes based on role.
- `RolesPage` is referenced in routing, but detailed enforcement behavior is not documented here because the permission logic is not included in the inspected files.

### Where to continue documenting

To document full RBAC behavior, inspect:

- `src/app/components/roles/RolesPage.tsx`
- `src/app/rbacData.ts`
- any guards/permission helpers used by pages

---

## 3) Practical implication for developers

Because route protection is done only by `isAuthenticated`, the app currently behaves as:

- Authenticated users can access all routed pages in the layout (unless a component itself checks roles).

If you add real RBAC enforcement:

- Introduce a permission model (actions/permissions matrix)
- Implement a guard layer (route loader/element wrapper) that checks permissions before rendering.
