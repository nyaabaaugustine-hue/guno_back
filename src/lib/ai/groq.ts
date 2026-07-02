import Groq from 'groq-sdk'

// Default model - fast and capable for classification + generation
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

// Lazy-loaded Groq client (created only when needed)
let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    })
  }
  return groqClient
}

// ─── System Prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AI assistant for a tax practice management platform called Juno Tax. Your role is to help tax professionals understand their data by answering questions about their clients, tax returns, documents, and team members.

You have access to a database with the following tables:
- clients: client records (first_name, last_name, email, phone)
- tax_returns: tax return records (status: draft|in_review|completed, tax_year, preparer_id, reviewer_id)
- documents: uploaded documents (status: uploaded|processing|extracted|verified|error, document_type: w2|1099|k1|brokerage|other)
- users: team members (name, email, role: admin|firm_admin|preparer|reviewer|advisor)

Your goal is to understand the user's natural language query and classify it into one of these intent categories, then help format the response.

Available intents:
1. "client_count" - Total number of clients
2. "return_count" - Total number of tax returns
3. "completed_returns" - Count of completed returns
4. "in_review_returns" - Returns currently in review
5. "draft_returns" - Returns in draft status
6. "list_clients" - List clients with details
7. "document_count" - Total documents uploaded
8. "user_count" - Team members list
9. "returns_by_year" - Returns grouped by tax year
10. "full_summary" - Full practice summary with all metrics
11. "help" - Help and example queries

If the query doesn't match any intent, classify as "unknown". Be lenient with interpretation - typos, abbreviations, and casual phrasing are fine.

Respond in JSON format only:
{
  "intent": "intent_name_or_unknown",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`

// ─── Intent Classification ──────────────────────────────────────
export interface IntentResult {
  intent: string
  confidence: number
  reasoning: string
}

export async function classifyQuery(
  userQuery: string
): Promise<IntentResult> {
  if (!process.env.GROQ_API_KEY) {
    // Fallback: basic keyword matching when no API key
    return fallbackClassify(userQuery)
  }

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Classify this query: "${userQuery}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(content)

    return {
      intent: parsed.intent || 'unknown',
      confidence: parsed.confidence || 0,
      reasoning: parsed.reasoning || '',
    }
  } catch (error) {
    // Fallback on Groq failure
    console.error('Groq classification failed:', error)
    return fallbackClassify(userQuery)
  }
}

// ─── Response Generation ────────────────────────────────────────
export async function generateResponse(
  query: string,
  data: any,
  intent: string,
  sql: string
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return generateFallbackResponse(data, intent)
  }

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful tax practice assistant. Given query results from the database, format a natural, conversational response for the user. Keep responses concise but informative. Use markdown for formatting. Never mention raw table names or SQL unless asked.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            query,
            intent,
            data,
            sql,
          }),
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || generateFallbackResponse(data, intent)
  } catch (error) {
    console.error('Groq response generation failed:', error)
    return generateFallbackResponse(data, intent)
  }
}

// ─── Fallback Classifier ────────────────────────────────────────
function fallbackClassify(query: string): IntentResult {
  const patterns: [RegExp, string][] = [
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

  for (const [pattern, intent] of patterns) {
    if (pattern.test(query)) {
      return { intent, confidence: 0.7, reasoning: 'Fallback keyword match' }
    }
  }

  return { intent: 'unknown', confidence: 0, reasoning: 'No pattern matched' }
}

// ─── Fallback Response Generator ────────────────────────────────
function generateFallbackResponse(data: any, intent: string): string {
  if (intent === 'help') {
    return (
      'Here are some questions I can answer:\n\n' +
      [
        'How many clients do I have?',
        'Show me all clients',
        'How many returns are completed?',
        'Returns in review',
        'Draft returns count',
        'List team members',
        'Document upload summary',
        'Returns by tax year',
        'Give me a full summary',
      ]
        .map((ex) => `• ${ex}`)
        .join('\n')
    )
  }

  if (intent === 'full_summary') {
    const breakdown = (data.returnsByStatus || [])
      .map((r: any) => `  • ${r.status}: ${r.count}`)
      .join('\n')
    return (
      `📊 **Practice Summary**\n\n` +
      `• **Clients:** ${data.clients || 0}\n` +
      `• **Total Returns:** ${data.totalReturns || 0}\n` +
      `• **Returns by Status:**\n${breakdown}`
    )
  }

  if (intent === 'list_clients' && data.clients) {
    if (data.clients.length === 0) return 'No clients found in the database.'
    return (
      `**${data.total} Client(s):**\n\n` +
      data.clients
        .map(
          (c: any, i: number) =>
            `${i + 1}. **${c.name}** — ${c.email || 'no email'}${c.phone ? ' · ' + c.phone : ''}`
        )
        .join('\n')
    )
  }

  if (intent === 'user_count' && data.users) {
    if (data.users.length === 0) return 'No team members found.'
    return (
      `**${data.count} Team Member(s):**\n\n` +
      data.users
        .map((u: any, i: number) => `${i + 1}. **${u.name}** — ${u.role} (${u.email})`)
        .join('\n')
    )
  }

  if (intent === 'returns_by_year' && data.byYear) {
    return (
      `**Returns by Tax Year:**\n\n` +
      data.byYear.map((r: any) => `  • ${r.year}: ${r.count} return(s)`).join('\n')
    )
  }

  if ('count' in data && 'status' in data) {
    return `**${data.count}** return(s) with status **${data.status}**.`
  }

  if ('count' in data) {
    const label = intent.replace(/_/g, ' ')
    return `**${data.count}** ${label}.`
  }

  return JSON.stringify(data, null, 2)
}

// ─── Check if Groq is available ─────────────────────────────────
export function isGroqAvailable(): boolean {
  return !!process.env.GROQ_API_KEY
}
