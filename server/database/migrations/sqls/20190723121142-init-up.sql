-- Create extension PgCrypto and UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS citext;

-- Roles
create role portal login password 'portalpwd';

create role portal_user;
grant portal_user to portal;

create role portal_anonym;
grant portal_anonym to portal;

-- Create schemas
create schema if not exists app_public;
create schema if not exists app_private;
CREATE SCHEMA IF NOT EXISTS app_jobs;

grant usage on schema app_public to portal, portal_user, portal_anonym;
grant usage on schema app_private to portal;
grant usage on schema app_jobs to portal;

-- This allows inserts without granting permission to the serial primary key column.
alter default privileges for role portal in schema app_public grant usage, select on sequences to portal_user;

-- BEGIN: JOBS
--
-- An asynchronous job queue schema for ACID compliant job creation through
-- triggers/functions/etc.
--
-- Worker code: worker.js
--
-- Author: Benjie Gillam <code@benjiegillam.com>
-- License: MIT
-- URL: https://gist.github.com/benjie/839740697f5a1c46ee8da98a1efac218
-- Donations: https://www.paypal.me/benjie

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE TABLE app_jobs.job_queues (
  queue_name varchar NOT NULL PRIMARY KEY,
  job_count int DEFAULT 0 NOT NULL,
  locked_at timestamp with time zone,
  locked_by varchar
);
ALTER TABLE app_jobs.job_queues ENABLE ROW LEVEL SECURITY;

CREATE TABLE app_jobs.jobs (
  id uuid PRIMARY KEY default uuid_generate_v4(),
  queue_name varchar DEFAULT (public.gen_random_uuid())::varchar NOT NULL,
  task_identifier varchar NOT NULL,
  payload json DEFAULT '{}'::json NOT NULL,
  priority int DEFAULT 0 NOT NULL,
  run_at timestamp with time zone DEFAULT now() NOT NULL,
  attempts int DEFAULT 0 NOT NULL,
  last_error varchar,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);
