<script lang="ts">
    import { onMount } from 'svelte';
    import { handleCallback, handleSilentCallback } from './client.js';

    export let action = 'login';

    onMount(() => {

        switch (action) {
            case 'login':
                handleCallback();
                break;
            case 'refresh':
                handleSilentCallback();
                break;
        }
    });
</script>

{#if action === 'login'}
    <div>Logging in...</div>
{:else if action === 'refresh'}
    <div>Refreshing...</div>
{:else}
    <div>Unknown action: {action}</div>
{/if}

