import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db } from '@/db'
import { clients, users, taxReturns, documents, firms } from '@/db/schema'
import { eq, and, gte, lte, count, sql, desc, ilike, or } from 'drizzle-orm'
import { queryCache, checkRateLimit, withQueryTimeout } from '@/lib/db-cache'
import { classifyQuery, generateResponse, isGroqAvailable } from '@/lib/ai/groq'
import { z } from 'zod'

// ─── Intent definitions ─────────────────────────────────────────
// Each intent has a label, description, and a DB executor function
interface QueryIntent {
  label: string
  description: string
  execute: (firmId: string) => Promise<{ result: any; sql: string }>
}

// All intents keyed by label for quick lookup
const intents: Record<string, QueryIntent> = {
  client_count: {
    label: 'client_count',
    description: 'Total number of clients',
    execute: async (firmId) => {
      const sqlStr = `SELECT COUNT(*) FROM clients WHERE firm_id = $1`
      const [result] = await withQueryTimeout(
        db.select({ value: count() }).from(clients).where(eq(clients.firmId, firmId))
      )
      return { result: { count: result?.value ?? 0 }, sql: sqlStr }
    },
  },
  return_count: {
    label: 'return_count',
    description: 'Total number of tax returns',
    execute: async (firmId) => {
      const [result] = await withQueryTimeout(
        db.select({ value: count() }).from(taxReturns).where(eq(taxReturns.firmId, firmId))
      )
      return {
        result: { count: result?.value ?? 0 },
        sql: `SELECT COUNT(*) FROM tax_returns WHERE firm_id = $1`,
      }
    },
  },
  completed_returns: {
    label: 'completed_returns',
    description: 'Count of completed returns',
    execute: async (firmId) => {
      const results = await withQueryTimeout(
        db
          .select({ count: count() })
          .from(taxReturns)
          .where(and(eq(taxReturns.firmId, firmId), eq(taxReturns.status, 'completed')))
      )
      return {
        result: { count: results[0]?.count ?? 0, status: 'completed' },
        sql: `SELECT COUNT(*) FROM tax_returns WHERE firm_id = $1 AND status = 'completed'`,
      }
    },
  },
  in_review_returns: {
    label: 'in_review_returns',
    description: 'Returns currently in review',
    execute: async (firmId) => {
      const results = await withQueryTimeout(
        db
          .select({ count: count() })
          .from(taxReturns)
          .where(and(eq(taxReturns.firmId, firmId), eq(taxReturns.status, 'in_review')))
      )
      return {
        result: { count: results[0]?.count ?? 0, status: 'in review' },
        sql: `SELECT COUNT(*) FROM tax_returns WHERE firm_id = $1 AND status = 'in_review'`,
      }
    },
  },
  draft_returns: {
    label: 'draft_returns',
    description: 'Returns in draft status',
    execute: async (firmId) => {
      const results = await withQueryTimeout(
        db
          .select({ count: count() })
          .from(taxReturns)
          .where(and(eq(taxReturns.firmId, firmId), eq(taxReturns.status, 'draft')))
      )
      return {
        result: { count: results[0]?.count ?? 0, status: 'draft' },
        sql: `SELECT COUNT(*) FROM tax_returns WHERE firm_id = $1 AND status = 'draft'`,
      }
    },
  },
  list_clients: {
    label: 'list_clients',
    description: 'List all clients with details',
    execute: async (firmId) => {
      const results = await withQueryTimeout(
        db
          .select({
            name: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
            email: clients.email,
            phone: clients.phone,
          })
          .from(clients)
          .where(eq(clients.firmId, firmId))
          .limit(10)
      )
      return {
        result: { clients: results, total: results.length },
        sql: `SELECT CONCAT(first_name, ' ', last_name), email, phone FROM clients WHERE firm_id = $1 LIMIT 10`,
      }
    },
  },
  document_count: {
    label: 'document_count',
    description: 'Total documents uploaded',
    execute: async (firmId) => {
      const [result] = await withQueryTimeout(
        db.select({ value: count() }).from(documents).where(eq(documents.firmId, firmId))
      )
      return {
        result: { count: result?.value ?? 0 },
        sql: `SELECT COUNT(*) FROM documents WHERE firm_id = $1`,
      }
    },
  },
  user_count: {
    label: 'user_count',
    description: 'Team members list',
    execute: async (firmId) => {
      const results = await withQueryTimeout(
        db
          .select({
            name: users.name,
            email: users.email,
            role: users.role,
          })
          .from(users)
          .where(eq(users.firmId!, firmId as any))
          .limit(10)
      )
      return {
        result: { users: results, count: results.length },
        sql: `SELECT name, email, role FROM users WHERE firm_id = $1 LIMIT 10`,
      }
    },
  },
  returns_by_year: {
    label: 'returns_by_year',
    description: 'Returns grouped by tax year',
    execute: async (firmId) => {
      const results = await withQueryTimeout(
        db
          .select({
            year: taxReturns.taxYear,
            count: count(),
          })
          .from(taxReturns)
          .where(eq(taxReturns.firmId, firmId))
          .groupBy(taxReturns.taxYear)
          .orderBy(desc(taxReturns.taxYear))
          .limit(5)
      )
      return {
        result: { byYear: results },
        sql: `SELECT tax_year, COUNT(*) FROM tax_returns WHERE firm_id = $1 GROUP BY tax_year ORDER BY tax_year DESC LIMIT 5`,
      }
    },
  },
  full_summary: {
    label: 'full_summary',
    description: 'Full practice summary with all metrics',
    execute: async (firmId) => {
      const [clientCount] = await withQueryTimeout(
        db.select({ count: count() }).from(clients).where(eq(clients.firmId, firmId))
      )
      const [returnCount] = await withQueryTimeout(
        db.select({ count: count() }).from(taxReturns).where(eq(taxReturns.firmId, firmId))
      )
      const returnBreakdown = await withQueryTimeout(
        db
          .select({
            status: taxReturns.status,
            count: count(),
          })
          .from(taxReturns)
          .where(eq(taxReturns.firmId, firmId))
          .groupBy(taxReturns.status)
      )
      return {
        result: {
          clients: clientCount?.count ?? 0,
          totalReturns: returnCount?.count ?? 0,
          returnsByStatus: returnBreakdown.map((r) => ({
            status: r.status,
            count: r.count,
          })),
        },
        sql: 'Multiple queries: clients count, returns count, returns by status',
      }
    },
  },
  help: {
    label: 'help',
    description: 'Help and example queries',
    execute: async () => ({
      result: {
        help: true,
        examples: [
          'How many clients do I have?',
          'Show me all clients',
          'How many returns are completed?',
          'Returns in review',
          'Draft returns count',
          'List team members',
          'Document upload summary',
          'Returns by tax year',
          'Give me a full summary',
        ],
      },
      sql: 'N/A — help response',
    }),
  },
}

