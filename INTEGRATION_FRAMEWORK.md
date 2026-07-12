# CreatorsHub Integration Framework

## Purpose

The Integration Framework defines how every external platform connects to CreatorsHub.

It exists to ensure that all integrations follow the same standards for:

- authentication
- security
- account ownership
- multiple connected accounts
- token management
- syncing
- error handling
- warnings
- normalized data
- business intelligence

A new integration should extend this framework instead of creating a completely separate system.

---

# Core Principles

## 1. Never trust identity from the browser

The browser may send a connected account ID, but it must never decide which CreatorsHub user owns that account.

Every protected route must verify the signed-in user through the server-side Supabase session.

---

## 2. Every privileged query must verify ownership

Any route using the Supabase service-role key must constrain database operations by:

- authenticated user ID
- connected account ID
- platform key

Example:

```js
.eq("id", connectedAccountId)
.eq("user_id", user.id)
.eq("platform", "youtube")