ALTER TABLE app_jobs.job_queues ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION app_jobs.do_notify() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(TG_ARGV[0], '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION app_jobs.update_timestamps() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = NOW();
    NEW.updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.created_at = OLD.created_at;
    NEW.updated_at = GREATEST(NOW(), OLD.updated_at + INTERVAL '1 millisecond');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION app_jobs.jobs__decrease_job_queue_count() RETURNS trigger AS $$
BEGIN
  UPDATE app_jobs.job_queues
    SET job_count = job_queues.job_count - 1
    WHERE queue_name = OLD.queue_name
    AND job_queues.job_count > 1;

  IF NOT FOUND THEN
    DELETE FROM app_jobs.job_queues WHERE queue_name = OLD.queue_name;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION app_jobs.jobs__increase_job_queue_count() RETURNS trigger AS $$
BEGIN
  INSERT INTO app_jobs.job_queues(queue_name, job_count)
    VALUES(NEW.queue_name, 1)
    ON CONFLICT (queue_name) DO UPDATE SET job_count = job_queues.job_count + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _100_timestamps BEFORE INSERT OR UPDATE ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.update_timestamps();
CREATE TRIGGER _500_increase_job_queue_count AFTER INSERT ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.jobs__increase_job_queue_count();
CREATE TRIGGER _500_decrease_job_queue_count BEFORE DELETE ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.jobs__decrease_job_queue_count();
CREATE TRIGGER _900_notify_worker AFTER INSERT ON app_jobs.jobs FOR EACH STATEMENT EXECUTE PROCEDURE app_jobs.do_notify('jobs:insert');

CREATE FUNCTION app_jobs.add_job(identifier varchar, payload json) RETURNS app_jobs.jobs AS $$
  INSERT INTO app_jobs.jobs(task_identifier, payload) VALUES(identifier, payload) RETURNING *;
$$ LANGUAGE sql;

CREATE FUNCTION app_jobs.add_job(identifier varchar, queue_name varchar, payload json) RETURNS app_jobs.jobs AS $$
  INSERT INTO app_jobs.jobs(task_identifier, queue_name, payload) VALUES(identifier, queue_name, payload) RETURNING *;
$$ LANGUAGE sql;

CREATE FUNCTION app_jobs.schedule_job(identifier varchar, queue_name varchar, payload json, run_at timestamptz) RETURNS app_jobs.jobs AS $$
  INSERT INTO app_jobs.jobs(task_identifier, queue_name, payload, run_at) VALUES(identifier, queue_name, payload, run_at) RETURNING *;
$$ LANGUAGE sql;

CREATE FUNCTION app_jobs.complete_job(worker_id varchar, job_id uuid) RETURNS app_jobs.jobs AS $$
DECLARE
  v_row app_jobs.jobs;
BEGIN
  DELETE FROM app_jobs.jobs
    WHERE id = job_id
    RETURNING * INTO v_row;

  UPDATE app_jobs.job_queues
    SET locked_by = null, locked_at = null
    WHERE queue_name = v_row.queue_name AND locked_by = worker_id;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION app_jobs.fail_job(worker_id varchar, job_id uuid, error_message varchar) RETURNS app_jobs.jobs AS $$
DECLARE
  v_row app_jobs.jobs;
BEGIN
  UPDATE app_jobs.jobs
    SET
      last_error = error_message,
      run_at = greatest(now(), run_at) + (exp(least(attempts, 10))::text || ' seconds')::interval
    WHERE id = job_id
    RETURNING * INTO v_row;

  UPDATE app_jobs.job_queues
    SET locked_by = null, locked_at = null
    WHERE queue_name = v_row.queue_name AND locked_by = worker_id;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION app_jobs.get_job(worker_id varchar, identifiers varchar[]) RETURNS app_jobs.jobs AS $$
DECLARE
  v_job_id uuid;
  v_queue_name varchar;
  v_default_job_expiry text = (4 * 60 * 60)::text;
  v_default_job_maximum_attempts text = '25';
  v_row app_jobs.jobs;
BEGIN
  IF worker_id IS NULL OR length(worker_id) < 10 THEN
    RAISE EXCEPTION 'Invalid worker ID';
  END IF;

  SELECT job_queues.queue_name, jobs.id INTO v_queue_name, v_job_id
    FROM app_jobs.job_queues
    INNER JOIN app_jobs.jobs USING (queue_name)
    WHERE (locked_at IS NULL OR locked_at < (now() - (COALESCE(current_setting('jobs.expiry', true), v_default_job_expiry) || ' seconds')::interval))
    AND run_at <= now()
    AND attempts < COALESCE(current_setting('jobs.maximum_attempts', true), v_default_job_maximum_attempts)::int
    AND (identifiers IS NULL OR task_identifier = any(identifiers))
    ORDER BY priority ASC, run_at ASC, id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

  IF v_queue_name IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE app_jobs.job_queues
    SET
      locked_by = worker_id,
      locked_at = now()
    WHERE job_queues.queue_name = v_queue_name;

  UPDATE app_jobs.jobs
    SET attempts = attempts + 1
    WHERE id = v_job_id
    RETURNING * INTO v_row;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql;

-- END: JOBS


-- BEGIN: Utils

create function app_private.tg__add_job_for_row() returns trigger as $$
begin
  perform app_jobs.add_job(tg_argv[0], json_build_object('id', NEW.id));
  return NEW;
end;
$$ language plpgsql set search_path from current;

comment on function app_private.tg__add_job_for_row() is
  E'Useful shortcut to create a job on insert or update. Pass the task name as the trigger argument, and the record id will automatically be available on the JSON payload.';

--------------------------------------------------------------------------------

create function app_private.tg__update_timestamps() returns trigger as $$
begin
  NEW.created_at = (case when TG_OP = 'INSERT' then NOW() else OLD.created_at end);
  NEW.updated_at = (case when TG_OP = 'UPDATE' and OLD.updated_at >= NOW() then OLD.updated_at + interval '1 millisecond' else NOW() end);
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;

comment on function app_private.tg__update_timestamps() is
  E'This trigger should be called on all tables with created_at, updated_at - it ensures that they cannot be manipulated and that updated_at will always be larger than the previous updated_at.';
-- END: Utils


-- BEGIN: Users

create function app_public.current_user_id() returns uuid as $$
  select nullif(current_setting('jwt.claims.user_id', true), '')::uuid;
$$ language sql stable set search_path from current;

comment on function  app_public.current_user_id() is
  E'@omit\nHandy method to get the current user ID for use in RLS policies, etc; in GraphQL, use `currentUser{id}` instead.';

--------------------------------------------------------------------------------

create table app_public.users (
  id uuid primary key default uuid_generate_v4(),
  username citext not null unique check(username ~ '^[a-zA-Z]([a-zA-Z0-9][_]?)+$'),
  name text,
  avatar_url text check(avatar_url ~ '^https?://[^/]+'),
	is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table app_public.users enable row level security;

create trigger _100_timestamps
  before insert or update on app_public.users
  for each row
  execute procedure app_private.tg__update_timestamps();

-- By doing `@omit all` we prevent the `allUsers` field from appearing in our
-- GraphQL schema.  User discovery is still possible by browsing the rest of
-- the data, but it makes it harder for people to receive a `totalCount` of
-- users, or enumerate them fully.
comment on table app_public.users is
  E'@omit all\nA user who can log in to the application.';

comment on column app_public.users.id is
  E'Unique identifier for the user.';
comment on column app_public.users.username is
  E'Public-facing username (or ''handle'') of the user.';
comment on column app_public.users.name is
  E'Public-facing name (or pseudonym) of the user.';
comment on column app_public.users.avatar_url is
  E'Optional avatar URL.';
comment on column app_public.users.is_admin is
  E'If true, the user has elevated privileges.';

create policy select_all on app_public.users for select using (true);
create policy update_self on app_public.users for update using (id = app_public.current_user_id());
create policy delete_self on app_public.users for delete using (id = app_public.current_user_id());
grant select on app_public.users to portal, portal_anonym, portal_user;
grant update(name, avatar_url) on app_public.users to portal, portal_user;
grant delete on app_public.users to portal, portal_user;

create function app_private.tg_users__make_first_user_admin() returns trigger as $$
begin
  if not exists(select 1 from app_public.users) then
    NEW.is_admin = true;
  end if;
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;
create trigger _200_make_first_user_admin
  before insert on app_public.users
  for each row
  execute procedure app_private.tg_users__make_first_user_admin();

--------------------------------------------------------------------------------

create function app_public.current_user_is_admin() returns bool as $$
  -- We're using exists here because it guarantees true/false rather than true/false/null
  select exists(
    select 1 from app_public.users where id = app_public.current_user_id() and is_admin = true
	);
$$ language sql stable set search_path from current;
comment on function  app_public.current_user_is_admin() is
  E'@omit\nHandy method to determine if the current user is an admin, for use in RLS policies, etc; in GraphQL should use `currentUser{isAdmin}` instead.';

--------------------------------------------------------------------------------

create function app_public.current_user() returns app_public.users as $$
  select users.* from app_public.users where id = app_public.current_user_id();
$$ language sql stable set search_path from current;

--------------------------------------------------------------------------------

create table app_private.user_secrets (
  user_id uuid not null primary key references app_public.users,
  password_hash text,
  password_attempts int not null default 0,
  first_failed_password_attempt timestamptz,
  reset_password_token text,
  reset_password_token_generated timestamptz,
  reset_password_attempts int not null default 0,
  first_failed_reset_password_attempt timestamptz
);

comment on table app_private.user_secrets is
  E'The contents of this table should never be visible to the user. Contains data mostly related to authentication.';

create function app_private.tg_user_secrets__insert_with_user() returns trigger as $$
begin
  insert into app_private.user_secrets(user_id) values(NEW.id);
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;
create trigger _500_insert_secrets
  after insert on app_public.users
  for each row
  execute procedure app_private.tg_user_secrets__insert_with_user();

comment on function app_private.tg_user_secrets__insert_with_user() is
  E'Ensures that every user record has an associated user_secret record.';

--------------------------------------------------------------------------------

create table app_public.user_emails (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default app_public.current_user_id() references app_public.users on delete cascade,
  email citext not null check (email ~ '[^@]+@[^@]+\.[^@]+'),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, email)
);

create unique index uniq_user_emails_verified_email on app_public.user_emails(email) where is_verified is true;
alter table app_public.user_emails enable row level security;
create trigger _100_timestamps
  before insert or update on app_public.user_emails
  for each row
  execute procedure app_private.tg__update_timestamps();
create trigger _900_send_verification_email
  after insert on app_public.user_emails
  for each row when (NEW.is_verified is false)
  execute procedure app_private.tg__add_job_for_row('user_emails__send_verification');

-- `@omit all` because there's no point exposing `allUserEmails` - you can only
-- see your own, and having this behaviour can lead to bad practices from
-- frontend teams.
comment on table app_public.user_emails is
  E'@omit all\nInformation about a user''s email address.';
comment on column app_public.user_emails.email is
  E'The users email address, in `a@b.c` format.';
comment on column app_public.user_emails.is_verified is
  E'True if the user has is_verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise.';

create policy select_own on app_public.user_emails for select using (user_id = app_public.current_user_id());
create policy insert_own on app_public.user_emails for insert with check (user_id = app_public.current_user_id());
create policy delete_own on app_public.user_emails for delete using (user_id = app_public.current_user_id()); -- TODO check this isn't the last one!
grant select on app_public.user_emails to portal_user, portal_anonym;
grant insert (email) on app_public.user_emails to portal_user, portal_anonym;
grant delete on app_public.user_emails to portal_user, portal_anonym;

--------------------------------------------------------------------------------

create table app_private.user_email_secrets (
  user_email_id uuid primary key references app_public.user_emails on delete cascade,
  verification_token text,
  password_reset_email_sent_at timestamptz
);
alter table app_private.user_email_secrets enable row level security;

comment on table app_private.user_email_secrets is
  E'The contents of this table should never be visible to the user. Contains data mostly related to email verification and avoiding spamming users.';
comment on column app_private.user_email_secrets.password_reset_email_sent_at is
  E'We store the time the last password reset was sent to this email to prevent the email getting flooded.';

create function app_private.tg_user_email_secrets__insert_with_user_email() returns trigger as $$
declare
  v_verification_token text;
begin
  if NEW.is_verified is false then
    v_verification_token = encode(gen_random_bytes(4), 'hex');
  end if;
  insert into app_private.user_email_secrets(user_email_id, verification_token) values(NEW.id, v_verification_token);
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;
create trigger _500_insert_secrets
  after insert on app_public.user_emails
  for each row
  execute procedure app_private.tg_user_email_secrets__insert_with_user_email();
comment on function app_private.tg_user_email_secrets__insert_with_user_email() is
  E'Ensures that every user_email record has an associated user_email_secret record.';

--------------------------------------------------------------------------------

create table app_public.user_authentications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references app_public.users on delete cascade,
  service text not null,
  identifier text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_user_authentications unique(service, identifier)
);
alter table app_public.user_authentications enable row level security;
create trigger _100_timestamps
  before insert or update on app_public.user_authentications
  for each row
  execute procedure app_private.tg__update_timestamps();

