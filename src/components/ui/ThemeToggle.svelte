<script lang="ts">
  import { app } from '$lib/stores/app.svelte';

  function cycle() {
    if (!app.state.profile) return;
    const order: Array<'light' | 'dark' | 'system'> = ['system', 'light', 'dark'];
    const cur = app.state.profile.theme;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    app.state.profile.theme = next;
    app.persist();
  }

  const icon = $derived(
    app.state.profile?.theme === 'dark' ? '🌙'
    : app.state.profile?.theme === 'light' ? '☀️'
    : '🖥️'
  );
</script>

<button type="button" onclick={cycle}
  class="rounded-full border px-3 py-2 text-lg"
  style="border-color: var(--border);"
  title="Cambiar tema">
  {icon}
</button>
