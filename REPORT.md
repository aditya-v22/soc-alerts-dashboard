# Assessment Report — DefenderMate

## What I built

DefenderMate is a SOC alerts triage dashboard. The core loop is: land on the dashboard, get an at-a-glance read of the alert landscape, click into a severity or category to drill into the list, open an alert to investigate it, update its status or dismiss it.

Three views:

- **Dashboard** — stat cards for total, critical, open, and investigating counts. Three charts: severity donut, status bar, category bar. Every chart segment is clickable and takes the analyst to the alerts list filtered to that subset.
- **Alerts list** — paginated table with multi-select filters (severity, status, category, source), date range, debounced search, and sortable columns. Filter state lives in the URL so links are shareable and the browser back button works correctly.
- **Alert detail** — right sidebar panel with two modes: overlay (floats over the table) and sticky (shrinks the table alongside it). Shows all fields including the raw event JSON (collapsible), lets you change status/severity in place, and has a one-click "Dismiss as false positive" button. Changes persist — they go to the database, not just local state. The panel header has a copy-link button that puts a direct URL to the alert on the clipboard, so analysts can share specific alerts with teammates instantly.

---

## Tech choices

**NestJS + Prisma 7 + SQLite** on the backend. NestJS because the module/decorator pattern makes it easy to keep the alerts and auth concerns separate without much ceremony. Prisma for the ORM — the generated types flow through to the service layer cleanly and the `groupBy` query for the stats endpoint was one line. SQLite via `@prisma/adapter-libsql` because there's no infrastructure to set up and it's plenty for this scale.

**Next.js 15 App Router + TanStack Query + shadcn/ui** on the frontend. TanStack Query handles all server state — loading, caching, invalidation after mutations. I deliberately didn't reach for a global store (Zustand, Redux) because the only shared state is the URL (filter params) and a single localStorage preference (panel mode). Pulling in a store for that would have been over-engineering. shadcn/ui for components because it gives you unstyled primitives you own rather than a black-box component library — easier to customise without fighting the library.

URL-driven filter state was a deliberate choice. It means filter combinations are shareable, clicking a chart segment on the dashboard navigates straight to a filtered alerts list, and the browser history is meaningful. The `useAlertFilters` hook encapsulates all the URL read/write logic and memoizes the filter object so TanStack Query's key stays referentially stable between renders.

**JWT auth** — the token is stored in both `localStorage` and a cookie. `localStorage` is what the axios request interceptor reads to attach the `Authorization` header on every API call. The cookie is what the Next.js middleware reads server-side to decide whether to redirect unauthenticated visits to `/login`. Both are needed; they serve different purposes.

**Mock data** — I used Gemini to generate a handful of sample alerts to understand the shape and tone of realistic SOC data, then wrote a seed script (`backend/prisma/seed.ts`) that generates ~1000 alerts programmatically with realistic distributions: a long tail of low/info, a handful of criticals, timestamps spread across the last 60 days, all six categories and four sources represented. The script is committed so the dataset is reproducable.

---

## What I cut

**Realtime SSE** — the backend side isn't complicated (NestJS has `@Sse()` out of the box), but wiring it properly into TanStack Query's cache without introducing subtle bugs felt like it deserved more time than I had.

**Saved filter presets** — the localStorage plumbing is trivial but I ran out of time to build the UI for managing them (name, save, delete, apply). Left it off rather than ship something half-done.

**Bulk actions** — would be useful for an analyst triaging a flood of alerts. Skipped for scope.

**Automated tests** — I would normally have at least integration tests on the alerts service (the filtering/pagination logic has enough branches to warrant it) and a couple of component tests for the filter state hook. No time here.

---

## Trade-offs and things I'd revisit

The selected alert ID lives in the URL, so the detail panel actually survives navigation — if you open an alert and click Dashboard, coming back to `/alerts` will reopen the same panel. That said, the panel mode preference (overlay vs sticky) is in localStorage rather than the URL, so if you share a link the recipient always gets overlay mode regardless of your preference.

The multi-select filter dropdowns are custom-built rather than using a library component. They have basic keyboard accessibility (tab to focus, space to toggle) but are missing a "select all / clear all" shortcut per filter group, which would speed up common triage patterns like "show me everything critical or high".

---

## What I'm happy with

The URL filter state approach worked out well. The dashboard → list deep-link is a single `router.push` with no shared state, and it just works. That felt like the right abstraction.

The two-mode detail panel (overlay vs sticky) is something I've wanted to build for a while. The sticky mode is genuinely useful when you're comparing multiple alerts in sequence — you keep the table context without losing the detail.

The commit history tells an honest story: scaffold, data model, auth, then the JWT secret hardcoded and immediately fixed in the next commit. That kind of thing happens, and I'd rather it be visible than hidden.

---

## What's next

With more time I'd tackle these in order:

**Realtime updates via SSE** — NestJS has `@Sse()` built in, so the backend side is straightforward. On the frontend, the SSE stream would call `queryClient.invalidateQueries` when a new or updated alert comes in, letting TanStack Query re-fetch in the background without any manual refresh. The main thing to get right is cleanup — closing the `EventSource` when the component unmounts and not holding stale query references in the handler.

**Saved filter presets** — for now I'd store named presets in localStorage (serialize the current URL params, give it a label, done). In production that would move to a proper API so presets are tied to a user account and work across devices.

**Bulk actions** for high-volume triage, and automated tests on the filtering and pagination logic after that.

---

*Total time: ~7 hours across two evenings.*
