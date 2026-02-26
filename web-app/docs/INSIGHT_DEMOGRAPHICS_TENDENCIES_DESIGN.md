# Design: Demographics + Tendencias (two boxes side by side)

This doc specifies the **two-box layout** for **Análisis demográfico** (left) and **Tendencias** (right) in the Insight tab, matching the provided reference.

---

## Layout

- **Container:** Single row, two equal-width cards on `md` and up; stack vertically on small screens.
- **Grid:** `grid grid-cols-1 md:grid-cols-2 gap-5` (or equivalent) so Demographics and Tendencias sit **next to each other**.
- **Cards:** White background, rounded corners, subtle shadow, light grey page background.

---

## Left box: ANÁLISIS DEMOGRÁFICO

### Header
- **Icon:** Blue icon (e.g. two people / Users from Lucide) on the left.
- **Title:** `ANÁLISIS DEMOGRÁFICO` — uppercase, dark grey, small caps style (e.g. `text-[10px] font-bold uppercase tracking-wider`).
- Same header strip as other Section 2 blocks (e.g. border-b, light bg).

### Body (in order)

1. **RANGO DE EDAD**
   - Label: "Rango de edad" (or "RANGO DE EDAD" small caps).
   - **Horizontal bar chart** (Recharts `BarChart` layout="vertical"):
     - One bar per age bucket (e.g. 18-24, 25-29, 30-35).
     - **Predominant bar:** Purple fill; label or badge: **"Predominante: &lt;range&gt;"** in purple (e.g. "Predominante: 25-29").
     - **Other bars:** Light grey fill.
     - Percentage on the **right** of each bar (e.g. 45.2%, 15%, 30%).

2. **UBICACIÓN PRINCIPAL**
   - **Icon:** Blue map pin (`MapPin`).
   - **Text:** Bold, dark grey. Value from `demo.location` (e.g. "Madrid, ES" or "No disponible").

3. **GÉNERO PREDOMINANTE**
   - **Layout:** Same row as Ubicación (flex; Ubicación left, Género right) or immediately below.
   - **Icon:** Pink/female symbol (e.g. `User` or a dedicated icon if available).
   - **Text:** Bold, e.g. "Femenino (62%)" from `demo.gender`, or hide if null.

4. **TASA DE FINALIZACIÓN**
   - **Value:** Large, bold, **green** (e.g. `text-2xl font-bold text-green-600`) — e.g. "100%".
   - **Icon:** Large green circle with white checkmark (`Check` inside a green rounded-full).
   - Placed at bottom of card for emphasis.

### Optional: Demographics insight
- If `getDemographicsInsight(demo)` returns a string, show a short **one-line summary** at the top of the body (e.g. subtle primary-tinted strip) so the card still leads with Rango de edad but includes the sentence above or below the chart.

---

## Right box: TENDENCIAS

### Header
- **Icon:** Red or orange icon (e.g. line chart / `TrendingUp` or `Activity`) on the left.
- **Title:** `TENDENCIAS` — same typography as left card (uppercase, dark grey).

### Body (in order)

1. **Respuestas hoy**
   - **Value:** Large, bold, **green**: e.g. "+2" (or "0" when zero).
   - **Badge:** When `responsesToday > 0`, show a small green pill/badge: **"CRECIENTE"** (white text on green).
   - **Visual:** Optional small green upward line segment (sparkline) to the right to suggest growth.

2. **HORARIO PICO**
   - **Icon:** Orange clock (`Clock`, orange color).
   - **Text:** Bold, dark grey. Value: `trends.peakHourRange` (e.g. "14:00 - 16:00") or "—" if null.

3. **TASA DE REBOTE**
   - **Icon:** Red icon (e.g. arrow-out / bounce style).
   - **Text:** Bold. Value: `trends.bounceRate` (e.g. "4.2%" or "—" placeholder).

4. **TIEMPO PROM.**
   - **Icon:** Blue stopwatch (e.g. `Timer` or `Clock` in blue).
   - **Text:** Bold. Value: `trends.avgTime` (e.g. "2:30 min" or "—").

