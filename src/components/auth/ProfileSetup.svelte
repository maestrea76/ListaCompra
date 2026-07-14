<script lang="ts">
  // Setup inicial: sólo nombre de usuario y tema. La sincronización entre
  // dispositivos la aporta Home Assistant (usuario logueado en HA).

  import { app } from '$lib/stores/app.svelte';

  let username = $state('');
  let theme = $state<'light' | 'dark' | 'system'>('system');
  let error = $state('');

  const usernameClean = $derived(username.trim());
  const isCompanion = $derived(/@MOVIL$/i.test(usernameClean));
  const valid = $derived(usernameClean.length >= 2);

  function submit() {
    error = '';
    if (!valid) {
      error = 'Pon un nombre de al menos 2 caracteres.';
      return;
    }
    app.setProfile({
      username: usernameClean,
      companion: isCompanion,
      theme,
      createdAt: Date.now(),
    });
  }
</script>

<div class="mx-auto w-full max-w-md p-6 pop-in">
  <div class="card-elev p-8 space-y-6">
    <header class="text-center space-y-1">
      <div class="text-5xl">🛒</div>
      <h1 class="text-2xl font-bold">Tu Compra</h1>
      <p class="text-sm text-muted">¿Cómo te llamamos?</p>
    </header>

    <label class="block">
      <span class="text-sm font-medium">Nombre de usuario</span>
      <input type="text" bind:value={username} placeholder="p.ej. ander"
        onkeydown={(e) => e.key === 'Enter' && submit()}
        class="mt-1 w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);" autocomplete="username" autofocus />
      {#if isCompanion}
        <span class="text-xs text-muted mt-1 block">📱 Modo compañero (@MOVIL)</span>
      {/if}
    </label>

    <label class="block">
      <span class="text-sm font-medium">Tema</span>
      <select bind:value={theme}
        class="mt-1 w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);">
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>
    </label>

    {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

    <button type="button" onclick={submit} disabled={!valid}
      class="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50 transition"
      style="background: var(--accent);">
      Empezar
    </button>

    <p class="text-xs text-muted text-center">
      Abriendo "Tu Compra" desde Home Assistant, tus listas se sincronizan
      automáticamente entre dispositivos con tu usuario de HA.
    </p>
  </div>
</div>
