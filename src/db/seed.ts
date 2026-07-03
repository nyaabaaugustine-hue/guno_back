import { db } from './index'
import { firms, users, clients, documents, taxReturns } from './schema'
import { hash } from 'bcryptjs'

async function seed() {
  console.log('Seeding database...')

  const passwordHash = await hash('password123', 10)

  const [firm] = await db.insert(firms).values({
    name: 'Juno Tax Services',
    slug: 'juno-tax-services',
    phone: '(555) 123-4567',
    address: '100 Tax Lane, Suite 200, New York, NY 10001',
  }).returning()

  if (!firm) { console.error('Failed to create firm'); return }

  console.log(`Created firm: ${firm.name}`)

  const seedUsers = await db.insert(users).values([
    { firmId: firm.id, name: 'Alice Chen', email: 'alice@juno.tax', role: 'admin', passwordHash, active: true },
    { firmId: firm.id, name: 'Bob Martinez', email: 'bob@juno.tax', role: 'preparer', passwordHash, active: true },
    { firmId: firm.id, name: 'Carol Williams', email: 'carol@juno.tax', role: 'reviewer', passwordHash, active: true },
    { firmId: firm.id, name: 'David Kim', email: 'david@juno.tax', role: 'preparer', passwordHash, active: true },
    { firmId: firm.id, name: 'Eve Johnson', email: 'eve@juno.tax', role: 'reviewer', passwordHash, active: true },
    { firmId: firm.id, name: 'Frank Lee', email: 'frank@juno.tax', role: 'advisor', passwordHash, active: true },
  ]).returning()

  console.log(`Created ${seedUsers.length} users`)
  if (seedUsers.length === 0) { console.error('No users created — skipping client/doc/return seed'); return }
  const su0 = seedUsers[0]!
  const su1 = seedUsers[1]!
  const su2 = seedUsers[2]!
  const su3 = seedUsers[3]!

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
  ]

  const seedClients = await db.insert(clients).values(
    clientData.map(c => ({
      ...c,
      firmId: firm.id,
      createdById: su0.id,
    }))
  ).returning()

  console.log(`Created ${seedClients.length} clients`)
  if (seedClients.length === 0) { console.error('No clients created — skipping doc/return seed'); return }

  const docTypes = ['w2', '1099', 'k1', 'brokerage', 'other'] as const
  const docStatuses = ['uploaded', 'processing', 'extracted', 'verified', 'error'] as const
  const seedDocuments = await db.insert(documents).values(
    Array.from({ length: 10 }, (_, i) => ({
      clientId: seedClients[i % seedClients.length]!.id,
      firmId: firm.id,
      uploadedById: i % 2 === 0 ? su1.id : su2.id,
      filename: `doc_${i + 1}.pdf`,
      originalName: `${['W-2', '1099-INT', 'Schedule K-1', 'Brokerage Statement', 'Other'][i % 5]}_${seedClients[i % seedClients.length]!.lastName}.pdf`,
      fileSize: Math.floor(Math.random() * 5000) + 100,
      mimeType: 'application/pdf',
      documentType: docTypes[i % docTypes.length],
      status: docStatuses[i % docStatuses.length],
      pages: Math.floor(Math.random() * 10) + 1,
    }))
  ).returning()

  console.log(`Created ${seedDocuments.length} documents`)

  const returnStatuses = ['draft', 'in_review', 'completed', 'filed', 'amended']
  const formCodes = ['1040', '1120', '1120-S', '1065', '1040-SR']
  const seedReturns = await db.insert(taxReturns).values(
    Array.from({ length: 10 }, (_, i) => ({
      clientId: seedClients[i % seedClients.length]!.id,
      firmId: firm.id,
      taxYear: 2025,
      preparerId: i % 2 === 0 ? su1.id : su2.id,
      reviewerId: i % 2 === 0 ? su2.id : su3.id,
      status: returnStatuses[i % returnStatuses.length],
      notes: `Tax return ${i + 1} - ${formCodes[i % formCodes.length]}`,
      formData: { formCode: formCodes[i % formCodes.length], reviewed: false },
    }))
  ).returning()

  console.log(`Created ${seedReturns.length} tax returns`)
  console.log('Seed complete!')
}

seed().catch(console.error)
