import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clients, taxReturns, documents, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { eq, count } from 'drizzle-orm'

const DEMO_SUMMARY = {
  stats: [
    { label: 'Total Returns', value: 147, change: '+12%', trend: 'up' },
    { label: 'Active Clients', value: 89, change: '+8%', trend: 'up' },
    { label: 'Avg. Processing Time', value: 4.2, change: '-32%', trend: 'down' },
    { label: 'Revenue (MTD)', value: 7203, change: '+18%', trend: 'up', isCurrency: true },
  ],
  returnsByStatus: [
    { label: 'Completed', value: 122, color: '#013A2F' },
    { label: 'Draft', value: 12, color: '#94A3B8' },
    { label: 'In Review', value: 8, color: '#3B82F6' },
    { label: 'Processing', value: 5, color: '#F59E0B' },
  ],
  recentReturns: [
    { client: 'Acme Corp', form: '1120', status: 'In Review', updated: '2h ago', amount: '$24,500' },
    { client: 'Bob Smith', form: '1040', status: 'Completed', updated: '5h ago', amount: '$8,200' },
    { client: 'TechStart Inc', form: '1065', status: 'Processing', updated: '1d ago', amount: '$67,800' },
    { client: 'Sarah Johnson', form: '1040', status: 'Draft', updated: '2d ago', amount: '$12,400' },
    { client: 'Global Partners', form: '1120-S', status: 'In Review', updated: '2d ago', amount: '$156,000' },
  ],
  activities: [
    { action: 'Return completed', client: 'Acme Corp', initials: 'AC', form: '1120', user: 'Jane D.', time: '2h ago', type: 'completed' },
    { action: 'Documents uploaded', client: 'Bob Smith', initials: 'BS', form: '1040', user: 'Bob S.', time: '3h ago', type: 'upload' },
    { action: 'Flagged for review', client: 'TechStart Inc', initials: 'TI', form: '1065', user: 'Mike R.', time: '5h ago', type: 'alert' },
    { action: 'New return created', client: 'Sarah Johnson', initials: 'SJ', form: '1040', user: 'Jane D.', time: '1d ago', type: 'created' },
    { action: 'Review completed', client: 'Global Partners', initials: 'GP', form: '1120-S', user: 'Jane D.', time: '1d ago', type: 'completed' },
  ],
  deadlines: [
    { task: 'Q2 Estimated Tax Payment', date: 'Jun 15, 2026', priority: 'high', daysLeft: 13 },
    { task: 'Extension Filings Due', date: 'Oct 15, 2026', priority: 'medium', daysLeft: 105 },
    { task: 'Payroll Tax Return', date: 'Jul 31, 2026', priority: 'low', daysLeft: 29 },
  ],
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const s = session as { user: { firmId?: string | null } }
    const firmId = s.user.firmId || 'demo-firm-1'

    const [clientCount] = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.firmId, firmId))

    const [returnCount] = await db
      .select({ count: count() })
      .from(taxReturns)
      .where(eq(taxReturns.firmId, firmId))

    const [docCount] = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.firmId, firmId))

    const [userCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.firmId!, firmId as any))

    return NextResponse.json({
      stats: [
        { label: 'Total Returns', value: returnCount?.count ?? 0, change: '+12%', trend: 'up' },
        { label: 'Active Clients', value: clientCount?.count ?? 0, change: '+8%', trend: 'up' },
        { label: 'Documents', value: docCount?.count ?? 0, change: '+15%', trend: 'up' },
        { label: 'Team Members', value: userCount?.count ?? 0, change: '0%', trend: 'up' },
      ],
      returnsByStatus: DEMO_SUMMARY.returnsByStatus,
      recentReturns: DEMO_SUMMARY.recentReturns,
      activities: DEMO_SUMMARY.activities,
      deadlines: DEMO_SUMMARY.deadlines,
    })
  } catch {
    // Return demo data when DB is unavailable
    return NextResponse.json(DEMO_SUMMARY)
  }
}
