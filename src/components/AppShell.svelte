<script lang="ts">
  // Wrapper raíz: hidrata el store, decide si mostrar setup, gate de PIN o la app.
  import { onMount } from 'svelte';
  import { app } from '$lib/stores/app.svelte';
  import ProfileSetup from './auth/ProfileSetup.svelte';
  import PinGate from './auth/PinGate.svelte';
  import StoreGrid from './list/StoreGrid.svelte';
  import ThemeToggle from './ui/ThemeToggle.svelte';

  let unlocked = $state(false);

  onMount(() => {
    app.hydrate();
    // Aplica tema persistido
    const t = app.state.profile?.theme ?? 'system';
    applyTheme(t);
  });

  function applyTheme(t: 'light' | 'dark' | 'system') {
    const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  $effect(() => {
    if (app.state.profile?.theme) applyTheme(app.state.profile.theme);
  });
</script>

{#if !app.hydrated}
  <div class="min-h-screen grid place-items-center text-muted">Cargando…</div>
{:else if !app.state.profile}
  <ProfileSetup />
{:else if !unlocked}
  <PinGate onUnlock={() => (unlocked = true)} />
{:else}
  <main class="mx-auto max-w-5xl px-4 py-6">
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">🛒 Tu Compra</h1>
        <p class="text-sm text-muted">Hola, {app.state.profile.username}</p>
      </div>
      <ThemeToggle />
    </header>
    <StoreGrid />
  </main>
{/if}
