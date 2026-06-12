do $$
begin
  if exists (select 1 from users limit 1) then
    raise exception 'Cannot migrate legacy users automatically: password hashes require explicit identity migration';
  end if;
end $$;

create table "user" (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table session (
  id text primary key,
  token text not null unique,
  "expiresAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user"(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table account (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table verification (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index idx_session_user_id on session ("userId");
create index idx_account_user_id on account ("userId");
create index idx_verification_identifier on verification (identifier);
create unique index idx_account_provider_account on account ("providerId", "accountId");

alter table users add column auth_user_id text;
alter table users
  add constraint users_auth_user_id_unique unique (auth_user_id),
  add constraint users_auth_user_id_fkey
    foreign key (auth_user_id) references "user"(id) on delete restrict;
alter table users drop column password_hash;