comment on table app_public.user_authentications is
  E'@omit all\nContains information about the login providers this user has used, so that they may disconnect them should they wish.';
comment on column app_public.user_authentications.user_id is
  E'@omit';
comment on column app_public.user_authentications.service is
  E'The login service used, e.g. `twitter` or `github`.';
comment on column app_public.user_authentications.identifier is
  E'A unique identifier for the user within the login service.';
comment on column app_public.user_authentications.details is
  E'@omit\nAdditional profile details extracted from this login method';

create policy select_own on app_public.user_authentications for select using (user_id = app_public.current_user_id());
create policy delete_own on app_public.user_authentications for delete using (user_id = app_public.current_user_id()); -- TODO check this isn't the last one, or that they have a verified email address
grant select on app_public.user_authentications to portal_user;
grant delete on app_public.user_authentications to portal_user;

--------------------------------------------------------------------------------

create table app_private.user_authentication_secrets (
  user_authentication_id uuid not null primary key references app_public.user_authentications on delete cascade,
  details jsonb not null default '{}'::jsonb
);
alter table app_private.user_authentication_secrets enable row level security;

-- NOTE: user_authentication_secrets doesn't need an auto-inserter as we handle
-- that everywhere that can create a user_authentication row.

--------------------------------------------------------------------------------

