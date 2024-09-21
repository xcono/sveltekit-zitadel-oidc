# SvelteKit Zitadel OIDC Integration

This project demonstrates how to integrate OIDC (OpenID Connect) authentication using Zitadel with a SvelteKit application. The integration leverages the `oidc-client-ts` library to handle authentication flows and manage user sessions.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Scripts](#scripts)
- [GitHub Actions](#github-actions)
- [License](#license)

## Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/sveltekit-zitadel-oidc.git
cd sveltekit-zitadel-oidc
npm install
```

## Configuration

Create a `.env` file in the root of your project and add the following environment variables:

| Variable                  | Default Value            | Description                                                                           |
|---------------------------|--------------------------|---------------------------------------------------------------------------------------|
| `PUBLIC_GUI_URL`          | `http://localhost:5173`  | The base URL of the GUI application. Svelte dev port by default.                      |
| `PUBLIC_OIDC_URL`         | `http://id.loc`          | The URL of the OIDC provider.                                                         |
| `PUBLIC_OIDC_CLIENT_ID`   |                          | The client ID for the OIDC application.                                               |
| `PUBLIC_OIDC_LOGIN_URL`   | `http://localhost:5173/` | The URL to redirect to after a successful login. Svelte might require trailing slash. |
| `PUBLIC_OIDC_LOGOUT_URL`  | `http://localhost:5173/` | The URL to redirect to after a successful logout. Svelte might require trailing slash.|

These variables configure the OIDC client with the necessary URLs and client ID.

## Usage

### Authorization

The `authorize` function initializes the OIDC `UserManager` and loads the user from storage:

```typescript
import { authorize } from './lib/auth/oidc/client.js';

authorize().then(user => {
  if (user) {
    console.log('User is authenticated:', user);
  } else {
    console.log('User is not authenticated');
  }
});
```

### Login and Logout

To initiate the login and logout processes, use the `login` and `logout` functions:

```typescript
import { login, logout } from './lib/auth/oidc/client.js';

// To login
login();

// To logout
logout();
```

### Handling Callbacks

Use the `AuthCallback` component to handle login and silent refresh callbacks:

```svelte
<script lang="ts">
  import AuthCallback from '$lib/auth/oidc/AuthCallback.svelte';
</script>

<AuthCallback action="login" />
```

### Svelte Stores

The authentication state is managed using Svelte stores:

```typescript
import { isAuthenticated, user } from './lib/auth/oidc/store.js';

$isAuthenticated; // boolean indicating if the user is authenticated
$user; // the authenticated user object or null
```

## Scripts

The `package.json` includes several scripts for development and building the project:

- `dev`: Start the development server.
- `build`: Build the project.
- `preview`: Preview the built project.
- `package`: Package the project.
- `prepublishOnly`: Run the package script before publishing.
- `check`: Run type checks.
- `check:watch`: Run type checks in watch mode.

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build && npm run package",
    "preview": "vite preview",
    "package": "svelte-kit sync && svelte-package && publint",
    "prepublishOnly": "npm run package",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
  }
}
```

## GitHub Actions

The project includes a GitHub Actions workflow for building and publishing the package:

```yaml
name: Node.js Package

on:
  push:
    tags:
      - '0.*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run package

  publish-npm:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org/
      - run: npm ci
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_SECRET}}
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.