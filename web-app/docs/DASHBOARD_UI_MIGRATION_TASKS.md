# Dashboard UI migration – task map

This document maps the **new dashboard design** (Formly: sidebar + “Mis Formularios” + right metrics panel) to **existing APIs and hooks**, and lists tasks so the UI can be replaced without losing integration.

---

## 1. Data & API mapping

### 1.1 Left sidebar

| New UI element | Current source | API / hook | Notes |
|----------------|-----------------|------------|--------|
| **Formly logo** | Static | — | Branding only. |
| **“Crear nuevo formulario”** | `DashboardSidebar` | `POST /api/forms` with `ownerAddress`, `workspaceId` | Already implemented. Keep handler; only restyle button (purple pill, + icon). |
| **Mis Formularios** | Tab / nav state | `useForms`, active tab | Map to current “active” forms list. Mark as selected (purple left bar + purple text). |
| **Recompensas** | New nav item | — | Link to a rewards overview (e.g. first form’s rewards or a new route). No new API. |
| **Participantes** | New nav item | — | Link to participants/answers view (e.g. `dashboard/[id]` or new route). Uses existing form detail. |
| **Reportes** | New nav item | — | Link to reports/analytics (placeholder or existing `dashboard/[id]` “Resumen”). |
| **Configuración** | New nav item | — | Link to settings (placeholder or profile). |
| **User block (avatar, name, role)** | Profile + wallet | `GET /api/profile?address={wallet}`; `account` from `useWallet()` | Profile returns `firstName`, `lastName`, etc. Derive “Emilia Caitlin” and show “Administrador” as static or from profile if you add a role field later. |

**Workspaces:** The current sidebar uses **workspaces** (`GET /api/workspaces?ownerAddress=...`) and `WorkspaceNav`. In the new design, “Mis Formularios” is the main entry. You can either:
- Keep workspace filter inside “Mis Formularios” (e.g. dropdown or submenu), or  
- Hide workspaces in the new sidebar and keep workspace logic in the main area.  

**Preserve:** `useWorkspace`, `loadWorkspaces`, `CreateWorkspaceModal`, `selectedWorkspaceId` / `workspaceFilter` when fetching forms.

---

### 1.2 Top header (search, notifications, user)

| New UI element | Current source | API / hook | Notes |
|----------------|----------------|------------|--------|
| **Search “Buscar formularios…”** | None | Client-side filter on `forms` from `useForms()` | No new API. Filter `forms` by `title` (and optionally `description`) in state. |
| **Notification icon** | None | — | Static icon for now; wire to real notifications later if needed. |
| **Rocket (Pro)** | None | — | Static icon; link to “Upgrade to Pro” or marketing. |
| **User avatar** | Wallet / profile | `account` from `useWallet()`; optionally `GET /api/profile?address=...` for avatar URL if you add it | Use same source as sidebar user block. |

**Preserve:** Wallet connection and account; optional profile fetch for name/avatar.

---

### 1.3 Main content – “Mis Formularios”

| New UI element | Current source | API / hook | Notes |
|----------------|----------------|------------|--------|
| **Title “Mis Formularios”** | Static / workspace name | Can keep `workspaceName` from `useWorkspace()` for current context. | Or always “Mis Formularios” and show workspace in subtitle/dropdown. |
| **List / grid toggle** | `viewMode` state | Same as now | Keep `viewMode` and `setViewMode`; only restyle (list icon vs grid icon). |
| **Form cards** | `forms` from `useForms()` | `GET /api/forms?address=...&workspaceId=...` (and `archived=true` for archived tab) | Keep same data; new card layout. |
| **Per-card: document icon, title** | `form.title` | From `FormResponse` | Already available. |
| **Per-card: status tag (ACTIVO / PENDIENTE / INACTIVO)** | `form.isActive`, `form.isArchived` | From `FormResponse` | Map: active + not archived → “ACTIVO”; archived → “INACTIVO”; not active + not archived → “PENDIENTE”. Use green / orange / red. |
| **Per-card: “Creado hace X días • N respuestas”** | `form.createdAt`; response count | `createdAt` from API. **Response count:** not in current API. | See “Response count” below. |
| **Per-card: “N RESPUESTAS”** | Response count | Same as above. | — |
| **Per-card: ellipsis menu** | Actions | Existing: edit (navigate), archive. Optional: duplicate, delete if you add it. | Keep `onArchive`; add menu with Edit, Archivar/Restaurar, etc. Edit = `Link` to `form/[id]/edit`. |

