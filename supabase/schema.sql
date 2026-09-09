-- ============================================================
-- Thaali Daftar — Supabase schema
-- FMB Kitchen Register, Hyderabad Jamaat
-- (Tiffin Distribution only — Roti module removed)
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run once on a fresh project.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Helper: "today" in Indian time, not server/UTC time
-- ------------------------------------------------------------
create or replace function ist_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'Asia/Kolkata')::date;
$$;

-- ------------------------------------------------------------
-- 1. Profiles (extends Supabase's built-in auth.users)
--    role: 'editor' (the 2 people who enter data) or 'viewer' (committee)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('editor', 'viewer')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Distributors (volunteers + Self), each with a fixed quota
-- ------------------------------------------------------------
create table distributors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  quota integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into distributors (name, quota) values
  ('Hashim Bhai', 65),
  ('Hakim Bhai', 41),
  ('Faazil Bhai', 38),
  ('Abrar Bhai', 28),
  ('Tasneem Ben', 20),
  ('Jumana Ben', 18),
  ('Ezzi Mohalla', 23),
  ('Rafiq Bhai', 25),
  ('Self', 123);

-- ------------------------------------------------------------
-- 3. Daily tiffin summary (one row per day)
-- ------------------------------------------------------------
create table tiffin_daily_summary (
  date date primary key default ist_today(),
  total_made integer,
  menu text,
  confirmed_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. Tiffin entries — one row per distributor per day
-- ------------------------------------------------------------
create table tiffin_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null default ist_today(),
  distributor_id uuid not null references distributors(id),
  delivered integer not null default 0,
  entered_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, distributor_id)
);

-- ------------------------------------------------------------
-- 5. Edit log — auto-filled by the trigger below, never written directly
-- ------------------------------------------------------------
create table edit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  field text not null,
  old_value text,
  new_value text,
  changed_by uuid references profiles(id),
  changed_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. Trigger: auto-log every correction to a delivered count
-- ------------------------------------------------------------
create or replace function log_tiffin_edit()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.delivered is distinct from new.delivered then
    insert into edit_log (table_name, record_id, field, old_value, new_value, changed_by)
    values ('tiffin_entries', new.id, 'delivered', old.delivered::text, new.delivered::text, auth.uid());
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_tiffin_edit
  before update on tiffin_entries
  for each row execute function log_tiffin_edit();

-- ------------------------------------------------------------
-- 7. Row Level Security — enable on everything
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table distributors enable row level security;
alter table tiffin_daily_summary enable row level security;
alter table tiffin_entries enable row level security;
alter table edit_log enable row level security;

-- Helper to check if the current user is an editor
create or replace function is_editor()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'editor'
  );
$$;

-- profiles: everyone signed in can see the list (names only matter, no secrets)
create policy "profiles_select" on profiles for select using (auth.uid() is not null);

-- distributors: all signed-in users can read; only editors can write
create policy "distributors_select" on distributors for select using (auth.uid() is not null);
create policy "distributors_write" on distributors for all using (is_editor()) with check (is_editor());

-- tiffin_daily_summary: read for all; write for editors, only on today's row
create policy "summary_select" on tiffin_daily_summary for select using (auth.uid() is not null);
create policy "summary_insert" on tiffin_daily_summary for insert with check (is_editor() and date = ist_today());
create policy "summary_update" on tiffin_daily_summary for update using (is_editor() and date = ist_today());

-- tiffin_entries: read for all; write for editors, only on today's rows
create policy "tiffin_select" on tiffin_entries for select using (auth.uid() is not null);
create policy "tiffin_insert" on tiffin_entries for insert with check (is_editor() and date = ist_today());
create policy "tiffin_update" on tiffin_entries for update using (is_editor() and date = ist_today());

-- edit_log: read-only for everyone signed in; only the trigger (security definer) writes to it
create policy "edit_log_select" on edit_log for select using (auth.uid() is not null);

-- ============================================================
-- Done. Next: create your 2 editor + 5-6 viewer accounts in
-- Supabase Auth, then insert matching rows into `profiles`
-- with the correct role for each.
-- ============================================================