<script lang="ts">
  // Setup inicial al estilo Boardinggate. Dos modos:
  //   - "Crear nuevo": usuario nuevo + PIN.
  //   - "Restaurar": en un dispositivo nuevo, recupera los datos asociados a
  //     un usuario ya existente, ya sea desde un endpoint cloud configurado
  //     o desde un archivo JSON exportado previamente.

  import { app } from '$lib/stores/app.svelte';
  import { hashPin, pullFromCloud } from '$lib/storage';
  import { importFromFile } from '$lib/backup';
  import type { UserProfile } from '$lib/types';

  let mode = $state<'new' | 'restore'>('new');

  // --- Form crear nuevo ---
  let username = $state('');
  let pin = $state('');
  let pinConfirm = $state('');
  let theme = $state<'light' | 'dark' | 'system'>('system');
  let cloudEnabled = $state(false);
  let cloudEndpoint = $state('');
  let cloudToken = $state('');
  let error = $state('');

  // --- Form restaurar ---
  let rUsername = $state('');
  let rPin = $state('');
  let rEndpoint = $state('');
  let rToken = $state('');
  let restoring = $state(false);

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
    const pinHash = await hashPin(pin);
    app.setProfile({
      username: usernameClean,
      pinHash,
      companion: isCompanion,
      theme,
      cloudSync: {
        enabled: cloudEnabled,
        endpoint: cloudEndpoint || undefined,
        token: cloudToken || undefined,
        autoSync: cloudEnabled,
      },
      createdAt: Date.now(),
    });
  }

  async function restoreFromCloud() {
    error = '';
    if (rUsername.trim().length < 3 || !/^\d{4}$/.test(rPin) || !rEndpoint) {
      error = 'Necesito usuario, PIN y endpoint de la nube.';
      return;
    }
    restoring = true;
    try {
      const tempProfile: UserProfile = {
        username: rUsername.trim(),
        pinHash: '',
        theme: 'system',
        cloudSync: {
          enabled: true, endpoint: rEndpoint, token: rToken || undefined, autoSync: true,
        },
        createdAt: Date.now(),
      };
      const remote = await pullFromCloud(tempProfile);
      if (!remote) throw new Error('No encontrado en la nube');

      // Sustituimos el estado y atamos un PIN local nuevo.
      remote.profile = {
        ...(remote.profile ?? tempProfile),
        username: rUsername.trim(),
        pinHash: await hashPin(rPin),
        cloudSync: tempProfile.cloudSync,
      };
      app.state = remote;
      app.persist();
    } catch (e) {
      error = `No se pudo restaurar: ${(e as Error).message}`;
    } finally {
      restoring = false;
    }
  }

  async function restoreFromFile(e: Event) {
    error = '';
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await importFromFile(file);
      // Pedimos un PIN nuevo si el archivo no traía uno (siempre, porque lo limpiamos al exportar)
      const np = prompt('Define un PIN local de 4 dígitos para este dispositivo:');
      if (np && /^\d{4}$/.test(np) && app.state.profile) {
        app.state.profile.pinHash = await hashPin(np);
        app.persist();
      }
    } catch (err) {
      error = `Archivo inválido: ${(err as Error).message}`;
    }
  }
</script>

<div class="mx-auto w-full max-w-md p-6 pop-in">
  <div class="card-elev p-8 space-y-6">
    <header class="text-center space-y-1">
      <div class="text-5xl">🛒</div>
      <h1 class="text-2xl font-bold">Tu Compra</h1>
      <p class="text-sm text-muted">
        {mode === 'new' ? 'Crea tu perfil para empezar' : 'Restaura una cuenta existente'}
      </p>
    </header>

    <!-- Selector de modo -->
    <div class="grid grid-cols-2 rounded-xl overflow-hidden border" style="border-color: var(--border);">
      <button onclick={() => (mode = 'new')}
        class="py-2 text-sm font-medium transition"
        style={mode === 'new' ? 'background: var(--accent); color: white;' : ''}>
        Crear nuevo
      </button>
      <button onclick={() => (mode = 'restore')}
        class="py-2 text-sm font-medium transition"
        style={mode === 'restore' ? 'background: var(--accent); color: white;' : ''}>
        Restaurar
      </button>
    </div>

    {#if mode === 'new'}
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

      <details class="rounded-xl border p-4" style="border-color: var(--border);">
        <summary class="cursor-pointer text-sm font-medium">Sincronización en la nube (opcional)</summary>
        <div class="mt-3 space-y-3">
          <p class="text-xs text-muted">
            Permite restaurar tus listas en otro dispositivo sólo con el usuario.
            Necesita un endpoint REST que tú configures (Gist, Firebase, HA add-on…).
          </p>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" bind:checked={cloudEnabled} /> Habilitar sincronización
          </label>
          {#if cloudEnabled}
            <input type="url" bind:value={cloudEndpoint} placeholder="Endpoint REST"
              class="w-full rounded-xl border px-4 py-2 text-sm bg-transparent"
              style="border-color: var(--border);" />
            <input type="password" bind:value={cloudToken} placeholder="Token (opcional)"
              class="w-full rounded-xl border px-4 py-2 text-sm bg-transparent"
              style="border-color: var(--border);" />
          {/if}
        </div>
      </details>

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <button type="button" onclick={submit} disabled={!valid}
        class="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50 transition"
        style="background: var(--accent);">
        Crear perfil
      </button>

    {:else}
      <!-- Restaurar desde la nube -->
      <p class="text-xs text-muted">
        Si ya usabas Tu Compra en otro dispositivo y tenías sincronización
        activada, recupera tus datos aquí con tu nombre de usuario.
      </p>
      <input type="text" bind:value={rUsername} placeholder="Usuario"
        class="w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);" />
      <input type="password" inputmode="numeric" pattern="\d{4}" maxlength="4" bind:value={rPin}
        placeholder="PIN nuevo (4 dígitos para este dispositivo)"
        class="w-full rounded-xl border px-4 py-2.5 text-center tracking-[0.5em] bg-transparent"
        style="border-color: var(--border);" />
      <input type="url" bind:value={rEndpoint} placeholder="Endpoint REST (igual que en el otro dispositivo)"
        class="w-full rounded-xl border px-4 py-2 text-sm bg-transparent"
        style="border-color: var(--border);" />
      <input type="password" bind:value={rToken} placeholder="Token (si aplica)"
        class="w-full rounded-xl border px-4 py-2 text-sm bg-transparent"
        style="border-color: var(--border);" />

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <button type="button" onclick={restoreFromCloud} disabled={restoring}
        class="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50 transition"
        style="background: var(--accent);">
        {restoring ? 'Restaurando…' : 'Restaurar desde la nube'}
      </button>

      <div class="text-center text-xs text-muted">— o —</div>

      <label class="block w-full text-center cursor-pointer rounded-xl border-2 border-dashed py-4 hover:bg-[var(--bg)] transition"
        style="border-color: var(--border);">
        📂 Restaurar desde archivo JSON
        <input type="file" accept="application/json" class="hidden" onchange={restoreFromFile} />
      </label>
    {/if}
  </div>
</div>
