<script lang="ts">
  // Setup inicial al estilo Boardinggate. Dos modos:
  //   - "Crear nuevo": usuario nuevo + PIN.
  //   - "Restaurar": pega el código de backup generado en otro dispositivo
  //     (o sube el .txt). El catálogo seed local se conserva; el bundle
  //     sólo trae las listas, perfil y productos custom del usuario.

  import { app } from '$lib/stores/app.svelte';
  import { hashPin } from '$lib/storage';
  import { applyBackupCode, readCodeFromFile } from '$lib/backup';
  import { startSync } from '$lib/sync.svelte';

  let mode = $state<'new' | 'restore'>('new');

  // --- Form crear nuevo ---
  let username = $state('');
  let pin = $state('');
  let pinConfirm = $state('');
  let theme = $state<'light' | 'dark' | 'system'>('system');
  let error = $state('');

  // --- Form restaurar ---
  let rCode = $state('');
  let rPin = $state('');
  let rPinConfirm = $state('');
  let restoring = $state(false);

  const usernameClean = $derived(username.trim());
  const isCompanion = $derived(/@MOVIL$/i.test(usernameClean));
  const valid = $derived(
    usernameClean.length >= 3 && /^\d{4}$/.test(pin) && pin === pinConfirm,
  );

  const restoreValid = $derived(
    rCode.trim().length > 20 && /^\d{4}$/.test(rPin) && rPin === rPinConfirm,
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

  async function restore() {
    error = '';
    if (!restoreValid) {
      error = 'Pega el código y define un PIN de 4 dígitos para este dispositivo.';
      return;
    }
    restoring = true;
    try {
      await applyBackupCode(rCode, await hashPin(rPin));
      // Tras restaurar, arrancamos sync automáticamente para que este
      // dispositivo se enganche con los demás que tengan el mismo username.
      startSync().catch((e) => console.warn('Auto-start sync tras restore falló:', e));
    } catch (e) {
      error = (e as Error).message;
    } finally {
      restoring = false;
    }
  }

  async function pickFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    rCode = await readCodeFromFile(file);
  }

  async function paste() {
    try {
      rCode = (await navigator.clipboard.readText()).trim();
    } catch {
      // sin permisos: el usuario tendrá que pegar a mano
    }
  }
</script>

<div class="mx-auto w-full max-w-md p-6 pop-in">
  <div class="card-elev p-8 space-y-6">
    <header class="text-center space-y-1">
      <div class="text-5xl">🛒</div>
      <h1 class="text-2xl font-bold">Tu Compra</h1>
      <p class="text-sm text-muted">
        {mode === 'new' ? 'Crea tu perfil para empezar' : 'Restaura desde un código de backup'}
      </p>
    </header>

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

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <button type="button" onclick={submit} disabled={!valid}
        class="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50 transition"
        style="background: var(--accent);">
        Crear perfil
      </button>

    {:else}
      <p class="text-xs text-muted">
        En tu otro dispositivo, pulsa <strong>📋</strong> en la cabecera para
        generar el código. Pégalo aquí y define un PIN local nuevo.
      </p>

      <div class="space-y-2">
        <textarea
          bind:value={rCode}
          placeholder="Pega aquí el código de backup…"
          rows="5"
          class="w-full rounded-xl border p-3 text-xs font-mono bg-transparent"
          style="border-color: var(--border);"
        ></textarea>
        <div class="flex gap-2">
          <button onclick={paste}
            class="flex-1 rounded-xl border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
            style="border-color: var(--border);">📋 Pegar del portapapeles</button>
          <label class="flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm text-center hover:bg-[var(--bg)] transition"
            style="border-color: var(--border);">
            📂 Subir .txt
            <input type="file" accept=".txt,text/plain" class="hidden" onchange={pickFile} />
          </label>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="text-sm font-medium">PIN nuevo</span>
          <input type="password" inputmode="numeric" pattern="\d{4}" maxlength="4" bind:value={rPin}
            class="mt-1 w-full rounded-xl border px-4 py-2.5 text-center tracking-[0.5em] bg-transparent"
            style="border-color: var(--border);" />
        </label>
        <label class="block">
          <span class="text-sm font-medium">Confirmar</span>
          <input type="password" inputmode="numeric" pattern="\d{4}" maxlength="4" bind:value={rPinConfirm}
            class="mt-1 w-full rounded-xl border px-4 py-2.5 text-center tracking-[0.5em] bg-transparent"
            style="border-color: var(--border);" />
        </label>
      </div>

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <button type="button" onclick={restore} disabled={!restoreValid || restoring}
        class="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50 transition"
        style="background: var(--accent);">
        {restoring ? 'Restaurando…' : 'Restaurar'}
      </button>
    {/if}
  </div>
</div>
