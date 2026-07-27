# Admin access setup

Admin editing used to be gated by a password constant compiled into `src/App.jsx`.
That string shipped inside the public JavaScript bundle, and the database accepted
writes from anyone regardless — so the prompt was decorative.

Admin access is now a real Firebase Auth account, and the database rules enforce
it server-side. **The steps below must be completed in the Firebase console or
the admin panel will not let anyone in.**

## One-time setup

### 1. Enable email/password sign-in

Firebase console → **Authentication** → **Sign-in method** → enable **Email/Password**.
Leave "Email link (passwordless sign-in)" off.

### 2. Create your admin account

**Authentication** → **Users** → **Add user**. Use your email and a strong,
unique password. Firebase stores it hashed; it never touches this repo.

Copy the **User UID** from the users list — you need it for the next step.

### 3. Flag that account as an admin

**Realtime Database** → **Data**, and add this node, replacing `PASTE_UID_HERE`
with the UID you copied:

```
admins
  └── PASTE_UID_HERE: true
```

The value must be the boolean `true`, not the string `"true"`.

### 4. Publish the security rules

From the repo root, with the [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
firebase login
firebase deploy --only database --project portfolio-7b1e9
```

Or paste the contents of `database.rules.json` into
**Realtime Database → Rules** in the console and click **Publish**.

Do this step last. Once the rules are live, writes from an unauthenticated
browser stop working — including your own, until steps 1–3 are done.

## What the rules do

| Path         | Read                       | Write                  |
| ------------ | -------------------------- | ---------------------- |
| `settings`   | public                     | admins only            |
| `animations` | public                     | admins only            |
| `admins`     | your own entry, signed in  | nobody (console only)  |
| everything else | denied                  | denied                 |

Public read is intentional — visitors need to load the portfolio. The change is
that writing now requires a signed-in account listed under `admins`.

Nobody can promote themselves: `admins` is not client-writable at all, so adding
an admin is deliberately a console-only action.

## Adding another admin later

Repeat steps 2 and 3. No code change or redeploy needed.

## If you get locked out

Reset the password via **Authentication → Users → ⋮ → Reset password**, or
temporarily set `animations` and `settings` `.write` to `true` in the console
rules to restore access — then put the rules back.

## Note on the old password

The previous value (`quikdraw2024`) is still visible in this repo's git history
and in any previously deployed bundle. It no longer grants anything here, but if
that password is used anywhere else, change it there.

## Note on `firebaseConfig`

The API key in `src/firebase.js` is not a secret. Firebase web configs are meant
to be public; access is controlled by the rules above, not by hiding the config.