create function app_public.forgot_password(email text) returns boolean as $$
declare
  v_user_email app_public.user_emails;
  v_reset_token text;
  v_reset_min_duration_between_emails interval = interval '30 minutes';
  v_reset_max_duration interval = interval '3 days';
begin
  -- Find the matching user_email
  select user_emails.* into v_user_email
  from app_public.user_emails
  where user_emails.email = forgot_password.email::citext
  order by is_verified desc, id desc;

  if not (v_user_email is null) then
    -- See if we've triggered a reset recently
    if exists(
      select 1
      from app_private.user_email_secrets
      where user_email_id = v_user_email.id
      and password_reset_email_sent_at is not null
      and password_reset_email_sent_at > now() - v_reset_min_duration_between_emails
    ) then
      return true;
    end if;

    -- Fetch or generate reset token
    update app_private.user_secrets
    set
      reset_password_token = (
        case
        when reset_password_token is null or reset_password_token_generated < NOW() - v_reset_max_duration
        then encode(gen_random_bytes(6), 'hex')
        else reset_password_token
        end
      ),
      reset_password_token_generated = (
        case
        when reset_password_token is null or reset_password_token_generated < NOW() - v_reset_max_duration
        then now()
        else reset_password_token_generated
        end
      )
    where user_id = v_user_email.user_id
    returning reset_password_token into v_reset_token;

    -- Don't allow spamming an email
    update app_private.user_email_secrets
    set password_reset_email_sent_at = now()
    where user_email_id = v_user_email.id;

    -- Trigger email send
    perform app_jobs.add_job('user__forgot_password', json_build_object('id', v_user_email.user_id, 'email', v_user_email.email::text, 'token', v_reset_token));
    return true;

  end if;
  return false;
