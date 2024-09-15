# `sveltekit-zitadel-oidc`

**`sveltekit-zitadel-oidc`** is a simple SvelteKit package that integrates **Zitadel** OpenID Connect (OIDC) for Single Page Applications (SPA). It leverages the `oidc-client-ts` library and provides easy-to-use functions to manage authentication, login, logout, and token refresh in your SvelteKit app.

## Features

- ✔️ **OIDC-based authentication** using Zitadel.
- ✔️ **Silent token renewal** without user interaction.
- ✔️ **Seamless user authentication** management via Svelte stores.
- ✔️ **Login and logout redirection** management.
- ✔️ **Automatic session restoration** after page refresh.

## Installation

Install the package via npm or yarn:

```bash
npm install sveltekit-zitadel-oidc
# or
yarn add sveltekit-zitadel-oidc
```

## Getting Started

### 1. Configure Your Zitadel Application

Before using the package, you need to configure your Zitadel project:

- Go to **Zitadel Console** and create an **OIDC Application**.
- Set the required **redirect URIs** for login (`/auth/oidc/callback`) and silent renew (`/auth/oidc/refresh`).
- Set the **Client ID** and **Authority URL** (Issuer URL) for your application.

### 2. Setup Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
PUBLIC_URL=http://localhost:5173 # Your app's base URL
PUBLIC_OIDC_URL=http://id.loc    # Zitadel issuer URL
PUBLIC_OIDC_CLIENT_ID=YOUR_CLIENT_ID # Zitadel Client ID
```

### 3. Add Authentication Routes

Create two routes in your SvelteKit project for handling login and silent token refresh:

- **`src/routes/auth/oidc/callback/+page.svelte`**:

```svelte
<script lang="ts">
    import AuthCallback from "$lib/auth/oidc/AuthCallback.svelte";
</script>
<AuthCallback action="login" />
```

- **`src/routes/auth/oidc/refresh/+page.svelte`**:

```svelte
<script lang="ts">
    import AuthCallback from "$lib/auth/oidc/AuthCallback.svelte";
</script>
<AuthCallback action="refresh"/>
```

### 4. Initialize OIDC in Your SvelteKit Layout

In your layout file (`src/routes/+layout.ts`), initialize the OIDC manager to restore user authentication after page reloads:

```ts
import { authorize } from '$lib/auth/oidc';

export async function load() {
    await authorize();
    return {};
}
```

### 5. Using Authentication Functions

Now you can use authentication-related functions (`login`, `logout`, etc.) throughout your app by importing them from `sveltekit-zitadel-oidc`.

Example in your components:

```svelte
<script lang="ts">
    import { login, logout, isAuthenticated, user } from '$lib/auth/oidc';

    // Svelte store subscription
    let $isAuthenticated;
    let $user;
    $: {
        $isAuthenticated = $isAuthenticated;
        $user = $user;
    }

    function handleLogin() {
        login();  // Redirects to Zitadel login page
    }

    function handleLogout() {
        logout();  // Logs out the user
    }
</script>

<button on:click={handleLogin} disabled={$isAuthenticated}>Login</button>
<button on:click={handleLogout} disabled={!$isAuthenticated}>Logout</button>

{#if $isAuthenticated}
    <p>Welcome, {$user?.profile?.name}!</p>
{:else}
    <p>Please log in.</p>
{/if}
```

## API

### 1. `authorize()`
- **Description**: Initializes the OIDC `UserManager` and attempts to load the user from storage, restoring the session after a page refresh.
- **Usage**:

```ts
await authorize();
```

### 2. `login()`
- **Description**: Starts the OIDC login process, redirecting the user to Zitadel’s login page.
- **Usage**:

```ts
login();
```

### 3. `logout()`
- **Description**: Starts the OIDC logout process, redirecting the user to Zitadel’s logout page.
- **Usage**:

```ts
logout();
```

### 4. `getUser()`
- **Description**: Retrieves the current authenticated user from the OIDC client.
- **Returns**: A `Promise` that resolves to the `User` object or `null` if no user is authenticated.
- **Usage**:

```ts
const user = await getUser();
```

### 5. `handleCallback()`
- **Description**: Handles the login callback when the user is redirected back from Zitadel after login. It processes the authorization code and retrieves tokens.
- **Usage**: Should be called inside the login callback route.

```ts
handleCallback();
```

### 6. `handleSilentCallback()`
- **Description**: Handles the silent token refresh callback, processing the new tokens returned by Zitadel during silent renew.
- **Usage**: Should be called inside the silent token renewal route.

```ts
handleSilentCallback();
```

## Store Variables

The package exports two Svelte writable stores to track authentication status:

### 1. `isAuthenticated`
- **Type**: `Writable<boolean>`
- **Description**: Tracks whether the user is authenticated.
- **Usage**:

```svelte
import { isAuthenticated } from '$lib/auth/oidc';
```

### 2. `user`
- **Type**: `Writable<User | null>`
- **Description**: Stores the authenticated user's information.
- **Usage**:

```svelte
import { user } from '$lib/auth/oidc';
```

## Project Structure

```
src/
├── lib/
│   └── auth/
│       └── oidc/
│           ├── store.ts            # Svelte stores for authentication state
│           ├── oidc.ts             # Core OIDC functionality
│           └── AuthCallback.svelte  # Handles callback logic for login and silent renew
├── routes/
│   └── auth/
│       └── oidc/
│           ├── callback/            # OIDC login callback route
│           └── refresh/             # OIDC silent renew callback route
```

## License

This package is licensed under the **MIT License**.
