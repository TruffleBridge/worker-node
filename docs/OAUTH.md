# Google OAuth Setup & Testing Guide

This document explains **why** each part of Google Sign-In exists, how it connects to **worker-node**, and how to verify the flow locally using **Google Cloud Console**, **OAuth 2.0 Playground**, and **Postman**.

---

## Table of contents

1. [What problem OAuth solves](#what-problem-oauth-solves)
2. [How this project implements auth](#how-this-project-implements-auth)
3. [Key concepts (read this first)](#key-concepts-read-this-first)
4. [Why Google Cloud Console is necessary](#why-google-cloud-console-is-necessary)
5. [Why OAuth 2.0 Playground is necessary](#why-oauth-20-playground-is-necessary)
6. [Google Cloud Console — step by step](#google-cloud-console--step-by-step)
7. [OAuth 2.0 Playground — step by step](#oauth-20-playground--step-by-step)
8. [Test with Postman](#test-with-postman)
9. [Browser redirect flow (optional)](#browser-redirect-flow-optional)
10. [Environment variables](#environment-variables)
11. [API reference](#api-reference)
12. [Troubleshooting](#troubleshooting)

---

## What problem OAuth solves

Traditional login asks users to **create and remember a password** for your app. That means you must:

- Store hashed passwords securely
- Handle password reset, leaks, and weak passwords
- Prove to users that you handle credentials safely

**Sign in with Google** delegates authentication to Google. The user signs in with Google; your backend receives proof that Google verified them (email, name, profile picture) **without ever seeing their Google password**.

OAuth 2.0 is the industry standard protocol for this delegation.

---

## How this project implements auth

worker-node supports three ways to authenticate:

| Method | Endpoint | Best for |
|--------|----------|----------|
| Email + password | `POST /api/auth/register`, `POST /api/auth/login` | Users who prefer a local account |
| Google (token) | `POST /api/auth/google/token` | Postman, mobile apps, SPAs with Google SDK |
| Google (redirect) | `GET /api/auth/google` → callback | Web apps that redirect the browser |

After any successful login, the API returns:

- **`user`** — profile stored in your MySQL `User` table
- **`accessToken`** — your app’s JWT used for protected routes (e.g. `GET /api/auth/getProfile`)

Google’s tokens are **not** used directly on protected routes. Your server verifies Google once, creates/links a user, then issues **your own JWT**.

```mermaid
sequenceDiagram
    participant Client as Client (Postman / Browser)
    participant API as worker-node API
    participant Google as Google OAuth

  Note over Client,Google: Token flow (Postman / mobile)
    Client->>Google: User signs in (Playground or SDK)
    Google-->>Client: id_token
    Client->>API: POST /api/auth/google/token { idToken }
    API->>Google: Verify id_token signature
    Google-->>API: Valid payload (sub, email, name)
    API->>API: Create or link User in MySQL
    API-->>Client: { user, accessToken (JWT) }

  Note over Client,API: Protected requests
    Client->>API: GET /api/auth/getProfile (Bearer accessToken)
    API->>API: Verify JWT, load user by userId
    API-->>Client: User profile
```

---

## Key concepts (read this first)

### 1. OAuth Client ID & Client Secret

- Issued by **Google Cloud Console** for your app.
- **Client ID** — public identifier (safe in frontend config).
- **Client Secret** — private; **only on the server** (`.env`), never in mobile apps or public repos.

**Why:** Google needs to know which application is requesting access and to prevent other apps from impersonating yours.

### 2. Scopes

Scopes define **what data** your app may read, for example:

- `openid` — OpenID Connect identity
- `https://www.googleapis.com/auth/userinfo.email` — user’s email
- `https://www.googleapis.com/auth/userinfo.profile` — name and picture

**Why:** Users must consent to each type of access. We only request what we need for sign-in.

### 3. Authorization code

A short-lived code Google returns after the user clicks **Allow**.

**Why:** The code is exchanged server-side for tokens so tokens are not exposed in the browser URL longer than necessary.

### 4. `id_token` (Google)

A JWT signed by Google containing `sub` (Google user id), `email`, `name`, etc.

**Why:** Your backend verifies this with Google’s libraries (`google-auth-library`) to trust the login without handling passwords.

### 5. `accessToken` (your app — JWT)

A JWT signed with **`JWT_SECRET`** containing `userId` and `email` from **your database**.

**Why:** After Google login, your app uses its own session token for `/api/auth/getProfile` and other protected APIs. This keeps Google out of every request and lets you control expiry and revocation.

### 6. Redirect URI

The exact URL Google may redirect to after login, e.g.:

`http://localhost:3000/api/auth/google/callback`

**Why:** Google only redirects to pre-registered URLs to prevent phishing and token theft.

### 7. Test users

While the app is in **Testing** mode, only Gmail accounts listed under **Audience → Test users** can sign in.

**Why:** Google limits unverified apps so random users are not exposed to unaudited applications.

---

## Why Google Cloud Console is necessary

[Google Cloud Console](https://console.cloud.google.com/) is where you **register your application** with Google. Without it:

- Google will not issue Client ID / Secret
- No redirect URIs can be registered → `redirect_uri_mismatch` errors
- No consent screen → users cannot approve access
- No test users → sign-in blocked in development

Think of it as **registering your API with Google’s identity provider**.

### What you configure there

| Console section | Purpose |
|-----------------|--------|
| **Project** | Groups all settings and credentials for worker-node |
| **OAuth consent screen / Audience** | App name, scopes, **test users** |
| **Credentials → OAuth 2.0 Client ID** | Client ID, Secret, **redirect URIs** |

---

## Why OAuth 2.0 Playground is necessary

[OAuth 2.0 Playground](https://developers.google.com/oauthplayground) is Google’s official tool to **simulate the OAuth flow** without building a frontend.

### Why we use it for local / Postman testing

| Without Playground | With Playground |
|--------------------|-----------------|
| You need a web UI with Google Sign-In button | Get a real Google `id_token` in minutes |
| Hard to debug redirect/cookie issues in Postman | Clear Step 1 → Authorize → Step 2 → Exchange |
| Unclear if Google or your API failed | Isolate Google’s side first, then test your API |

Postman cannot easily complete a browser redirect login. Playground gives you a valid **`id_token`** to send to:

`POST /api/auth/google/token`

### Important: two different redirect URIs

Your app and Playground use **different** redirect URIs. Register **both** in Google Cloud Console:

| Flow | Redirect URI |
|------|----------------|
| **OAuth Playground** | `https://developers.google.com/oauthplayground` |
| **worker-node (browser)** | `http://localhost:3000/api/auth/google/callback` |

If Playground shows `redirect_uri_mismatch` with `redirect_uri=https://developers.google.com/oauthplayground`, you forgot the Playground URI in Console.

---

## Google Cloud Console — step by step

### Step 1 — Create or select a project

1. Open [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Top bar → **Select a project** → **New Project** (e.g. `worker-node-local`)

**Why:** Credentials and consent screen belong to one project. One project is enough; you do not need two.

---

### Step 2 — Configure OAuth consent screen (Audience)

1. **Google Auth Platform** → **Audience**  
   (or **APIs & Services** → **OAuth consent screen**)
2. User type: **External** (any Google account) — *if you only see Internal, use a personal Gmail project or your org’s policy*
3. Fill app name and support email
4. **Scopes:** add `email`, `profile`, `openid`
5. **Test users:** add the Gmail you will use (e.g. `you@gmail.com`)

**Why each step:**

- **External** — allows personal Gmail sign-in for development
- **Scopes** — legal/user consent for data you read
- **Test users** — required while app is in **Testing**; otherwise Google blocks sign-in

---

### Step 3 — Create OAuth 2.0 Client ID

1. **Google Auth Platform** → **Clients** → **Create client**
2. Type: **Web application**
3. Name: e.g. `worker-node-local`
4. **Authorized redirect URIs** — add:

   ```
   https://developers.google.com/oauthplayground
   http://localhost:3000/api/auth/google/callback
   ```

   Use port **3000** only if `PORT=3000` in your `.env`. Match `GOOGLE_CALLBACK_URL` exactly.

5. **Create** → copy **Client ID** and **Client secret** into `.env`:

   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   ```

**Why Web application:** Your Node server handles server-side OAuth (redirect callback and token verification).

**Why redirect URIs must match exactly:** Google rejects any mismatch to prevent redirect attacks.

---

### Step 4 — Wait and restart your API

- Console changes can take **1–2 minutes**
- Restart: `npm run build && npm run start`

---

## OAuth 2.0 Playground — step by step

### Step 1 — Use your own credentials

1. Open [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Gear icon → **Use your own OAuth credentials** → ON
3. Paste **Client ID** and **Client secret** from `.env`
4. Close

**Why:** Default Playground credentials use Google’s client, not yours. Your API verifies tokens against **your** Client ID (`audience`), so credentials must match.

---

### Step 2 — Select scopes (not your email)

In **Step 1**, under **Google OAuth2 API v2**, select:

- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`
- `openid`

Or paste into **Input your own scopes**:

```
https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid
```

**Do not** put your Gmail in the scopes box — that causes `invalid=[your@gmail.com]`.

**Why:** Scopes are permission URLs, not user identities. Your Gmail is only used on the Google **login screen** after **Authorize APIs**.

---

### Step 3 — Authorize APIs

1. Click **Authorize APIs**
2. Sign in with a **test user** Gmail (same as in Console → Test users)
3. Click **Continue** on the unverified app warning (normal for dev)
4. Click **Allow**

**Why:** You are proving to Google that a real user consented. Playground receives an **authorization code**.

---

### Step 4 — Exchange authorization code for tokens

1. Click **Exchange authorization code for tokens**
2. In the response, copy **`id_token`** (starts with `eyJ...`)

**Why:** The authorization code cannot be sent to worker-node directly. Exchange yields an **`id_token`** your API can verify.

**Do not confuse:**

| Token | Use |
|-------|-----|
| Authorization code | Only inside Playground (Step 1 → 2) |
| Google `id_token` | Body of `POST /api/auth/google/token` |
| Google `access_token` (`ya29...`) | Not used by this API |
| Your `data.accessToken` | `Authorization: Bearer` on `/api/auth/getProfile` |

---

## Test with Postman

### Prerequisites

- MySQL running, migrations applied: `npm run db:migrate`
- Server running: `npm run build && npm run start`
- `.env` has `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`

---

### 1. Health check

```
GET http://localhost:3000/health
```

**Why:** Confirms the server is up before debugging OAuth.

---

### 2. Google sign-in (create user + JWT)

```
POST http://localhost:3000/api/auth/google/token
Content-Type: application/json
```

```json
{
  "idToken": "PASTE_id_token_FROM_PLAYGROUND"
}
```

**Expected (200):**

```json
{
  "status": true,
  "message": "Google sign-in successful",
  "data": {
    "user": {
      "id": 1,
      "email": "you@gmail.com",
      "authProvider": "google",
      ...
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Why this step:** Server verifies `id_token` with Google, creates/links `User` in MySQL, returns **your** JWT.

**Check the JWT** at [jwt.io](https://jwt.io) — payload must include:

```json
{
  "userId": 1,
  "email": "you@gmail.com"
}
```

If `userId` is `null`, discard the token, rebuild the server, and call this endpoint again.

---

### 3. Get profile (protected route)

```
GET http://localhost:3000/api/auth/getProfile
Authorization: Bearer PASTE_data.accessToken_FROM_STEP_2
```

In Postman: **Authorization** → Type **Bearer Token** → paste token only (no extra quotes).

**Why:** Proves your JWT middleware and database lookup work end-to-end.

---

## Browser redirect flow (optional)

For a real web app (not Postman):

1. User visits: `http://localhost:3000/api/auth/google`
2. Redirected to Google → signs in → Google redirects to  
   `http://localhost:3000/api/auth/google/callback`
3. API creates/links user and redirects to:  
   `http://localhost:5173/auth/callback?token=YOUR_JWT`

**Why a separate flow:** Browsers handle redirects and cookies; Postman does not. Playground + `/google/token` is simpler for API testing.

**Requires:** `GOOGLE_CALLBACK_URL` and Console redirect URI on the same port as `PORT` in `.env`.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | API port (e.g. `3000`) |
| `GOOGLE_CLIENT_ID` | From Google Cloud → Clients |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud → Clients (server only) |
| `GOOGLE_CALLBACK_URL` | `{APP_URL}/api/auth/google/callback` |
| `JWT_SECRET` | Secret to sign your app’s JWTs |
| `JWT_EXPIRES_IN` | JWT lifetime (e.g. `7d`) |
| `SESSION_SECRET` | Express session for OAuth redirect state |
| `FRONTEND_URL` | Where to redirect after browser OAuth (e.g. `http://localhost:5173`) |

Copy `.env.example` to `.env` and fill in values. **Never commit `.env` or real secrets.**

---

## API reference

Base path: `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | No | Local email/password registration |
| `POST` | `/login` | No | Local login |
| `POST` | `/google/token` | No | Google sign-in via `idToken` (Postman/mobile) |
| `GET` | `/google` | No | Start browser Google OAuth |
| `GET` | `/google/callback` | No | Google redirect target |
| `GET` | `/getProfile` | Bearer JWT | Current user profile |
| `POST` | `/facebook/token` | No | Facebook sign-in (if configured) |
| `GET` | `/facebook` | No | Start browser Facebook OAuth |

---

## Troubleshooting

| Error | Cause | Fix |
|-------|--------|-----|
| `redirect_uri_mismatch` (Playground) | Missing Playground URI in Console | Add `https://developers.google.com/oauthplayground` |
| `redirect_uri_mismatch` (app) | Callback port/path wrong | Match `GOOGLE_CALLBACK_URL`, `PORT`, and Console |
| `invalid=[email]` in scopes | Email entered as scope | Use only scope URLs; sign in with Gmail on login page |
| `Access blocked` | App in Testing, user not listed | Add Gmail under **Test users** |
| `Invalid Google token` | Wrong token or expired `id_token` | Exchange again in Playground; use `id_token` not `access_token` |
| `User not found` on `/me` | Wrong token or `userId: null` in JWT | Use `data.accessToken` from `/google/token`; rebuild server if needed |
| `401 Invalid or expired token` | Google token on `/me`, or expired JWT | Bearer must be **your** `accessToken` |
| `Google OAuth is not configured` | Missing env vars | Set `GOOGLE_CLIENT_ID` / `SECRET`, restart server |

---

## Security notes (production)

- Move app from **Testing** to **Production** and complete Google verification when going live
- Use HTTPS for all redirect URIs
- Rotate `JWT_SECRET` and `GOOGLE_CLIENT_SECRET` if exposed
- Do not commit credentials; use secrets manager in production
- Restrict CORS `FRONTEND_URL` to your real frontend domain

---

## Quick checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen + test users configured
- [ ] OAuth Client ID (Web) created
- [ ] Redirect URIs: Playground + localhost callback
- [ ] `.env` updated, server restarted
- [ ] Playground: scopes → Authorize → Exchange → copy `id_token`
- [ ] Postman: `POST /google/token` → copy `data.accessToken`
- [ ] Postman: `GET /me` with Bearer `accessToken`

For local database setup, see project migrations and `.env` database variables.
