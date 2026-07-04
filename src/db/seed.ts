import { db } from './index'
import { firms, users, clients, documents, taxReturns, subscriptions, auditLogs, companies, companyAssignments } from './schema'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { encryptSSN } from '../lib/encryption'

// NOTE ON REALISM: this data is entirely synthetic — fabricated names,
// emails, addresses, and SSNs for local/staging demo purposes only.
// SSNs use the 900-999 prefix range, which the SSA has never issued
// to a real person (it's reserved for ITINs), so these can never
// collide with or resemble a real SSN.
const FAKE_SSNS = [
  '900-12-1001', '900-34-1002', '900-56-1003', '900-78-1004', '900-90-1005',
  '901-12-1006', '901-34-1007', '901-56-1008', '901-78-1009', '901-90-1010',
  '902-12-1011', '902-34-1012', '902-56-1013', '902-78-1014', '902-90-1015',
  '903-12-1016', '903-34-1017', '903-56-1018', '903-78-1019', '903-90-1020',
]

async function seed() {
  console.log('Seeding database...')

  // Make this script safely re-runnable: if a previous run of this exact
  // demo seed (same firm slug) is still sitting in the DB — e.g. from a
  // run that crashed partway through — wipe it out first so we don't hit
  // unique-constraint errors on firms.slug. Deletes go in FK-safe order
  // (children before parents); tables with onDelete:'cascade' (subscriptions,
  // audit_logs, company_assignments) are cleaned up automatically.
  const [existingFirm] = await db.select({ id: firms.id }).from(firms).where(eq(firms.slug, 'juno-tax-services'))
  if (existingFirm) {
    console.log('Found existing demo firm from a previous run — clearing it out first...')
    await db.delete(documents).where(eq(documents.firmId, existingFirm.id))
    await db.delete(taxReturns).where(eq(taxReturns.firmId, existingFirm.id))
    await db.delete(clients).where(eq(clients.firmId, existingFirm.id))
    await db.delete(companies).where(eq(companies.firmId, existingFirm.id))
    await db.delete(auditLogs).where(eq(auditLogs.firmId, existingFirm.id))
    await db.delete(users).where(eq(users.firmId, existingFirm.id))
    await db.delete(firms).where(eq(firms.id, existingFirm.id))
    console.log('Cleared previous demo data.')
  }

  const passwordHash = await hash('password123', 10)

  const [firm] = await db.insert(firms).values({
    name: 'Juno Tax Services',
    slug: 'juno-tax-services',
    phone: '(555) 123-4567',
    address: '100 Tax Lane, Suite 200, New York, NY 10001',
  }).returning()

  if (!firm) { console.error('Failed to create firm'); return }
  console.log(`Created firm: ${firm.name}`)

  const [subscription] = await db.insert(subscriptions).values({
    firmId: firm.id,
    tier: 'professional',
    status: 'active',
    seats: 10,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
  }).returning()

  if (subscription) console.log(`Created subscription: ${subscription.tier} (${subscription.status})`)

  // One user per role, expanded to 10 so every role/permission path
  // (admin, firm_admin, preparer, reviewer, advisor, company_agent)
  // has real test coverage in the dashboards.
  const seedUsers = await db.insert(users).values([
    { firmId: firm.id, name: 'Alice Chen', email: 'alice@juno.tax', role: 'admin', passwordHash, active: true },
    { firmId: firm.id, name: 'Grace Park', email: 'grace@juno.tax', role: 'firm_admin', passwordHash, active: true },
    { firmId: firm.id, name: 'Bob Martinez', email: 'bob@juno.tax', role: 'preparer', passwordHash, active: true },
    { firmId: firm.id, name: 'David Kim', email: 'david@juno.tax', role: 'preparer', passwordHash, active: true },
    { firmId: firm.id, name: 'Henry Osei', email: 'henry@juno.tax', role: 'preparer', passwordHash, active: true },
    { firmId: firm.id, name: 'Carol Williams', email: 'carol@juno.tax', role: 'reviewer', passwordHash, active: true },
    { firmId: firm.id, name: 'Eve Johnson', email: 'eve@juno.tax', role: 'reviewer', passwordHash, active: true },
    { firmId: firm.id, name: 'Isabella Cruz', email: 'isabella@juno.tax', role: 'reviewer', passwordHash, active: true },
    { firmId: firm.id, name: 'Frank Lee', email: 'frank@juno.tax', role: 'advisor', passwordHash, active: true },
    { firmId: firm.id, name: 'Jack Mensah', email: 'jack@juno.tax', role: 'company_agent', passwordHash, active: true },
    { firmId: firm.id, name: 'Karen Adeyemi', email: 'karen@juno.tax', role: 'company_agent', passwordHash, active: true },
  ]).returning()

  console.log(`Created ${seedUsers.length} users (all passwords: password123)`)
  if (seedUsers.length === 0) { console.error('No users created — skipping the rest'); return }

  const admin = seedUsers[0]!
  const preparers = seedUsers.filter(u => u.role === 'preparer')
  const reviewers = seedUsers.filter(u => u.role === 'reviewer')
  const companyAgents = seedUsers.filter(u => u.role === 'company_agent')

  // ── Companies (client organizations the firm manages) ──────────
  const companyData = [
    { name: 'Northbridge Logistics LLC', industry: 'Transportation & Logistics', contactName: 'Maria Gonzalez', contactEmail: 'maria@northbridgelogistics.com', contactPhone: '(212) 555-0201' },
    { name: 'Halcyon Dental Group', industry: 'Healthcare', contactName: 'Dr. Steven Park', contactEmail: 'steven@halcyondental.com', contactPhone: '(212) 555-0202' },
    { name: 'Redwood Property Partners', industry: 'Real Estate', contactName: 'Tom Bradley', contactEmail: 'tom@redwoodpp.com', contactPhone: '(917) 555-0203' },
    { name: 'Bright Path Consulting', industry: 'Professional Services', contactName: 'Linda Chow', contactEmail: 'linda@brightpathco.com', contactPhone: '(646) 555-0204' },
    { name: 'Union Square Bistro Group', industry: 'Food & Beverage', contactName: 'Antonio Ruiz', contactEmail: 'antonio@unionsquarebistro.com', contactPhone: '(212) 555-0205' },
  ]

  const seedCompanies = await db.insert(companies).values(
    companyData.map(c => ({ ...c, firmId: firm.id, createdById: admin.id }))
  ).returning()

  console.log(`Created ${seedCompanies.length} companies`)

  // Assign the two company_agent users across the five companies so the
  // "scoped to assigned companies only" access path has real coverage.
  if (companyAgents.length > 0 && seedCompanies.length > 0) {
    const assignmentRows = seedCompanies.map((company, i) => ({
      companyId: company.id,
      userId: companyAgents[i % companyAgents.length]!.id,
      assignedById: admin.id,
    }))
    const seedAssignments = await db.insert(companyAssignments).values(assignmentRows).returning()
    console.log(`Created ${seedAssignments.length} company staff assignments`)
  }

  const clientData = [
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '(212) 555-0101', address: '350 Fifth Ave, New York, NY 10118' },
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '(212) 555-0102', address: '123 Main St, New York, NY 10002' },
    { firstName: 'Michael', lastName: 'Brown', email: 'mbrown@email.com', phone: '(917) 555-0103', address: '456 Park Ave, New York, NY 10022' },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com', phone: '(646) 555-0104', address: '789 Broadway, New York, NY 10003' },
    { firstName: 'James', lastName: 'Wilson', email: 'jwilson@email.com', phone: '(212) 555-0105', address: '321 Lex Ave, New York, NY 10016' },
    { firstName: 'Jessica', lastName: 'Taylor', email: 'jtaylor@email.com', phone: '(347) 555-0106', address: '654 Madison Ave, New York, NY 10065' },
    { firstName: 'Robert', lastName: 'Anderson', email: 'randerson@email.com', phone: '(212) 555-0107', address: '987 5th Ave, New York, NY 10075' },
    { firstName: 'Amanda', lastName: 'Thomas', email: 'athomas@email.com', phone: '(917) 555-0108', address: '111 W 57th St, New York, NY 10019' },
    { firstName: 'David', lastName: 'Jackson', email: 'djackson@email.com', phone: '(646) 555-0109', address: '222 E 44th St, New York, NY 10017' },
    { firstName: 'Michelle', lastName: 'White', email: 'mwhite@email.com', phone: '(212) 555-0110', address: '333 W 34th St, New York, NY 10001' },
    { firstName: 'Christopher', lastName: 'Harris', email: 'charris@email.com', phone: '(212) 555-0111', address: '75 Wall St, New York, NY 10005' },
    { firstName: 'Laura', lastName: 'Martin', email: 'lmartin@email.com', phone: '(917) 555-0112', address: '200 W 79th St, New York, NY 10024' },
    { firstName: 'Daniel', lastName: 'Thompson', email: 'dthompson@email.com', phone: '(646) 555-0113', address: '15 Central Park West, New York, NY 10023' },
    { firstName: 'Nicole', lastName: 'Garcia', email: 'ngarcia@email.com', phone: '(212) 555-0114', address: '88 Greenwich St, New York, NY 10006' },
    { firstName: 'Matthew', lastName: 'Rodriguez', email: 'mrodriguez@email.com', phone: '(347) 555-0115', address: '45 Wall St, New York, NY 10005' },
    { firstName: 'Ashley', lastName: 'Lewis', email: 'alewis@email.com', phone: '(212) 555-0116', address: '250 W 57th St, New York, NY 10107' },
    { firstName: 'Kevin', lastName: 'Walker', email: 'kwalker@email.com', phone: '(917) 555-0117', address: '30 Rockefeller Plaza, New York, NY 10112' },
    { firstName: 'Stephanie', lastName: 'Hall', email: 'shall@email.com', phone: '(646) 555-0118', address: '160 5th Ave, New York, NY 10010' },
    { firstName: 'Brian', lastName: 'Allen', email: 'ballen@email.com', phone: '(212) 555-0119', address: '11 Madison Ave, New York, NY 10010' },
    { firstName: 'Rachel', lastName: 'Young', email: 'ryoung@email.com', phone: '(917) 555-0120', address: '405 Lexington Ave, New York, NY 10174' },
  ]

  const seedClients = await db.insert(clients).values(
    clientData.map((c, i) => ({
      ...c,
      firmId: firm.id,
      createdById: admin.id,
      // Real SSN encryption path (AES-256-GCM), same as production —
      // fake number, real encryption, so this exercises the actual
      // encrypt/decrypt/mask code paths end-to-end.
      ssn: encryptSSN(FAKE_SSNS[i]!),
    }))
  ).returning()

  console.log(`Created ${seedClients.length} clients (with encrypted test SSNs)`)
  if (seedClients.length === 0) { console.error('No clients created — skipping the rest'); return }

  const docTypes = ['w2', '1099', 'k1', 'brokerage', 'other'] as const
  const docStatuses = ['uploaded', 'processing', 'extracted', 'verified', 'error'] as const
  const seedDocuments = await db.insert(documents).values(
    Array.from({ length: 20 }, (_, i) => ({
      clientId: seedClients[i % seedClients.length]!.id,
      firmId: firm.id,
      uploadedById: preparers[i % preparers.length]!.id,
      filename: `doc_${i + 1}.pdf`,
      originalName: `${['W-2', '1099-INT', 'Schedule K-1', 'Brokerage Statement', 'Other'][i % 5]}_${seedClients[i % seedClients.length]!.lastName}.pdf`,
      fileSize: Math.floor(Math.random() * 5000) + 100,
      mimeType: 'application/pdf',
      documentType: docTypes[i % docTypes.length],
      status: docStatuses[i % docStatuses.length],
      pages: Math.floor(Math.random() * 10) + 1,
      // storageKey intentionally left unset — the app doesn't wire up
      // real object storage (S3/R2) yet, so this column stays empty
      // until that's implemented. Uploads are metadata-only for now.
    }))
  ).returning()

  console.log(`Created ${seedDocuments.length} documents (metadata only — file storage not wired up yet)`)

  // Only the three statuses the return workflow (draft -> in_review ->
  // completed) actually supports. Reviewer is only assigned once a
  // return has moved into or past review, matching how the UI's
  // "Submit for Review" / "Approve" actions behave.
  const formCodes = ['1040', '1120', '1120-S', '1065', '1040-SR']
  const returnPlan = [
    'draft', 'draft', 'draft', 'draft', 'draft', 'draft',
    'in_review', 'in_review', 'in_review', 'in_review', 'in_review', 'in_review', 'in_review',
    'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed',
  ] as const

  const seedReturns = await db.insert(taxReturns).values(
    returnPlan.map((status, i) => {
      const preparer = preparers[i % preparers.length]!
      const reviewer = status === 'draft' ? null : reviewers[i % reviewers.length]!.id
      return {
        clientId: seedClients[i % seedClients.length]!.id,
        firmId: firm.id,
        taxYear: 2025,
        preparerId: preparer.id,
        reviewerId: reviewer,
        status,
        notes: status === 'in_review'
          ? 'Awaiting reviewer sign-off.'
          : status === 'completed'
            ? 'Reviewed and approved — ready to deliver to client.'
            : null,
        formData: { formCode: formCodes[i % formCodes.length] },
      }
    })
  ).returning()

  console.log(`Created ${seedReturns.length} tax returns (6 draft / 7 in_review / 7 completed)`)

  // A handful of realistic audit trail entries, covering the
  // sensitive actions the audit log exists to capture.
  const seedAuditLogs = await db.insert(auditLogs).values([
    { firmId: firm.id, actorId: admin.id, action: 'firm.created', targetType: 'firm', targetId: firm.id, metadata: { name: firm.name } },
    { firmId: firm.id, actorId: admin.id, action: 'client.created', targetType: 'client', targetId: seedClients[0]!.id, metadata: { name: `${seedClients[0]!.firstName} ${seedClients[0]!.lastName}` } },
    { firmId: firm.id, actorId: preparers[0]!.id, action: 'client.ssn.viewed', targetType: 'client', targetId: seedClients[0]!.id, metadata: {}, ipAddress: '203.0.113.10' },
    { firmId: firm.id, actorId: preparers[0]!.id, action: 'document.uploaded', targetType: 'document', targetId: seedDocuments[0]!.id, metadata: { filename: seedDocuments[0]!.originalName } },
    { firmId: firm.id, actorId: preparers[0]!.id, action: 'return.created', targetType: 'tax_return', targetId: seedReturns[0]!.id, metadata: { formCode: '1040' } },
    { firmId: firm.id, actorId: preparers[1]!.id, action: 'return.status_changed', targetType: 'tax_return', targetId: seedReturns[6]!.id, metadata: { from: 'draft', to: 'in_review' } },
    { firmId: firm.id, actorId: reviewers[0]!.id, action: 'return.status_changed', targetType: 'tax_return', targetId: seedReturns[13]!.id, metadata: { from: 'in_review', to: 'completed' } },
    { firmId: firm.id, actorId: admin.id, action: 'staff.invited', targetType: 'user', targetId: seedUsers[9]!.id, metadata: { email: seedUsers[9]!.email, role: 'company_agent' } },
    { firmId: firm.id, actorId: admin.id, action: 'billing.subscription_updated', targetType: 'subscription', targetId: subscription?.id ?? null, metadata: { tier: 'professional', status: 'active' } },
    { firmId: firm.id, actorId: admin.id, action: 'client.exported', targetType: 'client', targetId: seedClients[5]!.id, metadata: { format: 'pdf' }, ipAddress: '203.0.113.10' },
    { firmId: firm.id, actorId: admin.id, action: 'company.created', targetType: 'company', targetId: seedCompanies[0]!.id, metadata: { name: seedCompanies[0]!.name } },
    { firmId: firm.id, actorId: admin.id, action: 'company.staff_assigned', targetType: 'company', targetId: seedCompanies[0]!.id, metadata: { userId: companyAgents[0]?.id } },
  ]).returning()

  console.log(`Created ${seedAuditLogs.length} audit log entries`)
  console.log('Seed complete!')
  console.log('')
  console.log('Login with any seeded user, e.g.:')
  console.log('  alice@juno.tax / password123   (admin)')
  console.log('  bob@juno.tax   / password123   (preparer)')
  console.log('  carol@juno.tax / password123   (reviewer)')
  console.log('  jack@juno.tax  / password123   (company_agent)')
}

seed().catch(console.error)
