# Plan: Configuración (Settings) Page

Two-section layout matching the design: **Section 1 – Configuración de Perfil** (center) and **Section 2 – Información de Cuenta** (right sidebar).

---

## Routing & sidebar

- **Route:** `/dashboard/configuracion`
- **Sidebar:** "Configuración" in the main dashboard sidebar links to `/dashboard/configuracion` (currently it links to `/dashboard`). When `pathname === '/dashboard/configuracion'`, the item is highlighted (same style as Recompensas/Reportes).
- **Layout:** Same shell as Reportes/Rewards: left sidebar (DashboardSidebarV2), center content, right sidebar. No search bar in header for this page (optional minimal header with menu only).

---

## Section 1: Configuración de Perfil (center)

**Purpose:** Manage personal info and account actions.

**Content:**

1. **Header**
   - Title: "Configuración de Perfil"
   - Subheading: "Administra tu información personal y preferencias de cuenta."

2. **Profile photo**
   - Large circular placeholder with user silhouette icon.
   - Camera icon overlay (bottom-right of circle) for "change photo".
   - Link below: "EDITAR FOTO" (primary color). **Mock only** — no upload endpoint; click can show a toast or do nothing for now.

3. **Form fields** (from `GET /api/profile?address=...` and local state)
   - **NOMBRE COMPLETO:** Single input or two inputs (firstName, lastName). Backend has `firstName`, `lastName` — display as "Full name" = `firstName + ' ' + lastName`, edit as one field and split on save, or two fields. Prefer one field "Nombre completo" and split by first space for firstName/lastName for simplicity, or keep two inputs if design shows two.
   - **CORREO ELECTRÓNICO:** Input, bound to `email` from profile.
   - **ROL DE USUARIO:** Dropdown, options e.g. "Administrador". **Mock only** — not in backend; display only or local state.

4. **Actions**
   - **Guardar cambios:** Primary button. On click: `POST /api/profile` with `{ walletAddress, firstName, lastName, email, phone }`. Backend **exists** (profile route has POST upsert). Show success toast and optionally refetch profile.
   - **Cerrar sesión:** Red text link with LogOut icon. On click: call `logout()` from `usePollar()`, then `router.push('/')`. **Real** — same as WalletHeader.

**Data:** Profile from `GET /api/profile?address={walletAddress}`. Save with `POST /api/profile` (body: walletAddress, firstName, lastName, email, phone). No backend change needed for save.

---

## Section 2: Información de Cuenta (right sidebar)

**Purpose:** Account status and security at a glance.

**Content:**

1. **Header:** "INFORMACIÓN DE CUENTA" (uppercase, small label).

2. **ESTADO DE CUENTA**
   - Card: grey background. Green circle icon + text "Activa". **Mock** — we don’t have account status from backend; always "Activa".

3. **ÚLTIMA SESIÓN**
   - Card: "Hoy, 10:45 AM" (or current time), and "IP: 192.168.1.104". **Mock** — no backend for last session/IP; use `new Date()` for time and a placeholder IP, or "—" for IP.

4. **Seguridad**
   - Card: purple tint. Shield icon. Text: "Tu cuenta está protegida con autenticación básica. Activa 2FA para mayor seguridad." Link "CONFIGURAR 2FA". **Mock** — link can be `#` or a placeholder route; no 2FA backend.

5. **Version**
   - Small grey text at bottom: "VERSIÓN 2.4.0" (or read from package.json / env if desired). **Mock** is fine (hardcoded).

---

## Backend vs mock summary

| Feature              | Backend available?        | Action                                |
|----------------------|---------------------------|----------------------------------------|
| Load profile          | Yes — GET /api/profile    | Use it                                |
| Save profile          | Yes — POST /api/profile   | Use it (firstName, lastName, email, phone) |
| Cerrar sesión         | N/A (client)              | usePollar().logout() + redirect       |
| Profile photo         | No                        | Mock "EDITAR FOTO"                    |
| User role             | No                        | Mock dropdown "Administrador"          |
| Estado de cuenta      | No                        | Mock "Activa"                          |
| Última sesión / IP    | No                        | Mock date + placeholder IP             |
| 2FA                   | No                        | Mock card + link                       |
| Versión               | No (or package.json)      | Mock "2.4.0"                           |

---

## Files to add/change

1. **Add:** `app/(wallet)/dashboard/configuracion/page.tsx` — full page with Section 1 (center) and Section 2 (right sidebar).
2. **Change:** `app/(wallet)/dashboard/components/sidebar/DashboardSidebarV2.tsx` — Configuración link `href="/dashboard/configuracion"` and add `isConfigPage` for active styling.

Optional: extract Section 2 into `ConfiguracionRightSidebar.tsx` for consistency with Reportes/Rewards.