end;
$$ language plpgsql strict security definer volatile set search_path from current;

comment on function app_public.forgot_password(email text) is
  E'@resultFieldName success\nIf you''ve forgotten your password, give us one of your email addresses and we'' send you a reset token. Note this only works if you have added an email address!';

--------------------------------------------------------------------------------

create function app_private.login(username text, password text) returns app_public.users as $$
declare
  v_user app_public.users;
  v_user_secret app_private.user_secrets;
  v_login_attempt_window_duration interval = interval '6 hours';
begin
  select users.* into v_user
  from app_public.users
  where
    -- Match username against users username, or any verified email address
    (
      users.username = login.username
    or
      exists(
        select 1
        from app_public.user_emails
        where user_id = users.id
        and is_verified is true
        and email = login.username::citext
      )
    );

  if not (v_user is null) then
    -- Load their secrets
    select * into v_user_secret from app_private.user_secrets
    where user_secrets.user_id = v_user.id;

    -- Have there been too many login attempts?
    if (
      v_user_secret.first_failed_password_attempt is not null
    and
      v_user_secret.first_failed_password_attempt > NOW() - v_login_attempt_window_duration
    and
      v_user_secret.password_attempts >= 20
    ) then
      raise exception 'User account locked - too many login attempts' using errcode = 'LOCKD';
    end if;

    -- Not too many login attempts, let's check the password
    if v_user_secret.password_hash = crypt(password, v_user_secret.password_hash) then
      -- Excellent - they're loggged in! Let's reset the attempt tracking
      update app_private.user_secrets
      set password_attempts = 0, first_failed_password_attempt = null
      where user_id = v_user.id;
      return v_user;
    else
      -- Wrong password, bump all the attempt tracking figures
      update app_private.user_secrets
      set
        password_attempts = (case when first_failed_password_attempt is null or first_failed_password_attempt < now() - v_login_attempt_window_duration then 1 else password_attempts + 1 end),
        first_failed_password_attempt = (case when first_failed_password_attempt is null or first_failed_password_attempt < now() - v_login_attempt_window_duration then now() else first_failed_password_attempt end)
      where user_id = v_user.id;
      return null;
    end if;
  else
    -- No user with that email/username was found
    return null;
  end if;
end;
$$ language plpgsql strict security definer volatile set search_path from current;

comment on function app_private.login(username text, password text) is
  E'Returns a user that matches the username/password combo, or null on failure.';

--------------------------------------------------------------------------------

create function app_public.reset_password(user_id uuid, reset_token text, new_password text) returns app_public.users as $$
declare
  v_user app_public.users;
  v_user_secret app_private.user_secrets;
  v_reset_max_duration interval = interval '3 days';
