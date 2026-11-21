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
  Inside a module, unbuilt pages render `<ComingSoonPanel>` via the module's
  `XComingSoonModule`, so they keep that module's sub-nav.
- Module sub-nav links that differ only by search params (saved views like
  `?view=review-due`) pass `active` to `SubNavLink` — `NavLink` only matches on
  pathname.
- A leaf route has no `<Outlet/>`, so a child path under it never renders. Use
  the trailing-underscore escape to make it a sibling instead:
  `visits.rota_.copy.ts` for `/visits/rota/copy`, `$incidentId_.$.ts` for
  anything under one incident.

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

## The client

Built for **Oasis HomeCare Services** (nursing home and domiciliary care),
House No. GF 41, Somervilla Street, near Apolonia City Gate, Apolonia, Kpone
Katamanso, Greater Accra (GPS GK-0754-8616). The demo's first workspace is
their Apolonia home; the Dansoman and Tema branches are invented.

Their paper **Client Assessment Booklet** is the source for assessment and
care plan content. It has 24 forms, OHS-01 to OHS-24: personal & social
profile, mental capacity (best-interest decision), personal history,
communication, cultural/spiritual, environment, domestic, personal hygiene,
oral care, skin, continence, nutrition & hydration, medication, moving &
handling, activity risk, bathing & showering risk, mental health, clinical,
privacy notice (Data Protection Act 2012, Act 843), sleeping, behaviours that
may challenge, equipment, financial, body map. Most follow one shape: Yes/No
questions, "My Goals" and "What's Important to Me?" in the client's own words,
who was involved, and a "Staff Use Only" checklist. Use their wording when
building assessment templates.

The booklet lives in `app/lib/assessment-templates.ts` as data: each form is a
list of blocks (`yes_no`, `text`, `fields`, `choice`, `checklist`, `table`,
`body_map`) rendered by `modules/assessments/form-blocks.tsx`. Staff-only
questions are flagged and don't block completion. A form's
`care_plan_section` is the section it fills via "Use in care plan", which opens
the care plan editor with `?from_assessment=OHS-xx` — it never edits a plan
directly.

## Data access

Same as property-manager:

- **Server-side (loaders/actions):** `app/api/<resource>/server.ts`, built on
  `getForServer` / `postForServer` from `lib/server-request.ts`. In a route,
  `const { workspaceId, apiConfig } = await getApiContext({ request, context })`
  (`lib/actions/api-context.server.ts`) gives you both arguments.
- **Client-side fetches:** `getForClient` from `lib/client-request.ts`.
- **Tables:** `components/ui/table.tsx` for markup; `TableBodyContent` from
  `components/table-states.tsx` handles loading, empty and error rows.
- **CSV downloads:** `downloadCsv(filename, { columns, rows })` from `lib/csv.ts`.
- **Client-side:** TanStack Query hooks in `app/api/<resource>/index.ts`. Detail
  pages pass loader data as `initialData`; list pages query from URL search
  params (`query`, `page`, filters) via `getQueryParams`.
- The workspace id comes from `workspaceContext` in loaders and `useWorkspace()`
  in components.
- Use `safeString()` instead of `?? ''`.

## Mock API

There is no backend yet. When `API_ADDRESS` is empty, `transport()` routes every
request to `app/lib/mock-api` instead of the network. Sign in with any email and
the password `password`.

The mock is **server-only** and keeps its data in server memory, so saves
(new residents, prescriptions) persist until the server restarts. Server code
calls it directly; the browser reaches it through the `routes/mock-api.$.ts`
relay. Only import `lib/mock-api/address.ts` from code that can run in the
browser — never `lib/mock-api` itself.

When adding an endpoint: add its handler and data under `lib/mock-api/` using
the same path and `ApiResponse` shape the real API will have, so switching to
the backend is only a matter of setting `API_ADDRESS`. Put business rules both
sides need (e.g. `findAllergyConflict`) in `lib/*.utils.ts`, not in the mock.

## Forms

- React Hook Form + Zod; schema and value mapping live in a `schema.ts` next to
  the module. Use `FormField` for label/hint/error wiring.
- Submit with `fetcher.submit(toJsonPayload(input), { method: 'post', encType: 'application/json' })`
  to the route's `action`, which calls `api/<resource>/server.ts` and redirects.
- Before submitting, `queryClient.removeQueries` for any list/detail the
  redirect lands on — otherwise it shows its cached, pre-save data.

## UI patterns

- Page content: `<ModuleLayout>` gives the max-width main column with `gap-6`;
  page header is an `h1` (`text-2xl font-semibold`) plus a muted line.
- Cards: `Card` / `CardHeader` / `CardTitle` / `CardAction` / `CardContent`.
- Status chips: `<Badge tone="critical|warning|success|info|neutral">`.
- Tables: `DataTable` styles from `components/data-table.tsx` (44px header, 64px
  rows, horizontal scroll on narrow screens).
- Buttons are 40px (`h-10`), `rounded-lg`; inputs match.
