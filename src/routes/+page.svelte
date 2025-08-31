<script lang="ts">
  import { getUser, isAuthenticated, login, logout } from "$lib/index.js";
  import { onMount } from "svelte";

  let user;
  onMount(async () => {
    user = await getUser();
  });
</script>

<h1>Welcome to your library project</h1>
<p>
  Create your package using @sveltejs/package and preview/showcase your work
  with SvelteKit
</p>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<button
  on:click={async () => {
    login();
  }}>Login</button
>

<button
  on:click={async () => {
    logout();
  }}>Logout</button
>

Is authenticated: {$isAuthenticated}

<pre>{JSON.stringify(user, null, 2)}</pre>