5. **DISPOSITIVO**
   - **Icon:** Blue desktop (`Monitor`).
   - **Text:** Bold. Value: `trends.device` (e.g. "Desktop" or "—").

**Layout for 2–5:** Two columns on larger cards: e.g. Horario pico + Tasa de rebote on one row, Tiempo prom. + Dispositivo on the next; or a simple 2x2 grid so the card stays compact and readable.

6. **Insight / improvement message (bottom)**
   - **Container:** Rectangular box, light grey background, full width at bottom of card.
   - **Left:** Small **red square** with **white lightning bolt** icon (`Zap`).
   - **Text:** e.g. "La velocidad de respuesta ha mejorado un 12% respecto a ayer." from `trends.improvementMessage`; only render when non-null.

---

## Icons (Lucide)

| Element              | Icon suggestion | Color   |
|----------------------|-----------------|--------|
| Demographics header  | `Users`         | Blue   |
| Tendencias header    | `TrendingUp` or `Activity` | Red/Orange |
| Ubicación            | `MapPin`        | Blue   |
| Género               | `User` or custom| Pink/grey |
| Tasa finalización    | `Check` in circle | Green  |
| Horario pico         | `Clock`         | Orange |
| Tasa de rebote       | `TrendingDown` or `LogOut` | Red   |
| Tiempo prom.         | `Timer` or `Clock` | Blue  |
| Dispositivo          | `Monitor`       | Blue   |
| Mejora (mensaje)     | `Zap`           | White on red bg |

---

## Data (no API changes)

- **Demographics:** `getDemographics(responses, formData.fields ?? [])` → `ageDistribution`, `dominantAge`, `location`, `gender`, `completionRate`. Optional: `getDemographicsInsight(demo)` for the one-line summary.
- **Tendencias:** `getTrends(responses)` → `responsesToday`, `peakHourRange`, `bounceRate`, `avgTime`, `device`, `improvementMessage`.
- **Predominant age:** Use `demo.dominantAge` to decide which bar gets purple and the "Predominante: X" label; all bars use `demo.ageDistribution`.

---

## Implementation steps

1. **Layout:** Wrap the current Section 2.2 (Demographics) and Section 2.3 (Tendencias) in a single wrapper with `grid grid-cols-1 md:grid-cols-2 gap-5`.
2. **Left card (Demographics):**
   - Header: Users icon (blue) + "ANÁLISIS DEMOGRÁFICO".
   - Age chart: horizontal bars; for each bar, if `name === demo.dominantAge` use purple bar + "Predominante: &lt;name&gt;" and purple percentage; else grey bar.
   - Row or block: MapPin + location; then User + gender (if present).
   - Bottom: completion rate as large green "X%" + green circle with Check.
   - Optionally show demographics insight strip at top of body.
3. **Right card (Tendencias):**
   - Header: TrendingUp/Activity icon (red/orange) + "TENDENCIAS".
   - Respuestas hoy: "+N" green, "CRECIENTE" badge when N > 0; optional sparkline.
   - Grid or rows: Horario pico (Clock orange), Tasa de rebote (red icon), Tiempo prom. (blue), Dispositivo (Monitor blue).
   - Bottom: grey alert box with red square + Zap, and `improvementMessage` text when present.
4. **Responsive:** On small screens, stack the two cards (grid-cols-1); on md+, two columns.
5. **Placeholders:** Keep "—" for bounce rate, avg time, device until backend provides them; show "4.2%", "2:30 min", "Desktop" in design only if we add mock or real data later.

---

## File to change

- **Primary:** `web-app/app/(wallet)/form/[id]/answers/page.tsx`
  - Replace the two separate full-width blocks (Section 2.2 and 2.3) with one grid containing the two cards.
  - Restyle each card to match the spec above (headers, icons, colors, predominant bar, improvement box).

Optional: extract the two cards into `InsightDemographicsCard.tsx` and `InsightTendenciasCard.tsx` for clarity; same data props from the page.
