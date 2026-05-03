<script lang="ts">
  // Panel de sincronización online (Supabase + AES-GCM E2E).
  // Tres pasos lineales para el usuario:
  //   1. Login / sign up con email + password
  //   2. Definir passphrase (cifra el snapshot — el servidor no la ve)
  //   3. Activar sync → empieza realtime y push debounced

  import {
    syncStatus, signIn, signUp, signOutFromCloud, setPassphrase,
    startSync, stopSync, reconnect, joinShare, leaveShare, switchShare,
  } from '$lib/sync.svelte';

  let { onClose }: { onClose: () => void } = $props();

  let mode = $state<'signin' | 'signup'>('signin');
  let email = $state('');
  let password = $state('');
  let passphrase = $state('');
  let joinId = $state('');
  let working = $state(false);
  let error = $state('');

  const ago = $derived(
    syncStatus.lastSyncAt
      ? `${Math.round((Date.now() - syncStatus.lastSyncAt) / 1000)}s`
      : '—',
  );

  async function doAuth() {
    error = '';
    working = true;
    const fn = mode === 'signin' ? signIn : signUp;
    const err = await fn(email.trim(), password);
    working = false;
    if (err) {
      error = err;
    } else if (mode === 'signup') {
      error = 'Cuenta creada. Si Supabase pide verificación por email, confírmala antes de continuar.';
    }
  }

  async function doSetPassphrase() {
    if (passphrase.length < 6) { error = 'Passphrase mínima 6 caracteres.'; return; }
    error = '';
    await setPassphrase(passphrase);
    passphrase = '';
  }

  async function doStartSync() {
    error = '';
    working = true;
    await startSync();
    working = false;
  }

  async function doSignOut() {
    if (!confirm('¿Cerrar sesión online? Se conservan los datos locales.')) return;
    await signOutFromCloud();
  }

  async function doJoin() {
    error = '';
    const err = await joinShare(joinId);
    if (err) error = err;
    else { joinId = ''; }
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(syncStatus.shareId);
    } catch {}
  }
</script>