**Response count:**  
- **Option A (recommended):** Extend `GET /api/forms` to include response count per form, e.g. Prisma `include: { _count: { select: { responses: true } } }` and return `responseCount` (or `_count.responses`) in each form. Then use it for “N respuestas” and “Creado hace X días • N respuestas”.  
- **Option B:** Add a small “dashboard stats” endpoint that returns `{ totalResponses, forms: [{ id, responseCount }] }` and merge into current forms list in the client.

**Preserve:** `useForms(account?.address, workspaceFilter)`, `handleArchive`, `tab` (active/archived), `FormList` / `FormListItem` / `FormCard` logic – only replace the presentational components and add search + response count where needed.

---

### 1.4 Right sidebar – “Métricas Rápidas” and cards

| New UI element | Current source | API / hook | Notes |
|----------------|----------------|------------|--------|
| **Total de Respuestas** | Sum of form response counts | If you add `responseCount` to forms (Option A above), sum in client. Or from a new “metrics” endpoint. | No new API if forms include count. |
| **Presupuesto Global Restante** | Sum of remaining budget per form | For each form: `GET /api/forms/[id]/rewards/budget` → `total - consumed - pending`. Then sum. Or new endpoint. | Either N calls (cache per form) or one “dashboard metrics” endpoint that aggregates. |
| **Formularios Activos** | Count of active forms | `forms.filter(f => f.isActive).length` from `useForms()`. | No new API. |
| **Sugerencia** | Static or future API | — | Static text for now or placeholder. Later: suggestions API. |
| **Upgrade to Pro** | Static | — | Static card + “Obtener Acceso Pro” button (link to pricing/contact). |
| **Versión 2.4.0** | Static | — | Footer text. |

**Preserve:** No existing dashboard logic depends on the right sidebar; it’s additive. Reuse `useForms()` for active count; optionally add a small hook that fetches budgets for visible forms if you don’t add an aggregate endpoint.

---

## 2. Task list (implementation order)

Do these in order so the UI is replaced step by step without breaking existing behavior.

### Phase 1 – Data readiness (APIs / types)

1. **Add response count to forms API (recommended)**  
   - In `GET /api/forms`, add Prisma `_count: { select: { responses: true } }` and return e.g. `responseCount` (or `_count.responses`) per form.  
   - Update `FormResponse` (or form list type) to include `responseCount?: number` so the new cards can show “N respuestas” and the header can show “Total de Respuestas”.

2. **(Optional) Dashboard metrics endpoint**  
   - If you prefer not to change the forms API: add `GET /api/dashboard/metrics?address=...` returning `{ totalResponses, totalBudgetRemaining, activeFormsCount }` and use it for the right sidebar only.  
   - Otherwise, compute total responses and active count from `useForms()` and (if needed) one extra request or small hook that fetches reward budgets for the current user’s forms.

### Phase 2 – Layout and shell

3. **New dashboard layout (3 columns)**  
   - Build a new layout: **left sidebar** (fixed width) + **main** (flex) + **right sidebar** (fixed width).  
   - Use the same root as now (e.g. `dashboard/page.tsx` and existing wallet/layout wrapper) so `useWallet()`, `useForms()`, `useWorkspace()` stay in place.  
   - On small screens: collapse sidebars (drawer or hide) and keep main content full width so “content one after another” still works.

4. **Left sidebar – new component**  
   - New component (e.g. `DashboardSidebarV2` or replace `DashboardSidebar`): Formly logo, “Crear nuevo formulario” (current create handler), MENÚ PRINCIPAL (Mis Formularios, Recompensas, Participantes, Reportes, Configuración), user block at bottom.  
   - **Keep:** `handleCreateForm` → `POST /api/forms` with `ownerAddress` and `selectedWorkspaceId`; `useWorkspace` and workspace selection can live in this sidebar or in the main header.  
   - **User block:** Fetch profile with `GET /api/profile?address={account?.address}` and display name (e.g. `firstName lastName`) and “Administrador”; avatar from wallet or profile if you add it.

5. **Top header – new component**  
   - Search input (filter forms by title), notification icon, rocket icon, user avatar.  
   - Search: local state `searchQuery`; filter `forms` before passing to the list: `forms.filter(f => f.title.toLowerCase().includes(searchQuery))`.  
   - Keep wallet/user from `useWallet()` and optional profile.

### Phase 3 – Main content (Mis Formularios)

6. **“Mis Formularios” section**  
   - Title “Mis Formularios” and list/grid toggle (reuse `viewMode`).  
   - Keep tab state (active vs archived); you can move the tab into the sidebar (Mis Formularios = active, optionally “Archivados” as separate item or submenu).

