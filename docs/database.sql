-- Axon Protocol Supabase schema

create table if not exists chains (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  chain_name text not null,
  chain_id text unique,
  rpc_url text,
  explorer_url text,
  config jsonb,
  status text default 'deploying',
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists validator_snapshots (
  id uuid primary key default gen_random_uuid(),
  chain_id text references chains(chain_id),
  node_id text,
  uptime numeric,
  snapshot_at timestamptz default now()
);
