# Plan: Insight Section (Survey Responses)

This document plans the **Insight** tab inside a specific survey’s Responses area (`/form/[id]/answers` → tab "Insight"). The goal is to connect the UI to existing data and keep it in **3 clear sections**, using free and secure libraries only.

---

## Current state

- **Route:** `app/(wallet)/form/[id]/answers/page.tsx` — tabs: **Insight** | Resumen | Individual.
- **Data source:** `GET /api/public/surveys/[id]/responses` returns:
  - `id`, `respondentName`, `respondentWallet`, `responses` (record by field id), `createdAt`.
- **Client shape:** `ResponseData[]` with `id`, `respondent: { name, wallet }`, `date` (formatted), `answers: { question, answer }[]`.
- **Form:** `formData.fields` (label, type, options, id).
- **DB:** `Response` has `answers` (JSON), `walletAddress`, `aiScore`, `createdAt`. No device, location, or completion time.
- **Libraries:** **Recharts** is already installed and used in the Resumen tab (Bar, Pie, etc.). No new chart library needed.

---

## Section 1: Key insights overview

**Purpose:** High-level, scannable insight cards (4 cards as in the design).

**Content (data-driven where possible):**

| Card | Title (example) | Source of truth |
|------|------------------|------------------|
| 1 | Mayor participación | Derive from answers: find a field whose label/options look like “edad” / “rango de edad” (e.g. "18-24", "25-29", "30-35"). Compute distribution; show the dominant option and its %. If no such field, show a generic “Distribución por preguntas” or hide this card. |
| 2 | Alta recomendación | Find a field about “recomendar” / NPS / satisfaction (by label or options). Compute % “Sí” / “Recomendaría” / top option. Else show “N/A” or hide. |
| 3 | Consistencia | **Real:** `(responses with all questions answered) / totalResponses * 100`. Use `answers` length vs `formData.fields.length`. |
| 4 | Sentimiento predominante | **Option A:** Use existing `aiScore` from DB (average, map to “Positivo/Neutral/Negativo” bands). **Option B:** For text answers, optional client-side sentiment (e.g. minimal keyword list or a small, free sentiment lib). Default to “N/A” if no data. |

**Implementation notes:**

- Reuse existing `responses` and `formData.fields` in the same page; no new API for Section 1.
- Add a small **insight derivation helper** (e.g. `getInsightsFromResponses(responses, fields)`) that returns the 4 bullet points (or fewer when data is missing).
- UI: keep the current card layout (numbered cards with icon/color). Replace hardcoded text with the derived values.

**Libraries:** None required. Optional: a very small sentiment library (e.g. sentiment in npm, or a few keywords) only if we want Card 4 from text answers without backend.

---

## Section 2: Detailed analytics (quality, demographics, trends)

**Purpose:** Deeper analytics in three sub-blocks: dataset quality, demographics, trends.

### 2.1 Calidad del dataset (Dataset quality)

- **Radar chart:** 3 axes — Integridad, Coherencia, Diversidad.
  - **Integridad:** % of responses that have an answer for every field (no empty required answers). We have `answers` and `fields`; compute per response then average.
  - **Coherencia:** Can use average **aiScore** (already on `Response`) normalized to 0–100, or a simple heuristic (e.g. answer length variance). If no aiScore, use “N/A” or same as Integridad.
  - **Diversidad:** Count of distinct answer values across responses (e.g. per field, average uniqueness). Simple metric: low if everyone answered the same.
- **“9.4 SCORE IA”:** Use average `aiScore` from responses (scale e.g. 0–10). If no aiScore, show “—”.

**Libraries:** **Recharts** already provides `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`. No new install.

### 2.2 Análisis demográfico (Demographics)

- **Rango de edad:** Same as Section 1 — detect “edad”/“age” field and show **horizontal bar chart** (Recharts) with distribution (18-24, 25-29, etc.). If no such field, show a message “No hay campo de edad” or hide.
- **Ubicación principal:** We don’t have location in DB. **Placeholder:** “No disponible” or hide until we add a location field/API.
- **Género predominante:** Same idea: detect a “género”/“gender” field and show dominant value + %. Otherwise hide or “No disponible”.
- **Tasa de finalización:** **Real:** same as Section 1 consistency (e.g. % of responses with all questions answered).

