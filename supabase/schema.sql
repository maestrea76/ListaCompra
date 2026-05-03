-- Tu Compra — esquema Supabase para sincronización online cifrada E2E.
--
-- Ejecuta este script una vez en SQL Editor de tu proyecto Supabase.
-- No depende del método de auth (email+password, magic link, OAuth…),
-- todo se basa en auth.uid() de Supabase Auth.

-- Snapshot por lista compartida. La columna `snapshot` contiene el estado
-- completo CIFRADO (AES-GCM, base64). El servidor nunca ve el plaintext.
create table public.tucompra_snapshots (
  share_id    text primary key,
  snapshot    text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

-- Membresía: quién pertenece a cada share_id. Permite multi-usuario por lista.
create table public.tucompra_members (
  share_id  text not null,
  user_id   uuid not null references auth.users(id) on delete cascade,
  added_at  timestamptz not null default now(),
  primary key (share_id, user_id)
);

-- Row Level Security: nadie ve nada salvo que esté en la membresía.
alter table public.tucompra_snapshots enable row level security;
alter table public.tucompra_members   enable row level security;

create policy "miembros leen su snapshot"
  on public.tucompra_snapshots for select
  using (exists (
    select 1 from public.tucompra_members m
    where m.share_id = tucompra_snapshots.share_id and m.user_id = auth.uid()
  ));

create policy "miembros escriben su snapshot"
  on public.tucompra_snapshots for insert with check (exists (
    select 1 from public.tucompra_members m
    where m.share_id = tucompra_snapshots.share_id and m.user_id = auth.uid()
  ));

create policy "miembros actualizan su snapshot"
  on public.tucompra_snapshots for update
  using (exists (
    select 1 from public.tucompra_members m
    where m.share_id = tucompra_snapshots.share_id and m.user_id = auth.uid()
  ));

create policy "veo mis membresías"
  on public.tucompra_members for select
  using (user_id = auth.uid());

create policy "me uno a una lista"
  on public.tucompra_members for insert with check (user_id = auth.uid());

create policy "me salgo de una lista"
  on public.tucompra_members for delete
  using (user_id = auth.uid());

-- Realtime: notifica cambios en snapshots a otros miembros suscritos.
alter publication supabase_realtime add table public.tucompra_snapshots;
