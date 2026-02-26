# API spec: Profile / Configuration (for backend developer)

This document describes the endpoints the **Configuración** page needs to load and save profile data, including the profile image.

---

## Base

- **Base URL:** (your API base, e.g. `https://api.example.com` or same-origin `/api`)
- **Auth / identity:** User is identified by **wallet address** (e.g. from auth/session or query/body). All endpoints must ensure the caller can only read/update their own profile.

---

## 1. Get profile (load configuration)

**Request**

- **Method:** `GET`
- **Path:** `/api/profile` (or `/api/v1/users/me/profile`)
- **Query:**
  - `address` (string, required) — wallet address of the user

**Example:** `GET /api/profile?address=GCCYNT...`

**Response (200 OK)**

JSON object with the user’s profile. Missing optional fields can be `null` or omitted.

| Field        | Type   | Required | Description                                      |
|-------------|--------|----------|--------------------------------------------------|
| `id`        | string | yes      | Unique profile id (e.g. cuid)                   |
| `walletAddress` | string | yes   | Wallet address (same as request identity)       |
| `firstName` | string | no       | First name                                       |
| `lastName`  | string | no       | Last name                                        |
| `email`     | string | no       | Email                                            |
| `phone`     | string | no       | Phone                                            |
| `avatarUrl` | string | no       | **Profile image:** public URL of the avatar image (absolute or relative). If no image, `null` or omit. |

**Example**

```json
{
  "id": "clxx...",
  "walletAddress": "GCCYNT...",
  "firstName": "Claudio",
  "lastName": "Castro",
  "email": "admin@formly.com",
  "phone": null,
  "avatarUrl": "https://cdn.example.com/avatars/abc123.jpg",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-02-20T14:30:00.000Z"
}
```

**When profile does not exist:** return `200` with `null` or `404`; frontend treats both as “no profile yet”.

---

## 2. Update profile (save configuration)

The frontend needs to send both **text fields** and **profile image**. Two possible designs:

---

### Option A — JSON body + avatar URL (recommended)

Backend stores `avatarUrl` in the profile. Image upload is handled separately (see “Profile image upload” below). The client uploads the image, gets a URL, then sends that URL in the profile update.

**Request**

- **Method:** `POST` or `PATCH`
- **Path:** `/api/profile` (or `PATCH /api/v1/users/me/profile`)
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**

| Field         | Type   | Required | Description                                |
|---------------|--------|----------|--------------------------------------------|
| `walletAddress` | string | yes    | Wallet address (identity)                  |
| `firstName`   | string | no       | First name                                 |
| `lastName`    | string | no       | Last name                                  |
| `email`       | string | no       | Email                                      |
| `phone`       | string | no       | Phone                                      |
| `avatarUrl`   | string | no       | **Profile image:** URL of the uploaded image. Send after client uploads file and gets URL. Omit or `null` to leave unchanged (or clear avatar if you support “remove”). |

**Example**

```json
{
  "walletAddress": "GCCYNT...",
  "firstName": "Claudio",
  "lastName": "Castro",
  "email": "admin@formly.com",
  "phone": null,
  "avatarUrl": "https://cdn.example.com/avatars/abc123.jpg"
}
```

**Response (200 or 201)**

- Return the updated profile object (same shape as GET response), including `avatarUrl`.

---

### Option B — Multipart: one request for info + image

Single request with both form fields and file.

**Request**

- **Method:** `POST` or `PATCH`
- **Path:** `/api/profile` (or `/api/v1/users/me/profile`)
- **Headers:** `Content-Type: multipart/form-data`
- **Body (form fields):**
  - `walletAddress` (string, required)
  - `firstName` (string, optional)
  - `lastName` (string, optional)
  - `email` (string, optional)
  - `phone` (string, optional)
  - `avatar` (file, optional) — image file (e.g. JPEG/PNG). If present, backend stores it and sets profile’s `avatarUrl` to the new file URL.

**Response (200 or 201)**

- Same as Option A: full profile object including `avatarUrl`.

---

## 3. Profile image upload (if using Option A)

If the backend uses **Option A**, you need an endpoint that accepts the image file and returns a **public URL** to store in `avatarUrl`.

**Request**

- **Method:** `POST`
- **Path:** `/api/profile/avatar` or `/api/upload/avatar`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:**
  - `address` or `walletAddress` (string, required) — to associate upload with user
  - `file` or `avatar` (file, required) — image (e.g. JPEG, PNG; max size e.g. 2–5 MB)

**Response (200 or 201)**

JSON with the URL the client will send in the profile update:

```json
{
  "avatarUrl": "https://cdn.example.com/avatars/abc123.jpg"
}
```

- Backend should validate file type/size and return `4xx` with a clear message if invalid.
- If you prefer to **update the profile in this same request** (set `avatarUrl` and return full profile), that’s fine; then the client can skip sending `avatarUrl` in the main profile update when it just uploaded the image.

---

## Summary for backend

| What frontend needs | Endpoint / contract |
|---------------------|----------------------|
| Load profile (text + image) | **GET** `/api/profile?address=...` → JSON with `firstName`, `lastName`, `email`, `phone`, **`avatarUrl`** |
| Save profile (text + image URL) | **POST/PATCH** `/api/profile` with JSON body including **`avatarUrl`** (Option A), or multipart with file (Option B) |
| Upload image (if Option A)     | **POST** `/api/profile/avatar` (or `/api/upload/avatar`) multipart → response with **`avatarUrl`** |

**Database / storage**

- Add **`avatarUrl`** (string, nullable) to the profile table if not present.
- Store files in object storage (e.g. S3) or your CDN and persist the public URL in `avatarUrl`.

**Frontend usage**

- **GET:** Config page loads profile and shows name, email, and avatar from `avatarUrl` (or placeholder if null).
- **Save (Option A):** If user picked a new image, frontend first uploads it to the avatar endpoint, gets `avatarUrl`, then sends it in the profile update together with name/email/phone.
- **Save (Option B):** Frontend sends one multipart request with all fields + `avatar` file when user clicks “Guardar cambios”.

If you tell me whether you prefer Option A (separate upload + URL) or Option B (single multipart), I can align the frontend implementation to that contract.