**Libraries:** Recharts (BarChart horizontal). No new install.

### 2.3 Tendencias (Trends)

- **Respuestas hoy:** **Real:** filter `responses` by `createdAt` === today; count. Show “+N” or “0”.
- **Horario pico:** **Real:** group `createdAt` by hour (local); show hour range with max count (e.g. “14:00 - 16:00”).
- **Tasa de rebote:** Not in DB. **Placeholder:** “—” or omit until we have session/abandon data.
- **Tiempo prom.:** Not in DB. **Placeholder:** “—” or “N/A” until we store completion time.
- **Dispositivo:** Not in DB. **Placeholder:** “—” or “N/A”.
- **Frase de mejora:** Optional: if we have previous-day response count, show “La velocidad de respuesta ha mejorado un X% respecto a ayer”; else hide.

**Libraries:** None. All from `responses[].date` / `createdAt`.

---

## Section 3: Timeline of responses

**Purpose:** Chronological list of responses (anonymous or wallet, timestamp).

**Content:**

- Reuse existing `responses` array (already sorted by date on the client or can sort by `createdAt`).
- For each item show:
  - Label: “Anónimo” or respondent name (we have `respondent.name` / “Anónimo”, `respondent.wallet` / “Sin wallet”).
  - Subtitle: “Sin wallet” when no wallet, or truncated wallet.
  - Timestamp: use existing `response.date` (already formatted in es-ES).

**Implementation:**

- This block already exists in the current Insight tab (around line 661). Keep it; ensure it uses the same `responses` and formatting as above (no duplicate logic).
- Remove the **duplicate** Insight block that appears earlier in the file (the minimal “KEY INSIGHTS” block around lines 217–235) so there is a single Insight view.

**Libraries:** None.

---

## Data and API summary

| Data point | Source | Note |
|------------|--------|------|
| Responses list | Existing `responses` from `/api/public/surveys/[id]/responses` | Already loaded on answers page |
| Form fields | `formData.fields` | Already available |
| Per-response answers | `response.answers` | Array of { question, answer } |
| Created at | `response.date` / `createdAt` | For “today”, “peak hour”, timeline |
| AI score | `Response.aiScore` in DB | API currently returns `responses` without aiScore; need to **include aiScore** in the API response for Section 2.1 |

**Required API change:**

- In `GET /api/public/surveys/[id]/responses`, include `aiScore` (and optionally `reward`, `rewardStatus`) in each returned response so the Insight section can compute dataset quality and “Score IA” without a new endpoint.

---

## Libraries (all free and secure)

- **Recharts** (already in project): Bar, Pie, Radar, ResponsiveContainer, Tooltip. No new install.
- **Optional:** A small sentiment or keyword-based helper for “Sentimiento predominante” if we don’t use aiScore; choose a well-maintained, small dependency (e.g. `sentiment` on npm) only if needed.

---

## Implementation order

1. **API:** Add `aiScore` (and any other needed fields) to the responses API payload.
2. **Helpers:** Add `getInsightsFromResponses(responses, fields)` and `getDatasetQuality(responses, fields)`, `getDemographics(responses, fields)`, `getTrends(responses)` in a small util or inside the page.
3. **Section 1:** Replace hardcoded insight cards with derived data; support “N/A” when a field isn’t detected.
4. **Section 2:** Implement quality (radar + score), demographics (bar + completion rate), trends (today, peak hour; placeholders for bounce/time/device).
5. **Section 3:** Keep a single “Response timeline” block; remove duplicate Insight block.
6. **Cleanup:** Remove duplicate Insight tab content so there is one consistent Insight view in three sections.

---

## File structure (suggested)

- **Keep:** `app/(wallet)/form/[id]/answers/page.tsx` as the single page; optionally extract Section 1–2–3 into components for readability:
  - `InsightSectionKeyInsights.tsx`
  - `InsightSectionAnalytics.tsx` (quality + demographics + trends)
  - `InsightSectionTimeline.tsx`
- **Util:** `lib/insightHelpers.ts` (or `lib/surveys/insightHelpers.ts`) for derivation functions that work on `ResponseData[]` and `fields`.

This keeps the Insight section connected to the existing survey responses and form structure, with no extra backend beyond exposing `aiScore` in the current API.
