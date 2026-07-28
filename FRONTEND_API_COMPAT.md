# Frontend ↔ Backend API Compatibility Notes

This document maps what the **frontend team built** (mock API calls in `src/lib/api/index.ts`)
to the **real backend endpoints**. Replace each mock with the live URL when ready.

## Auth

| Frontend placeholder | Real endpoint | Status |
|---|---|---|
| `POST /auth/otp/request` | ~~Removed — OTP dropped~~ | **N/A — Google OAuth only** |
| `POST /auth/otp/verify` | ~~Removed~~ | **N/A** |
| `POST /auth/google` | `POST /api/v1/auth/google` | ✅ Ready |
| Refresh | `POST /api/v1/auth/refresh` | ✅ Ready |

**Action for frontend:** Replace `loginWithGoogle()` mock with a real call to `POST /api/v1/auth/google`
passing the `id_token` from Google Sign-In SDK. The backend returns `{ access_token, refresh_token, user }`.

---

## Subsidy

| Frontend payload field | Backend field | Notes |
|---|---|---|
| `category` | `category` | Frontend uses `'2W'|'3W'|'4W'`, backend normalises to `'2W'|'3W'|'4W Car'|'N1_goods'` |
| `batteryCapacityKwh` | `battery_kwh` | Used for incentive-per-kWh calculation |
| `hasTradeInIce` | `scrappage` (`"yes"/"no"`) | String enum in backend |
| `isDelhiResident` | `city` (pass `"Delhi"`) | Backend resolves city → state → policy |

**Response mapping:**

| Frontend field | Backend field | Source |
|---|---|---|
| `purchaseIncentive` | `breakdown.purchase_incentive` | Policy engine or DB rule |
| `scrappageBonus` | `breakdown.scrappage_bonus` | Policy engine |
| `roadTaxWaiverEstimated` | `breakdown.tax_exemption_pct` | Policy engine (%) |
| `totalBenefit` | `breakdown.total` | Sum of above |
| `eligible` | `eligible` | Boolean |
| `reasonIfIneligible` | `reason` | String if not eligible |

Real endpoint: `POST /api/v1/subsidy/calculate`

---

## Recommendations

| Frontend | Backend |
|---|---|
| `POST /recommendations` (IntakePayload) | `POST /api/v1/recommendations` |
| `budgetMax` | `budget_max` |
| `category` | `preferred_categories: ["2W"]` |
| `dailyCommuteKm` | `daily_km` |
| `tradeInIce` | `scrappage_tradein` |
| `isDelhiResident` | `is_delhi_ncr` (boolean) |

Vehicle response: backend returns `VehicleMaster` fields.
Frontend `EmpanelledVehicle.effectivePrice` = `price - subsidyAmount` (calculate on frontend for now).

---

## Dealers

| Frontend | Backend | Notes |
|---|---|---|
| `GET /dealers/nearby` | `GET /api/v1/dealers/nearby?city=Delhi` | Add `city` query param |
| `POST /leads` | `POST /api/v1/dealers/leads` | |
| `POST /appointments` | `POST /api/v1/dealers/appointments` | |

---

## Battery Certification

| Frontend | Backend |
|---|---|
| `POST /certification/request` | `POST /api/v1/certification/request` |
| `GET /certification/{id}/verify` | `GET /api/v1/certification/{id}/verify` (public, no JWT) |

---

## AI Agent

The frontend mock (`aiAgentApi.sendMessage`) does a simple `await` — it needs to be replaced with
an **SSE stream** since the real endpoint streams token-by-token.

Real endpoint: `POST /api/v1/agent/message` → `text/event-stream`

SSE event types:
```json
{"type": "meta",  "tool": "calculate_subsidy", "label": "Checking your subsidy…"}
{"type": "token", "text": "Based on Delhi EV Policy 2026…"}
{"type": "done"}
```

Frontend should open an `EventSource` or use `fetch` with `ReadableStream` to handle this.

---

## Type Differences to Align

| Frontend `types/index.ts` | Backend | Action |
|---|---|---|
| `VehicleCategory = '2W'|'3W'|'4W'` | Backend also has `'N1_goods'` | Frontend can add `'N1_goods'` |
| `isDelhiResident: boolean` | Backend uses `city: string` | Frontend passes `city: "Delhi"` when true |
| `profileCompletionPct` | Returned as `completion_percent` from `GET /api/v1/profile` | Rename in frontend |