// ─── Query request schema ───────────────────────────────────────
const querySchema = z.object({
  query: z.string().min(1, 'Query is required').max(500, 'Query too long'),
})

// ─── Cache key builder ──────────────────────────────────────────
function cacheKey(userId: string, query: string): string {
  return `ai:${userId}:${query.toLowerCase().replace(/\s+/g, '_').slice(0, 100)}`
}

// ─── API Handler ────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { id: string; firmId?: string | null } }
  const firmId = s.user.firmId || 'demo-firm-1'

  // Rate limit: 20 queries per minute per user
  const rateCheck = checkRateLimit(`ai:${s.user.id}`, 20, 60)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Try again in ${rateCheck.resetIn} seconds.`,
      },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = querySchema.parse(body)
    const cacheKeyStr = cacheKey(s.user.id, parsed.query)

    // Check cache first
    const cached = queryCache.get(cacheKeyStr)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    // Classify query intent via Groq (with fallback to keyword matching)
    const groqAvailable = isGroqAvailable()
    let intentLabel = 'unknown'

    if (groqAvailable) {
      const classification = await classifyQuery(parsed.query)
      intentLabel = classification.intent
    } else {
      // Fallback: use keyword matching when no Groq API key
      const fallbackPatterns: [RegExp, string][] = [
        [/how many client|client count|number of client|total client/i, 'client_count'],
        [/how many return|return count|total return|number of return/i, 'return_count'],
        [/completed return|finished return/i, 'completed_returns'],
        [/in review|pending review|awaiting review/i, 'in_review_returns'],
        [/draft return|unfinished return/i, 'draft_returns'],
        [/list client|show client|all client|client list|find client/i, 'list_clients'],
        [/uploaded doc|document upload|how many doc|total doc|document count/i, 'document_count'],
        [/team.*member|how many (?:user|person|team)|list user|member count|show user/i, 'user_count'],
        [/tax year|\d{4}.*return|return.*\d{4}/i, 'returns_by_year'],
        [/summary|overview|dashboard|what.*up|how.*thing|status/i, 'full_summary'],
        [/help|what can|what question|example|capabilities/i, 'help'],
      ]
      for (const [pattern, label] of fallbackPatterns) {
        if (pattern.test(parsed.query)) {
          intentLabel = label
          break
        }
      }
    }

    if (!intentLabel || intentLabel === 'unknown' || !intents[intentLabel]) {
      // No Groq → fallback to static "I don't know" response
      return NextResponse.json({
        response:
          `I'm not sure how to answer that. Try asking about:\n\n` +
          `• Client counts and lists\n` +
          `• Return statuses (completed, in review, drafts)\n` +
          `• Team members\n` +
          `• Document uploads\n` +
          `• Full practice summary\n\n` +
          `Or type "help" for examples.`,
        type: 'text',
      })
    }

    // Execute query with timeout protection
    const matchedIntent = intents[intentLabel]!
    const { result, sql: generatedSql } = await matchedIntent.execute(firmId)

    // Generate response — use Groq for natural language when available
    let response: string
    let type: string = 'text'

    if (groqAvailable) {
      response = await generateResponse(parsed.query, result, intentLabel, generatedSql)
    } else {
      // Fallback: template-based response generation
      if (matchedIntent.label === 'help') {
        response =
          'Here are some questions I can answer:\n\n' +
          result.examples.map((ex: string) => `• ${ex}`).join('\n')
      } else if (matchedIntent.label === 'full_summary') {
        const breakdown = result.returnsByStatus
          .map((r: any) => `  • ${r.status}: ${r.count}`)
          .join('\n')
        response =
          `📊 **Practice Summary**\n\n` +
          `• **Clients:** ${result.clients}\n` +
          `• **Total Returns:** ${result.totalReturns}\n` +
          `• **Returns by Status:**\n${breakdown}`
        type = 'summary'
      } else if (matchedIntent.label === 'list_clients') {
        if (result.clients.length === 0) {
          response = 'No clients found in the database.'
        } else {
          response =
            `**${result.total} Client(s):**\n\n` +
            result.clients
              .map(
                (c: any, i: number) =>
                  `${i + 1}. **${c.name}** — ${c.email || 'no email'}${c.phone ? ' · ' + c.phone : ''}`
              )
              .join('\n')
        }
      } else if (matchedIntent.label === 'user_count') {
        if (result.users.length === 0) {
          response = 'No team members found.'
        } else {
          response =
            `**${result.count} Team Member(s):**\n\n` +
            result.users
              .map(
                (u: any, i: number) =>
                  `${i + 1}. **${u.name}** — ${u.role} (${u.email})`
              )
              .join('\n')
        }
      } else if (matchedIntent.label === 'returns_by_year') {
        response =
          `**Returns by Tax Year:**\n\n` +
          result.byYear
            .map((r: any) => `  • ${r.year}: ${r.count} return(s)`)
            .join('\n')
      } else if ('count' in result && 'status' in result) {
        response = `**${result.count}** return(s) with status **${result.status}**.`
      } else if ('count' in result) {
        const label = matchedIntent.description
        response = `**${result.count}** ${label.toLowerCase()}.`
      } else {
        response = JSON.stringify(result, null, 2)
      }
    }

    const payload = { response, type, sql: generatedSql, cached: false }

    // Cache the result (5 min TTL for data, 30 min for help)
    const ttl = matchedIntent.label === 'help' ? 1800 : 300
    queryCache.set(cacheKeyStr, { response, type, sql: generatedSql }, ttl)

    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Query failed'
    return NextResponse.json({
      response: `Sorry, I encountered an error: ${msg}. Please try a simpler question.`,
      type: 'text',
    })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    cache: queryCache.getStats(),
    endpoints: ['POST /api/ai/query — natural language database queries'],
  })
}
