# Rewards API Specification

Frontend page: `app/(wallet)/form/[id]/rewards/page.tsx`

All endpoints are scoped to a specific form via `[id]` (form ID or slug).

---

## 1. GET `/api/forms/[id]/rewards/budget`

Returns the budget status for a form's rewards.

**Response 200:**
```json
{
  "total": 2000.00,
  "consumed": 1240.00,
  "pending": 150.00,
  "costPerWinner": 10.00,
  "totalWinners": 124
}
```

**Fields:**
- `total` — Total budget deposited (XLM or USD equivalent)
- `consumed` — Amount already distributed
- `pending` — Amount scheduled but not yet sent
- `costPerWinner` — Average cost per rewarded participant
- `totalWinners` — Number of participants who received rewards

---

## 2. POST `/api/forms/[id]/rewards/fund`

Add funds to the form's reward budget. May trigger a Stellar transaction.

**Request:**
```json
{ "amount": 500.00 }
```

**Response 201:**
```json
{
  "newTotal": 2500.00,
  "transactionId": "stellar_tx_hash_here"
}
```

**Errors:**
- `400` — Invalid amount
- `403` — Not the form owner

---

## 3. GET `/api/forms/[id]/rewards/participants`

List participants with AI quality scores and individual rewards.

**Query params:**
| Param   | Type   | Default     | Description                    |
|---------|--------|-------------|--------------------------------|
| sort    | string | `aiScore`   | Sort field: `aiScore`, `reward`, `respondedAt` |
| order   | string | `desc`      | `asc` or `desc`                |
| page    | number | `1`         | Page number                    |
| limit   | number | `10`        | Items per page                 |
| status  | string | (all)       | Filter: `pending`, `paid`      |

**Response 200:**
```json
{
  "participants": [
    {
      "id": "response_cuid",
      "walletAddress": "GD6NGF...55A1",
      "name": "Jorge D.",
      "respondedAt": "2026-02-18T22:00:00Z",
      "aiScore": 9.8,
      "reward": 25.00,
      "status": "pending"
    }
  ],
  "total": 124,
  "page": 1,
  "totalPages": 13
}
```

**Notes:**
- `walletAddress` comes from the respondent (if collected) or is anonymous
- `name` is optional, can be null
- `aiScore` is 0-10, calculated by AI verification of response quality
- `status` is `"pending"` (not paid) or `"paid"` (transaction completed)

---

## 4. PUT `/api/forms/[id]/rewards/participants/[participantId]`

Edit the reward amount for a specific participant. (Phase 2 — currently shows "Próximamente" on frontend)

**Request:**
```json
{ "reward": 30.00 }
```

**Response 200:**
```json
{ "id": "response_cuid", "reward": 30.00 }
```

---

## 5. POST `/api/forms/[id]/rewards/distribute`

Trigger payout distribution to all pending participants via Stellar.

**Response 200:**
```json
{
  "distributed": 124,
  "totalAmount": 1240.00,
  "transactions": [
    { "walletAddress": "GD6NGF...", "amount": 25.00, "txHash": "..." }
  ]
}
```

**Errors:**
- `400` — Insufficient budget
- `403` — Not the form owner

---

## DB Models Needed

The backend will likely need to extend the existing Prisma schema:

```prisma
model RewardBudget {
  id        String   @id @default(cuid())
  formId    String   @unique
  form      Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  total     Float    @default(0)
  consumed  Float    @default(0)
  pending   Float    @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Extend existing Response model with:
// - aiScore    Float?
// - reward     Float?
// - rewardStatus  String?  // "pending" | "paid"
// - rewardTxHash  String?
```

---

## Frontend Integration Points

When endpoints are ready, replace mock data in `rewards/page.tsx`:

1. **`MOCK_BUDGET`** → fetch from `GET /api/forms/[id]/rewards/budget`
2. **`MOCK_PARTICIPANTS`** → fetch from `GET /api/forms/[id]/rewards/participants`
3. **"Confirmar Recarga" button** → call `POST /api/forms/[id]/rewards/fund`
4. **"Editar" button** → call `PUT /api/forms/[id]/rewards/participants/[id]` (currently shows toast)
