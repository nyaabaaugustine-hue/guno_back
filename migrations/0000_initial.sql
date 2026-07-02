CREATE TYPE "public"."user_role" AS ENUM('admin', 'firm_admin', 'preparer', 'reviewer', 'advisor');
CREATE TYPE "public"."document_type" AS ENUM('w2', '1099', 'k1', 'brokerage', 'other');
CREATE TYPE "public"."document_status" AS ENUM('uploaded', 'processing', 'extracted', 'verified', 'error');

CREATE TABLE IF NOT EXISTS "firms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL UNIQUE,
  "logo" text,
  "website" text,
  "phone" varchar(50),
  "address" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firm_id" uuid REFERENCES firms(id),
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "password_hash" text NOT NULL,
  "role" "user_role" DEFAULT 'preparer' NOT NULL,
  "avatar" text,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firm_id" uuid NOT NULL REFERENCES firms(id),
  "first_name" varchar(255) NOT NULL,
  "last_name" varchar(255) NOT NULL,
  "email" varchar(255),
  "phone" varchar(50),
  "ssn" varchar(11),
  "address" text,
  "notes" text,
  "created_by_id" uuid REFERENCES users(id),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES clients(id),
  "firm_id" uuid NOT NULL REFERENCES firms(id),
  "uploaded_by_id" uuid NOT NULL REFERENCES users(id),
  "filename" varchar(500) NOT NULL,
  "original_name" varchar(500) NOT NULL,
  "file_size" integer,
  "mime_type" varchar(100),
  "document_type" "document_type" DEFAULT 'other',
  "status" "document_status" DEFAULT 'uploaded' NOT NULL,
  "extracted_data" jsonb,
  "pages" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tax_returns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES clients(id),
  "firm_id" uuid NOT NULL REFERENCES firms(id),
  "tax_year" integer NOT NULL,
  "preparer_id" uuid REFERENCES users(id),
  "reviewer_id" uuid REFERENCES users(id),
  "status" varchar(50) DEFAULT 'draft' NOT NULL,
  "form_data" jsonb,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_users_firm" ON "users"("firm_id");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_clients_firm" ON "clients"("firm_id");
CREATE INDEX IF NOT EXISTS "idx_documents_client" ON "documents"("client_id");
CREATE INDEX IF NOT EXISTS "idx_documents_firm" ON "documents"("firm_id");
CREATE INDEX IF NOT EXISTS "idx_tax_returns_client" ON "tax_returns"("client_id");
CREATE INDEX IF NOT EXISTS "idx_tax_returns_firm" ON "tax_returns"("firm_id");
