-- Paste this into the Supabase SQL editor (Project → SQL Editor → New query)
-- to set up the schema NameFlip needs for auth, saved domains, and campaigns.

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  plan text default 'free' check (plan in ('free', 'pro', 'pro_plus')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  searches_used_today integer default 0,
  analyses_used_today integer default 0,
  last_reset_date date default current_date,
  created_at timestamptz default now()
);

-- Saved domains
create table public.saved_domains (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  domain text not null,
  analysis jsonb,
  notes text,
  monetization_mode text default 'for_sale',
  asking_price integer,
  created_at timestamptz default now()
);

-- Campaigns
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  name text,
  goal text,
  budget integer,
  risk_level text,
  keywords text[],
  status text default 'active',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.saved_domains enable row level security;
alter table public.campaigns enable row level security;

-- RLS policies: users can only see their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own saved domains" on public.saved_domains for all using (auth.uid() = user_id);
create policy "Users can manage own campaigns" on public.campaigns for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
