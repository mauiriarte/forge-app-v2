-- Forge — initial schema
-- One row of profile per user; routines/exercises keep the app's client-generated
-- text ids as primary keys so the offline-first client needs no id mapping.

-- ── profiles ────────────────────────────────────────────────────
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  height_cm   numeric,
  weekly_goal int  not null default 4,
  water_size  int  not null default 250,
  water_goal  int  not null default 8,
  theme       text not null default 'dark',
  updated_at  timestamptz not null default now()
);

-- ── routines ────────────────────────────────────────────────────
create table if not exists public.routines (
  id        text not null,
  user_id   uuid not null references auth.users (id) on delete cascade,
  name      text not null,
  mus       text not null default '',
  focus     text not null default '',
  days      int[] not null default '{}',
  position  int  not null default 0,
  primary key (user_id, id)
);

create table if not exists public.routine_exercises (
  uid        text not null,
  user_id    uuid not null references auth.users (id) on delete cascade,
  routine_id text not null,
  lib        text not null,
  sets       int  not null default 3,
  reps       text not null default '10',
  last_w     numeric,
  hist       numeric[] not null default '{}',
  position   int not null default 0,
  primary key (user_id, uid),
  foreign key (user_id, routine_id) references public.routines (user_id, id) on delete cascade
);

-- ── history ─────────────────────────────────────────────────────
create table if not exists public.workout_sessions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  d_num      int  not null,
  d_mon      text not null,
  name       text not null,
  mins       int  not null,
  sets       int  not null,
  pr         text,
  created_at timestamptz not null default now()
);

-- individual body measurement entries (k: w/h/fat/mus/wat/visc/bmr/ffm…)
create table if not exists public.measurements (
  id      bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  k       text not null,
  v       numeric not null,
  t       timestamptz not null default now()
);

-- ── daily log (hydration + trained flag, one row per day) ───────
create table if not exists public.daily_logs (
  user_id        uuid not null references auth.users (id) on delete cascade,
  day            date not null,
  water          int  not null default 0,
  trained        boolean not null default false,
  water_goal_met boolean not null default false,
  primary key (user_id, day)
);

-- ── indexes ─────────────────────────────────────────────────────
create index if not exists routines_user_idx on public.routines (user_id);
create index if not exists routine_exercises_user_idx on public.routine_exercises (user_id);
create index if not exists workout_sessions_user_idx on public.workout_sessions (user_id, created_at desc);
create index if not exists measurements_user_idx on public.measurements (user_id, k, t);

-- ── row level security ──────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.routines          enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.measurements      enable row level security;
alter table public.daily_logs        enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profiles','routines','routine_exercises','workout_sessions','measurements','daily_logs'] loop
    execute format('create policy "own rows select" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "own rows insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "own rows update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "own rows delete" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;