<div class="fixed inset-0 z-50 grid place-items-center p-4"
  style="background: rgba(0,0,0,.5)" onclick={onClose} role="presentation">
  <div class="card-elev w-full max-w-md p-6 space-y-4 pop-in max-h-[90vh] overflow-y-auto"
    onclick={(e) => e.stopPropagation()} role="presentation">

    <header class="flex items-start justify-between">
      <h2 class="text-lg font-bold">📡 Sincronización online</h2>
      <button onclick={onClose} class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    {#if !syncStatus.user}
      <!-- Paso 1: Login / Sign up -->
      <p class="text-xs text-muted">
        Usa una cuenta Supabase para sincronizar tus listas entre dispositivos
        en tiempo real, cifradas extremo-a-extremo.
      </p>

      <div class="grid grid-cols-2 rounded-xl overflow-hidden border" style="border-color: var(--border);">
        <button onclick={() => (mode = 'signin')}
          class="py-2 text-sm font-medium transition"
          style={mode === 'signin' ? 'background: var(--accent); color: white;' : ''}>
          Iniciar sesión
        </button>
        <button onclick={() => (mode = 'signup')}
          class="py-2 text-sm font-medium transition"
          style={mode === 'signup' ? 'background: var(--accent); color: white;' : ''}>
          Crear cuenta
        </button>
      </div>

      <input type="email" bind:value={email} placeholder="email"
        autocomplete="email"
        class="w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);" />
      <input type="password" bind:value={password} placeholder="contraseña (mín. 6 chars)"
        autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
        onkeydown={(e) => e.key === 'Enter' && doAuth()}
        class="w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);" />

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <button onclick={doAuth} disabled={working}
        class="w-full rounded-xl py-2.5 font-semibold text-white disabled:opacity-50 transition"
        style="background: var(--accent);">
        {working ? '…' : (mode === 'signin' ? 'Entrar' : 'Crear cuenta')}
      </button>

    {:else if !syncStatus.passphraseSet}
      <!-- Paso 2: Passphrase -->
      <div class="rounded-xl bg-[var(--bg)] p-3 text-xs space-y-1.5"
        style="border: 1px solid var(--border);">
        <p>👤 <strong>{syncStatus.user.email}</strong></p>
        <p class="text-muted">Define una passphrase para cifrar tus listas.
          El servidor sólo verá bytes opacos. Compártela <strong>fuera de la app</strong>
          (WhatsApp, en persona…) con quien quieras que vea tus listas.</p>
      </div>

      <input type="password" bind:value={passphrase} placeholder="passphrase (mín. 6 chars)"
        onkeydown={(e) => e.key === 'Enter' && doSetPassphrase()}
        class="w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);" />

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <button onclick={doSetPassphrase}
        class="w-full rounded-xl py-2.5 font-semibold text-white transition"
        style="background: var(--accent);">
        🔐 Establecer passphrase
      </button>

      <button onclick={doSignOut}
        class="w-full text-xs text-muted hover:underline">Cerrar sesión online</button>

    {:else}
      <!-- Paso 3: Sync activa o lista para arrancar -->
      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt class="text-muted">Cuenta</dt>
        <dd class="font-medium truncate">{syncStatus.user.email}</dd>

        <dt class="text-muted">Estado</dt>
        <dd>
          {#if !syncStatus.enabled}
            <span style="color:#f59e0b">⚠️ no activa</span>
          {:else if syncStatus.signalingConnected}
            <span style="color:#22c55e">🟢 conectada (realtime)</span>
          {:else}
            <span style="color:#0ea5e9">🟡 conectando…</span>
          {/if}
        </dd>

        <dt class="text-muted">Lista activa</dt>
        <dd class="font-mono text-xs break-all">
          {syncStatus.shareId || '—'}
          {#if syncStatus.shareId}
            <button onclick={copyShare} class="text-muted hover:text-current ml-1" title="Copiar">📋</button>
          {/if}
        </dd>

        <dt class="text-muted">Última sync</dt>
        <dd>{ago === '—' ? '—' : `hace ${ago}`}</dd>

        {#if syncStatus.lastError}
          <dt class="text-muted">Error</dt>
          <dd class="text-red-500 text-xs break-all">{syncStatus.lastError}</dd>
        {/if}
      </dl>

      {#if syncStatus.shares.length > 1}
        <details class="rounded-xl border p-3 text-sm" style="border-color: var(--border);">
          <summary class="cursor-pointer font-medium">Cambiar de lista ({syncStatus.shares.length})</summary>
          <ul class="mt-2 space-y-1 text-xs">
            {#each syncStatus.shares as s}
              <li class="flex items-center gap-2">
                <button onclick={() => switchShare(s.share_id)}
                  disabled={s.share_id === syncStatus.shareId}
                  class="flex-1 text-left font-mono truncate hover:underline disabled:opacity-50">
                  {s.share_id === syncStatus.shareId ? '➤ ' : ''}{s.share_id}
                </button>
                {#if !s.share_id.startsWith('personal:')}
                  <button onclick={() => leaveShare(s.share_id)}
                    class="text-muted hover:text-red-500" title="Salir de esta lista">×</button>
                {/if}
              </li>
            {/each}
          </ul>
        </details>
      {/if}

      <details class="rounded-xl border p-3 text-sm" style="border-color: var(--border);">
        <summary class="cursor-pointer font-medium">Unirse a otra lista compartida</summary>
        <p class="text-xs text-muted mt-2">Pega el código (share_id) que te pasen.
          Necesitarás también su <strong>passphrase</strong> para descifrar.</p>
        <div class="flex gap-2 mt-2">
          <input bind:value={joinId} placeholder="personal:abcd... o el código que sea"
            class="flex-1 rounded-lg border px-3 py-2 text-xs font-mono bg-transparent"
            style="border-color: var(--border);" />
          <button onclick={doJoin}
            class="rounded-lg px-3 py-2 text-sm font-semibold text-white"
            style="background: var(--accent);">+</button>
        </div>
      </details>

      <details class="rounded-xl border p-3" style="border-color: var(--border);">
        <summary class="cursor-pointer text-sm font-medium">Log de eventos ({syncStatus.log.length})</summary>
        <pre class="mt-2 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-tight"
          style="color: var(--fg-muted)">{syncStatus.log.join('\n') || 'Sin eventos.'}</pre>
      </details>

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <div class="flex gap-2">
        {#if !syncStatus.enabled}
          <button onclick={doStartSync} disabled={working}
            class="flex-1 rounded-xl py-2.5 font-semibold text-white disabled:opacity-50 transition"
            style="background: var(--accent);">
            {working ? '…' : '▶️ Activar sync'}
          </button>
        {:else}
          <button onclick={reconnect}
            class="flex-1 rounded-xl py-2.5 font-semibold text-white transition"
            style="background: var(--accent);">
            🔄 Reconectar
          </button>
          <button onclick={() => stopSync()}
            class="rounded-xl border px-4 py-2.5 font-medium hover:bg-[var(--bg)] transition"
            style="border-color: var(--border);">
            ⏸️
          </button>
        {/if}
        <button onclick={doSignOut}
          class="rounded-xl border px-3 py-2.5 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);" title="Cerrar sesión online">🚪</button>
      </div>
    {/if}
  </div>
</div>