7. **Form cards – new design, same data**  
   - Replace `FormListItem` / `FormCard` with new card UI: document icon, title, status pill (ACTIVO / PENDIENTE / INACTIVO from `isActive`/`isArchived`), “Creado hace X días • N respuestas”, “N RESPUESTAS”, ellipsis menu.  
   - **Keep:** `form.id`, `form.title`, `form.isActive`, `form.isArchived`, `form.createdAt`, link to `form/[id]/edit`, `onArchive(form.id, true/false)`.  
   - **Add:** `responseCount` from Phase 1 and format date (e.g. “Creado hace 2 días”).  
   - Ellipsis: Edit (navigate), Archivar/Restaurar (call `onArchive`).  
   - Do the same for list view if the design has a list variant; same props, different layout.

8. **Empty state and loading**  
   - Reuse or restyle `EmptyState` for no forms; keep loading state from `useForms()` (same loading flag, new spinner/skeleton if desired).

### Phase 4 – Right sidebar (metrics and upsell)

9. **Métricas Rápidas panel**  
   - Total de Respuestas: sum of `responseCount` from forms (or from metrics endpoint).  
   - Presupuesto Global Restante: sum of (total - consumed - pending) from reward budgets; either fetch budgets for each form (e.g. when workspace/form list is loaded) or from aggregate endpoint.  
   - Formularios Activos: `forms.filter(f => f.isActive).length`.  
   - Use existing primary color for the purple number and progress bar.

10. **Sugerencia card**  
    - Static text or placeholder; no API for now.

11. **Upgrade to Pro card**  
    - Static card with gradient, “Obtener Acceso Pro” button (link).

12. **Footer version**  
    - “VERSIÓN 2.4.0” (or your version) at bottom of right sidebar.

### Phase 5 – Navigation and routes

13. **Wire new nav items**  
    - **Recompensas:** e.g. link to `form/[firstFormId]/rewards` or a new “rewards overview” page that uses existing rewards APIs.  
    - **Participantes:** e.g. link to `dashboard/[id]` (form detail) or a dedicated participants list using existing form + responses.  
    - **Reportes:** link to `dashboard/[id]` “Resumen” tab or placeholder.  
    - **Configuración:** link to a settings or profile page (profile: `GET`/`POST /api/profile`).

14. **Workspace handling**  
    - If you keep workspaces: add a workspace selector (dropdown or in sidebar) and keep passing `selectedWorkspaceId` into `useForms(..., workspaceFilter)` so the forms list and metrics stay filtered.  
    - If you remove workspace from the new sidebar, keep the filter in the main area or in a single “default” workspace so the API still receives the same parameters.

### Phase 6 – Polish and responsive

15. **Responsive behavior**  
    - Left sidebar: drawer on mobile (hamburger or “Menú”), main content full width.  
    - Right sidebar: hide or collapse below main content on small screens so layout is “one after another”.  
    - Header: search and icons stack or shrink; avatar stays.

16. **Dark mode (if applicable)**  
    - If the app has a theme toggle (e.g. moon icon), ensure new components respect the same theme (CSS variables or Tailwind dark:). No API changes.

---

## 3. What not to change (keep integration)

- **Wallet and auth:** `useWallet()`, existing wallet layout/guard.  
- **Forms CRUD:** `GET /api/forms`, `POST /api/forms`, `PATCH /api/forms/[id]/archive`; `useForms()`.  
- **Workspaces:** `GET /api/workspaces?ownerAddress=...`, create/rename/leave/delete modals and handlers.  
- **Profile:** `GET /api/profile?address=...` (and POST for updates) for user name/block.  
- **Rewards:** `GET /api/forms/[id]/rewards/budget` (and other reward endpoints) for per-form or aggregated budget.  
- **Form edit flow:** Navigation to `form/[id]/edit`, share, answers, rewards – same routes and APIs.  
- **Form detail page:** `dashboard/[id]` and `GET /api/forms/[id]`; keep or adapt only the visual style.

---

## 4. Summary

- **Only UI and client-side filtering** change; no removal of existing API calls or hooks.  
- **Optional backend change:** add `responseCount` (and optionally an aggregate metrics endpoint) for a cleaner and more accurate dashboard.  
- **Order of work:** Data (response count) → layout and sidebars → main form list and cards → metrics panel → nav links and responsive.  
- **Result:** New look and structure (sidebar, header, metrics) with the same integrations and no regressions in create, archive, edit, or rewards.
