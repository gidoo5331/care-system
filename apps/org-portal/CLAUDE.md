# CLAUDE.md — Org Portal

The web app for care home and homecare managers, nurses and office staff. Carers
use the mobile app instead.

## Critical Rules

- **Never commit anything.** Do not run `git commit`. Leave all changes unstaged
  for the user to commit.
- **Yarn only.** Never run `npm install` — it creates a `package-lock.json` that
  fights `yarn.lock`. Use `yarn add --exact` so versions stay pinned.
- **Comment sparingly.** Only write a comment when the code cannot carry the
  information itself — a non-obvious constraint, a subtle failure it guards
  against, or a decision whose reasoning is invisible from the code. Never
  restate what the code says or head a block with a label. Default to none.
- **Follow `rent-loop/apps/property-manager`.** This app copies its folder
  structure, naming and data-access patterns. When unsure how to build
  something, look at how property-manager does it first.

## Commands

```bash
yarn dev          # Dev server (port 3001)
yarn build        # Production build
yarn types:check  # React Router typegen + TypeScript check
yarn lint         # ESLint
yarn format       # Prettier
```

Run `yarn types:check` and `yarn lint` before considering work complete.

## Design

The source of truth is the Care Platform design artifact:
https://claude.ai/artifact/6nuaQEqoUR6XJdZCe1zvkQ — screens live under
`project/*.dc.html`, tokens in `project/ds/careplatform/tokens.json`.

Tokens are mapped onto Tailwind in `app/app.css` (light in `:root`, dark in
`.dark`). Never hardcode hex values — use the token classes:

| Purpose                   | Classes                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| Page / card               | `bg-background`, `bg-card`, `border` (uses `--border`)               |
| Text                      | `text-foreground`, `text-muted-foreground`, `text-subtle-foreground` |
| Brand                     | `bg-primary`, `hover:bg-primary-hover`, `text-primary-foreground`    |
| Selected / soft highlight | `bg-accent text-accent-foreground`                                   |
| Navy rail                 | `bg-navy`, `bg-navy-raised`, `text-navy-muted`                       |
| Status (status only!)     | `bg-{success,warning,critical,info}-tint text-…-ink`                 |
| Neutral chip              | `bg-neutral-tint text-neutral-ink`                                   |

Every screen must work in light and dark mode. Status colours are reserved for
status (missed dose, late visit, high risk…), never decoration.

## Architecture

**Stack:** React Router **v8** (framework mode, SSR), React 19, TypeScript,
TanStack Query v5, Tailwind CSS v4, Radix primitives, React Hook Form + Zod.

```
app/
├── api/<resource>/     index.ts = client hooks, server.ts = loader fetchers
├── routes/             Flat file routes (thin: loader/action/meta + default export)
├── modules/            Page components, named `<Name>Module`, exported from modules/index.ts
├── components/
│   ├── ui/             Primitives (button, badge, card, input, …)
│   └── *.tsx           Shell pieces (app-rail, module-layout, sub-nav, …)
├── providers/          Auth, Workspace, React Query
├── lib/
│   ├── actions/        *.server.ts — session, middleware, contexts, env
│   └── mock-api/       Demo backend (see below)
types/                  Global ambient types (*.d.ts) — no imports needed
```

## Routing

- `_auth.*` routes run `authMiddleware` then `workspaceMiddleware`.
- `_auth._dashboard.*` routes render inside the navy module rail.
- Each module renders `<ModuleLayout label nav>` itself — the design gives every
  module its own sub-sidebar (workplace switcher + module nav).
- Breadcrumbs: `export const handle = { breadcrumb: 'Label' }` or a function of
  the route's loader data.
- `_auth._dashboard.$.ts` catches unbuilt sections and shows "coming soon".

### React Router v8 gotcha

In loaders, actions and middleware, **use the `url` argument, never
`new URL(request.url)`**. Client navigations request `/path.data`, and
`request.url` is the raw request — path checks fail and `return_to` values nest
until the server answers 431.

## Domain naming

- A **workspace** is one place someone works: a care home or a homecare branch
  (the design calls it a "workplace" in copy). A user's membership is a
  `WorkspaceUser`; the selected one is `selectedWorkspaceId` in the session.
- **Residents** live in care homes; **clients** receive homecare. Both are the
  `Resident` type, distinguished by `service`. Copy says "Residents and clients"
  where both appear.

## Data access

Same as property-manager:

- **Server-side (loaders):** `app/api/<resource>/server.ts`, called with
  `{ authToken: await resolveAuthToken(request, context), baseUrl: environmentVariables().API_ADDRESS }`.
- **Client-side:** TanStack Query hooks in `app/api/<resource>/index.ts`. Detail
  pages pass loader data as `initialData`; list pages query from URL search
  params (`query`, `page`, filters) via `getQueryParams`.
- The workspace id comes from `workspaceContext` in loaders and `useWorkspace()`
  in components.
- Use `safeString()` instead of `?? ''`.

## Mock API

There is no backend yet. When `API_ADDRESS` is empty, `transport()` routes every
request to `app/lib/mock-api` instead of the network — on server and client.
Sign in with any email and the password `password`.

When adding an endpoint: add its handler and data under `lib/mock-api/` using
the same path and `ApiResponse` shape the real API will have, so switching to
the backend is only a matter of setting `API_ADDRESS`.

## UI patterns

- Page content: `<ModuleLayout>` gives the max-width main column with `gap-6`;
  page header is an `h1` (`text-2xl font-semibold`) plus a muted line.
- Cards: `Card` / `CardHeader` / `CardTitle` / `CardAction` / `CardContent`.
- Status chips: `<Badge tone="critical|warning|success|info|neutral">`.
- Tables: `DataTable` styles from `components/data-table.tsx` (44px header, 64px
  rows, horizontal scroll on narrow screens).
- Buttons are 40px (`h-10`), `rounded-lg`; inputs match.
