import { pgTable, uuid, text, varchar, timestamp, boolean, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userRoleEnum = pgEnum('user_role', ['admin', 'firm_admin', 'preparer', 'reviewer', 'advisor'])

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
  ssn: varchar('ssn', { length: 11 }),
  address: text('address'),
  notes: text('notes'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  documentType: documentTypeEnum('document_type').default('other'),
  status: documentStatusEnum('status').default('uploaded').notNull(),
  extractedData: jsonb('extracted_data'),
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

export const firmsRelations = relations(firms, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  documents: many(documents),
  taxReturns: many(taxReturns),
}))

export const usersRelations = relations(users, ({ one }) => ({
  firm: one(firms, { fields: [users.firmId], references: [firms.id] }),
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
