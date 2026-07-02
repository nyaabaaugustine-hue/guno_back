-- Performance indexes for AI query optimization
-- Composite indexes for common query patterns
-- Full-text search support for client lookups

-- ── Tax Returns Performance ─────────────────────────────────────
-- Composite index for status-based queries (completed, in_review, draft)
CREATE INDEX IF NOT EXISTS "idx_tax_returns_firm_status"
  ON "tax_returns"("firm_id", "status");

-- Index for tax year queries and grouping
CREATE INDEX IF NOT EXISTS "idx_tax_returns_firm_year"
  ON "tax_returns"("firm_id", "tax_year");

-- Composite index for preparer/reviewer assignments
CREATE INDEX IF NOT EXISTS "idx_tax_returns_preparer"
  ON "tax_returns"("preparer_id");

CREATE INDEX IF NOT EXISTS "idx_tax_returns_reviewer"
  ON "tax_returns"("reviewer_id");

-- ── Clients Performance ─────────────────────────────────────────
-- Composite index for full-name search (AI queries ask by name)
CREATE INDEX IF NOT EXISTS "idx_clients_firm_name"
  ON "clients"("firm_id", "last_name", "first_name");

-- Index for email-based lookups
CREATE INDEX IF NOT EXISTS "idx_clients_email"
  ON "clients"("email");

-- ── Documents Performance ───────────────────────────────────────
-- Composite for document status queries by firm
CREATE INDEX IF NOT EXISTS "idx_documents_firm_status"
  ON "documents"("firm_id", "status");

-- Index for document type lookups
CREATE INDEX IF NOT EXISTS "idx_documents_type"
  ON "documents"("document_type");

-- ── Users Performance ───────────────────────────────────────────
-- Composite for user role queries within a firm
CREATE INDEX IF NOT EXISTS "idx_users_firm_role"
  ON "users"("firm_id", "role");