begin
  select users.* into v_user
  from app_public.users
  where id = user_id;

  if not (v_user is null) then
    -- Load their secrets
    select * into v_user_secret from app_private.user_secrets
    where user_secrets.user_id = v_user.id;

    -- Have there been too many reset attempts?
    if (
      v_user_secret.first_failed_reset_password_attempt is not null
    and
      v_user_secret.first_failed_reset_password_attempt > NOW() - v_reset_max_duration
    and
      v_user_secret.reset_password_attempts >= 20
    ) then
      raise exception 'Password reset locked - too many reset attempts' using errcode = 'LOCKD';
    end if;

    -- Not too many reset attempts, let's check the token
    if v_user_secret.reset_password_token = reset_token then
      -- Excellent - they're legit; let's reset the password as requested
      update app_private.user_secrets
      set
        password_hash = crypt(new_password, gen_salt('bf')),
        password_attempts = 0,
        first_failed_password_attempt = null,
        reset_password_token = null,
        reset_password_token_generated = null,
        reset_password_attempts = 0,
        first_failed_reset_password_attempt = null
      where user_secrets.user_id = v_user.id;
      return v_user;
    else
      -- Wrong token, bump all the attempt tracking figures
      update app_private.user_secrets
      set
        reset_password_attempts = (case when first_failed_reset_password_attempt is null or first_failed_reset_password_attempt < now() - v_reset_max_duration then 1 else reset_password_attempts + 1 end),
        first_failed_reset_password_attempt = (case when first_failed_reset_password_attempt is null or first_failed_reset_password_attempt < now() - v_reset_max_duration then now() else first_failed_reset_password_attempt end)
      where user_secrets.user_id = v_user.id;
      return null;
    end if;
  else
    -- No user with that id was found
    return null;
  end if;
end;
$$ language plpgsql strict volatile security definer set search_path from current;

comment on function app_public.reset_password(user_id uuid, reset_token text, new_password text) is
  E'After triggering forgotPassword, you''ll be sent a reset token. Combine this with your user ID and a new password to reset your password.';

--------------------------------------------------------------------------------

create function app_private.really_create_user(
  username text,
  email text,
  email_is_verified bool,
  name text,
  avatar_url text,
  password text default null
) returns app_public.users as $$
declare
  v_user app_public.users;
  v_username text = username;
begin
  -- Sanitise the username, and make it unique if necessary.
  if v_username is null then
    v_username = coalesce(name, 'user');
  end if;
  v_username = regexp_replace(v_username, '^[^a-z]+', '', 'i');
  v_username = regexp_replace(v_username, '[^a-z0-9]+', '_', 'i');
  if v_username is null or length(v_username) < 3 then
    v_username = 'user';
  end if;
  select (
    case
    when i = 0 then v_username
    else v_username || i::text
    end
  ) into v_username from generate_series(0, 1000) i
  where not exists(
    select 1
    from app_public.users
    where users.username = (
      case
      when i = 0 then v_username
      else v_username || i::text
      end
    )
  )
  limit 1;

  -- Insert the new user
  insert into app_public.users (username, name, avatar_url) values
    (v_username, name, avatar_url)
    returning * into v_user;

	-- Add the user's email
  if email is not null then
    insert into app_public.user_emails (user_id, email, is_verified)
    values (v_user.id, email, email_is_verified);
  end if;

  -- Store the password
  if password is not null then
    update app_private.user_secrets
    set password_hash = crypt(password, gen_salt('bf'))
    where user_id = v_user.id;
  end if;

  return v_user;
end;
$$ language plpgsql volatile security definer set search_path from current;

comment on function app_private.really_create_user(username text, email text, email_is_verified bool, name text, avatar_url text, password text) is
  E'Creates a user account. All arguments are optional, it trusts the calling method to perform sanitisation.';

--------------------------------------------------------------------------------

create function app_private.register_user(
  f_service character varying,
  f_identifier character varying,
  f_profile json,
  f_auth_details json,
  f_email_is_verified boolean default false,
  f_password text default null
) returns app_public.users as $$
declare
  v_user app_public.users;
  v_email citext;
  v_name text;
  v_username text;
  v_avatar_url text;
  v_user_authentication_id uuid;
