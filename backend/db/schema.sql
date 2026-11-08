-- ============================================================
-- backend/db/schema.sql
-- Shipnote database. Run once in pgAdmin (Query Tool) on an EMPTY database.
-- Tables: users, products, updates, waitlist, stripe_events
-- Plan limits are enforced in the backend; the checks below are a safety net.
-- ============================================================

-- DEV ONLY: to wipe and recreate while developing, uncomment these two lines.
-- NEVER run them on a database that holds real data.
-- DROP TABLE IF EXISTS stripe_events, waitlist, updates, products, users CASCADE;
-- DROP FUNCTION IF EXISTS set_updated_at() CASCADE;


-- ------------------------------------------------------------
-- Helper: keeps updated_at current on every UPDATE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ------------------------------------------------------------
-- USERS: accounts, plan and Stripe billing state
-- ------------------------------------------------------------
CREATE TABLE users (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  email                   text NOT NULL CHECK (char_length(email) <= 254 AND email ~ '^\S+@\S+\.\S+$'),
  password_hash           text NOT NULL,
  role                    text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan                    text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  onboarded               boolean NOT NULL DEFAULT false,
  is_demo                 boolean NOT NULL DEFAULT false,

  -- Stripe (filled by checkout + webhooks only)
  stripe_customer_id      text UNIQUE,
  stripe_subscription_id  text UNIQUE,
  subscription_status     text,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean NOT NULL DEFAULT false,

  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- One account per email, ignoring upper/lower case
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ------------------------------------------------------------
-- PRODUCTS: each has a public page at /p/<slug>
-- ------------------------------------------------------------
CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  slug        text NOT NULL
              CHECK (
                char_length(slug) BETWEEN 3 AND 30
                AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
                AND slug NOT IN ('admin', 'api', 'app', 'login', 'signup', 'pricing', 'onboarding',
                                 'p', 'settings', 'billing', 'www', 'shipnote', 'demo', 'help', 'support')
              ),
  accent      text NOT NULL DEFAULT '#0E1116' CHECK (accent ~ '^#[0-9A-Fa-f]{6}$'),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Page names are unique across the whole app
CREATE UNIQUE INDEX products_slug_key ON products (slug);
CREATE INDEX products_owner_idx ON products (owner_id);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ------------------------------------------------------------
-- UPDATES: the changelog entries (draft or published)
-- release_date is sent to the frontend as "date"
-- ------------------------------------------------------------
CREATE TABLE updates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title         text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 80),
  body          text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 1000),
  category      text NOT NULL CHECK (category IN ('new', 'improved', 'fixed')),
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  release_date  date NOT NULL DEFAULT CURRENT_DATE,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Fast public page + counting published updates
CREATE INDEX updates_product_status_idx ON updates (product_id, status, release_date DESC);

CREATE TRIGGER updates_set_updated_at
  BEFORE UPDATE ON updates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ------------------------------------------------------------
-- WAITLIST: emails from the landing page form
-- ------------------------------------------------------------
CREATE TABLE waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL CHECK (char_length(email) <= 254 AND email ~ '^\S+@\S+\.\S+$'),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_email_lower_idx ON waitlist (lower(email));


-- ------------------------------------------------------------
-- STRIPE_EVENTS: ids of webhook events already handled
-- (a repeated event is ignored, so the plan is never changed twice)
-- ------------------------------------------------------------
CREATE TABLE stripe_events (
  id           text PRIMARY KEY,
  type         text NOT NULL,
  received_at  timestamptz NOT NULL DEFAULT now()
);
