<script lang="ts">
  // Pantalla de desbloqueo por PIN. Aparece si ya hay perfil creado pero
  // la sesión actual aún no se ha desbloqueado.

  import { app } from '$lib/stores/app.svelte';
  import { verifyPin } from '$lib/storage';

  let { onUnlock }: { onUnlock: () => void } = $props();

  let pin = $state('');
  let error = $state('');
  let attempts = $state(0);

  async function submit() {
    const profile = app.state.profile;
    if (!profile) return;
    const ok = await verifyPin(pin, profile.pinHash);
    if (ok) {
      error = '';
      onUnlock();
    } else {
      attempts++;
      error = `PIN incorrecto (${attempts})`;
      pin = '';
    }
  }

  function reset() {
    if (confirm('¿Borrar perfil y empezar de cero? Se perderán las listas locales.')) {
      app.signOut();
      location.reload();
    }
  }
</script>

<div class="mx-auto w-full max-w-sm p-6 pop-in">
  <div class="card-elev p-8 text-center space-y-6">
    <div class="text-6xl">🔒</div>
    <div>
      <h1 class="text-xl font-bold">Hola, {app.state.profile?.username}</h1>
      <p class="text-sm text-muted">Introduce tu PIN para continuar</p>
    </div>

    <input
      type="password" inputmode="numeric" pattern="\d{4}" maxlength="4"
      bind:value={pin}
      onkeydown={(e) => e.key === 'Enter' && submit()}
      class="w-full rounded-xl border px-4 py-3 text-center text-2xl tracking-[0.6em] bg-transparent"
      style="border-color: var(--border);"
      autofocus
    />

    {#if error}
      <p class="text-sm text-red-500">{error}</p>
    {/if}

    <button type="button" onclick={submit}
      class="w-full rounded-xl py-3 font-semibold text-white"
      style="background: var(--accent);">
      Desbloquear
    </button>

    <button type="button" onclick={reset}
      class="text-xs text-muted underline">
      Olvidar perfil
    </button>
  </div>
</div>