begin
  -- Extract data from the user’s OAuth profile data.
  v_email := f_profile ->> 'email';
  v_name := f_profile ->> 'name';
  v_username := f_profile ->> 'username';
  v_avatar_url := f_profile ->> 'avatar_url';

  -- Create the user account
  v_user = app_private.really_create_user(
    username => v_username,
    email => v_email,
    email_is_verified => f_email_is_verified,
    name => v_name,
    avatar_url => v_avatar_url,
    password => f_password
  );

  -- Insert the user’s private account data (e.g. OAuth tokens)
  insert into app_public.user_authentications (user_id, service, identifier, details) values
    (v_user.id, f_service, f_identifier, f_profile) returning id into v_user_authentication_id;
  insert into app_private.user_authentication_secrets (user_authentication_id, details) values
    (v_user_authentication_id, f_auth_details);

  return v_user;
end;
$$ language plpgsql volatile security definer set search_path from current;

comment on function app_private.register_user(f_service character varying, f_identifier character varying, f_profile json, f_auth_details json, f_email_is_verified boolean, f_password text) is
  E'Used to register a user from information gleaned from OAuth. Primarily used by link_or_register_user';

--------------------------------------------------------------------------------

create function app_private.link_or_register_user(
  f_user_id uuid,
  f_service character varying,
  f_identifier character varying,
  f_profile json,
  f_auth_details json,
  f_password text default null
) returns app_public.users as $$
declare
  v_matched_user_id uuid;
  v_matched_authentication_id uuid;
  v_email citext;
  v_name text;
  v_avatar_url text;
  v_user app_public.users;
  v_user_email app_public.user_emails;
begin
  -- See if a user account already matches these details
  select id, user_id
    into v_matched_authentication_id, v_matched_user_id
    from app_public.user_authentications
    where service = f_service
    and identifier = f_identifier
    limit 1;

  if v_matched_user_id is not null and f_user_id is not null and v_matched_user_id <> f_user_id then
    raise exception 'A different user already has this account linked.' using errcode='TAKEN';
  end if;

  v_email = f_profile ->> 'email';
  v_name := f_profile ->> 'name';
  v_avatar_url := f_profile ->> 'avatar_url';

  if v_matched_authentication_id is null then
    if f_user_id is not null then
      -- Link new account to logged in user account
      insert into app_public.user_authentications (user_id, service, identifier, details) values
        (f_user_id, f_service, f_identifier, f_profile) returning id, user_id into v_matched_authentication_id, v_matched_user_id;
      insert into app_private.user_authentication_secrets (user_authentication_id, details) values
        (v_matched_authentication_id, f_auth_details);
    elsif v_email is not null then
      -- See if the email is registered
      select * into v_user_email from app_public.user_emails where email = v_email and is_verified is true;
      if not (v_user_email is null) then
        -- User exists!
        insert into app_public.user_authentications (user_id, service, identifier, details) values
          (v_user_email.user_id, f_service, f_identifier, f_profile) returning id, user_id into v_matched_authentication_id, v_matched_user_id;
        insert into app_private.user_authentication_secrets (user_authentication_id, details) values
          (v_matched_authentication_id, f_auth_details);
      end if;
    end if;
  end if;
  if v_matched_user_id is null and f_user_id is null and v_matched_authentication_id is null then
    -- Create and return a new user account
    return app_private.register_user(f_service, f_identifier, f_profile, f_auth_details, true, f_password);
  else
    if v_matched_authentication_id is not null then
      update app_public.user_authentications
        set details = f_profile
        where id = v_matched_authentication_id;
      update app_private.user_authentication_secrets
        set details = f_auth_details
        where user_authentication_id = v_matched_authentication_id;
      update app_public.users
        set
          name = coalesce(users.name, v_name),
          avatar_url = coalesce(users.avatar_url, v_avatar_url)
        where id = v_matched_user_id
        returning  * into v_user;
      return v_user;
    else
      -- v_matched_authentication_id is null
      -- -> v_matched_user_id is null (they're paired)
      -- -> f_user_id is not null (because the if clause above)
      -- -> v_matched_authentication_id is not null (because of the separate if block above creating a user_authentications)
      -- -> contradiction.
      raise exception 'This should not occur';
    end if;
  end if;
end;
$$ language plpgsql volatile security definer set search_path from current;

comment on function app_private.link_or_register_user(f_user_id uuid, f_service character varying, f_identifier character varying, f_profile json, f_auth_details json, f_password text) is
  E'If you''re logged in, this will link an additional OAuth login to your account if necessary. If you''re logged out it may find if an account already exists (based on OAuth details or email address) and return that, or create a new user account if necessary.';

-- END: Users


