# Plan: "Crear nuevo formulario" → Form builder UI (same links, routes, integrations)

This document plans how the **"+ Crear nuevo formulario"** action leads into the existing form builder UI (title, tabs Contenido/Recompensas/Compartir/Respuestas, left sidebar, center editor, AI assistant) **without changing routes or APIs**.

---

## 1. Current flow (keep as baseline)

| Step | Where | What happens |
|------|--------|----------------|
| 1 | Dashboard sidebar | User clicks **"+ Crear nuevo formulario"** → calls `onCreateForm` (dashboard `handleCreateForm`) |
| 2 | Dashboard page | `handleCreateForm`: `POST /api/forms` with `ownerAddress`, `workspaceId` (or null), `title: 'Untitled Form'`, `description: ''`, `fields: []` |
| 3 | API | `POST /api/forms` creates form in DB, returns `{ id, slug }` |
| 4 | Dashboard page | `router.push(\`/form/${id}/edit\`)` → user lands on form editor |

**No new route is used.** The "new" form is just a form with empty `fields`; the same editor UI is used.

---

## 2. Existing routes and links (do not change)

| Route | Purpose | Used by |
|-------|---------|--------|
| `/form/[id]/edit` | Form builder: content, questions, welcome/ending, AI | Main editor; default after create |
| `/form/[id]/rewards` | Rewards config | Tab "Recompensas" |
| `/form/[id]/share` | Share link, settings | Tab "Compartir" |
| `/form/[id]/answers` | View responses | Tab "Respuestas" |
| `/f/[slug]` | Public survey (fill form) | "Copiar Link" in editor |

All of these stay. The "new UI" is the existing UI at `/form/[id]/edit` (and sibling tabs).

---

## 3. Existing integrations (reuse as-is)

| Integration | API / hook | Used in editor |
|-------------|------------|----------------|
| Create form | `POST /api/forms` | Dashboard only (before redirect) |
| Load form | `GET /api/forms/[id]` | `useFormData(formId)` in edit page |
| Save form | `PUT /api/forms/[id]` | `useFormData` (fields, title, isActive, etc.) |
| Publish | Set `isActive: true` via `PUT` | FormEditNavigation / header |
| Copy link | `window.location.origin/f/${formData.slug}` | FormEditNavigation |
| Rewards | `GET/POST /api/forms/[id]/rewards/*` | Rewards tab & modals |
| AI assistant | Existing AI flow in `AIAssistantForm` | Right sidebar in edit |

No new APIs required for the basic "create → edit" flow.

---

## 4. UI mapping (image → codebase)

| UI element in the form builder | Current component / location |
|--------------------------------|-----------------------------|
| Form title + "Actualizado …" | `FormEditNavigation` (title + last saved time) |
| Tabs: Contenido, Recompensas, Compartir, Respuestas | `FormEditNavigation` → `router.push(\`/form/${id}/edit|rewards|share|answers\`)` |
| "Copiar Link" | `FormEditNavigation` → copy `/f/${slug}` |
| User dropdown (D6) | `FormEditNavigation` (avatar + dropdown) |
| Warning "Formulario publicado. No puedes modificar…" | Editor page when `formData.isActive` (read-only content when published) |
| Left sidebar: question list, Welcome screen, Ending | `form/[id]/edit/page.tsx` (question list + welcome/ending blocks) |
| Center: "+ Añadir pregunta", type dropdown (Opción única…), required toggle | Same edit page: `QuestionTypeSelector`, add field, field editor |
| Right sidebar: "Al Assistant", tips, chat | `AIAssistantForm` in `form/[id]/edit/AIAssistant.tsx` |

So the "new UI" is already the current editor; we only need to keep the create flow pointing at it.

---

## 5. Recommended implementation (no route changes)

- **Keep current behavior:**  
  **"+ Crear nuevo formulario"** → `POST /api/forms` (same body: `ownerAddress`, `workspaceId`, `title: 'Untitled Form'`, `description: ''`, `fields: []`) → `router.push(\`/form/${id}/edit\`)`.

- **Optional enhancements (still same links/routes):**
  - **Loading state:** Show a short loading state (e.g. "Creando formulario…") between click and redirect so the user sees that something is happening.
  - **Empty state in editor:** When `formData.fields.length === 0`, the editor already has "+ Añadir pregunta" and the AI assistant; no change required unless you want an extra "Start with a template" or "Generate with AI" CTA on first load.
  - **Optional intermediate step (same final route):** If later you add a "new form" screen (e.g. choose template or run AI first), it should still:
    - Create the form with `POST /api/forms` (with or without initial `fields`),
    - Then `router.push(\`/form/${id}/edit\`)` so the user always lands on the same editor UI and same links (Contenido, Recompensas, Compartir, Respuestas).

---

## 6. What not to do

- Do **not** add a route like `/form/new` that replaces the editor: the canonical place to edit (new or existing) is `/form/[id]/edit`.
- Do **not** change `POST /api/forms` contract or the response `{ id, slug }`; the redirect depends on `id`.
- Do **not** duplicate editor logic: any "new form" flow should end at `/form/[id]/edit` and reuse `FormEditNavigation`, `useFormData`, and the existing tabs/rewards/share/answers links.

---

## 7. Summary

| Action | Result |
|--------|--------|
| User clicks "+ Crear nuevo formulario" | Call existing `handleCreateForm`: `POST /api/forms` → `router.push(\`/form/${id}/edit\`)` |
| User lands on form builder | Same UI: header, tabs, left sidebar (questions + welcome/ending), center (add question, type, required), right (AI). Same links and routes. |
| All tabs and share | Same routes: `/form/[id]/edit`, `/form/[id]/rewards`, `/form/[id]/share`, `/form/[id]/answers`; "Copiar Link" = `/f/[slug]`. |

The new form is simply an existing form with empty `fields`; the same editor and same integrations are used.
