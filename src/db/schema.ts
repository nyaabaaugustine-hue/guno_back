import { pgTable, uuid, text, varchar, timestamp, boolean, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userRoleEnum = pgEnum('user_role', ['admin', 'firm_admin', 'preparer', 'reviewer', 'advisor', 'company_agent'])

// ─── Billing ─────────────────────────────────────────────────────
// Plan tiers are defined in code (src/lib/plans.ts) — this enum just
// tags which tier a firm's subscription is on.
export const planTierEnum = pgEnum('plan_tier', ['trial', 'starter', 'professional', 'enterprise'])
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid',
])

export const firms = pgTable('firms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logo: text('logo'),
  website: text('website'),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// One row per firm. Source of truth for what a firm is allowed to do;
// Stripe is the source of truth for payment state, this table mirrors
// it for fast reads (no external API call on every request).
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  firmId: uuid('firm_id').references(() => firms.id, { onDelete: 'cascade' }).notNull().unique(),
  tier: planTierEnum('tier').default('trial').notNull(),
  status: subscriptionStatusEnum('status').default('trialing').notNull(),
  seats: integer('seats').default(1).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Append-only trail for sensitive actions (SSN access, exports, role
// changes, billing changes). Never updated or deleted from the app.
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  firmId: uuid('firm_id').references(() => firms.id, { onDelete: 'cascade' }).notNull(),
  actorId: uuid('actor_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 100 }),
  targetId: uuid('target_id'),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firmId: uuid('firm_id').references(() => firms.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('preparer').notNull(),
  avatar: text('avatar'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  firmId: uuid('firm_id').references(() => firms.id).notNull(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  // Stores AES-256-GCM ciphertext (iv:authTag:ciphertext, hex), never plaintext.
  ssn: text('ssn'),
  address: text('address'),
  notes: text('notes'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  firmId: uuid('firm_id').references(() => firms.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  notes: text('notes'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Staff (users) assigned to a company. A "company_agent" is a user whose
// access is scoped to only the companies they're assigned to here.
export const companyAssignments = pgTable('company_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedById: uuid('assigned_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const documentTypeEnum = pgEnum('document_type', ['w2', '1099', 'k1', 'brokerage', 'other'])
export const documentStatusEnum = pgEnum('document_status', ['uploaded', 'processing', 'extracted', 'verified', 'error'])

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  firmId: uuid('firm_id').references(() => firms.id).notNull(),
  uploadedById: uuid('uploaded_by_id').references(() => users.id).notNull(),
  filename: varchar('filename', { length: 500 }).notNull(),
  originalName: varchar('original_name', { length: 500 }).notNull(),
  fileSize: integer('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  // Key/path in the object store (S3/R2) where the actual file bytes
  // live. Nothing but this key is ever stored in Postgres.
  storageKey: text('storage_key'),
  documentType: documentTypeEnum('document_type').default('other'),
  status: documentStatusEnum('status').default('uploaded').notNull(),
  extractedData: jsonb('extracted_data'),
  extractionError: text('extraction_error'),
  pages: integer('pages'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const taxReturns = pgTable('tax_returns', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  firmId: uuid('firm_id').references(() => firms.id).notNull(),
  taxYear: integer('tax_year').notNull(),
  preparerId: uuid('preparer_id').references(() => users.id),
  reviewerId: uuid('reviewer_id').references(() => users.id),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  formData: jsonb('form_data'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const firmsRelations = relations(firms, ({ one, many }) => ({
  users: many(users),
  clients: many(clients),
  documents: many(documents),
  taxReturns: many(taxReturns),
  companies: many(companies),
  subscription: one(subscriptions, { fields: [firms.id], references: [subscriptions.firmId] }),
  auditLogs: many(auditLogs),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  firm: one(firms, { fields: [subscriptions.firmId], references: [firms.id] }),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  firm: one(firms, { fields: [auditLogs.firmId], references: [firms.id] }),
  actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  firm: one(firms, { fields: [users.firmId], references: [firms.id] }),
  companyAssignments: many(companyAssignments),
}))

export const companiesRelations = relations(companies, ({ one, many }) => ({
  firm: one(firms, { fields: [companies.firmId], references: [firms.id] }),
  createdBy: one(users, { fields: [companies.createdById], references: [users.id] }),
  assignments: many(companyAssignments),
}))

export const companyAssignmentsRelations = relations(companyAssignments, ({ one }) => ({
  company: one(companies, { fields: [companyAssignments.companyId], references: [companies.id] }),
  user: one(users, { fields: [companyAssignments.userId], references: [users.id] }),
  assignedBy: one(users, { fields: [companyAssignments.assignedById], references: [users.id] }),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  firm: one(firms, { fields: [clients.firmId], references: [firms.id] }),
  documents: many(documents),
  taxReturns: many(taxReturns),
}))

export const documentsRelations = relations(documents, ({ one }) => ({
  client: one(clients, { fields: [documents.clientId], references: [clients.id] }),
  firm: one(firms, { fields: [documents.firmId], references: [firms.id] }),
  uploadedBy: one(users, { fields: [documents.uploadedById], references: [users.id] }),
}))

export const taxReturnsRelations = relations(taxReturns, ({ one }) => ({
  client: one(clients, { fields: [taxReturns.clientId], references: [clients.id] }),
  firm: one(firms, { fields: [taxReturns.firmId], references: [firms.id] }),
  preparer: one(users, { fields: [taxReturns.preparerId], references: [users.id] }),
  reviewer: one(users, { fields: [taxReturns.reviewerId], references: [users.id] }),
}))
