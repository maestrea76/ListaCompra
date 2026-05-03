<script lang="ts">
  // Setup inicial: usuario + PIN local. Para mover datos entre dispositivos
  // se usa la sincronización online (panel 📡 con Supabase).

  import { app } from '$lib/stores/app.svelte';
  import { hashPin } from '$lib/storage';

  let username = $state('');
  let pin = $state('');
  let pinConfirm = $state('');
  let theme = $state<'light' | 'dark' | 'system'>('system');
  let error = $state('');

  const usernameClean = $derived(username.trim());
  const isCompanion = $derived(/@MOVIL$/i.test(usernameClean));
  const valid = $derived(
    usernameClean.length >= 3 && /^\d{4}$/.test(pin) && pin === pinConfirm,
  );

  async function submit() {
    error = '';
    if (!valid) {
      error = 'Revisa el usuario (≥3 chars) y el PIN (4 dígitos coincidentes).';
      return;
    }
    app.setProfile({
      username: usernameClean,
      pinHash: await hashPin(pin),
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
      <p class="text-sm text-muted">Crea tu perfil para empezar</p>
    </header>

    <label class="block">
      <span class="text-sm font-medium">Nombre de usuario</span>
      <input type="text" bind:value={username} placeholder="p.ej. ander"
        class="mt-1 w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);" autocomplete="username" />
      {#if isCompanion}
        <span class="text-xs text-muted mt-1 block">📱 Modo compañero (@MOVIL)</span>
      {/if}
    </label>

    <div class="grid grid-cols-2 gap-3">
      <label class="block">
        <span class="text-sm font-medium">PIN (4 dígitos)</span>
        <input type="password" inputmode="numeric" pattern="\d{4}" maxlength="4" bind:value={pin}
          class="mt-1 w-full rounded-xl border px-4 py-2.5 text-center tracking-[0.5em] bg-transparent"
          style="border-color: var(--border);" />
      </label>
      <label class="block">
        <span class="text-sm font-medium">Confirmar PIN</span>
        <input type="password" inputmode="numeric" pattern="\d{4}" maxlength="4" bind:value={pinConfirm}
          class="mt-1 w-full rounded-xl border px-4 py-2.5 text-center tracking-[0.5em] bg-transparent"
          style="border-color: var(--border);" />
      </label>
    </div>

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
      Crear perfil
    </button>

    <p class="text-xs text-muted text-center">
      ¿Ya tenías cuenta en otro dispositivo? Crea perfil aquí y luego activa
      la sincronización online desde el panel 📡 con tu email + passphrase.
    </p>
  </div>
</div>
