-- RBAC: company_agent role + companies + staff assignments
-- Run this against your Postgres database (psql, a DB GUI, or `npm run db:migrate`
-- if your migrations journal is in sync).

-- ── New role ─────────────────────────────────────────────────────
-- Postgres requires ADD VALUE to run outside a transaction block on
-- older versions; run this statement by itself first if your client
-- wraps migrations in a transaction and errors out here.
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'company_agent';

-- ── Companies (client organizations a firm manages) ─────────────
CREATE TABLE IF NOT EXISTS "companies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firm_id" uuid NOT NULL REFERENCES "firms"("id"),
  "name" varchar(255) NOT NULL,
  "industry" varchar(255),
  "contact_name" varchar(255),
  "contact_email" varchar(255),
  "contact_phone" varchar(50),
  "notes" text,
  "created_by_id" uuid REFERENCES "users"("id"),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_companies_firm" ON "companies"("firm_id");

-- ── Staff assigned to a company (the "company_agent" scope) ─────
CREATE TABLE IF NOT EXISTS "company_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "assigned_by_id" uuid REFERENCES "users"("id"),
  "created_at" timestamp NOT NULL DEFAULT now(),
  UNIQUE("company_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "idx_company_assignments_company" ON "company_assignments"("company_id");
CREATE INDEX IF NOT EXISTS "idx_company_assignments_user" ON "company_assignments"("user_id");
