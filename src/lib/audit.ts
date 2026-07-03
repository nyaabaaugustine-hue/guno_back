import { db } from '@/db'
import { auditLogs } from '@/db/schema'

interface LogAuditInput {
  firmId: string
  actorId: string | null
  action: string
  targetType?: string | null
  targetId?: string | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
}

export async function logAudit(input: LogAuditInput) {
  await db.insert(auditLogs).values({
    firmId: input.firmId,
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    metadata: (input.metadata as Record<string, unknown>) ?? null,
    ipAddress: input.ipAddress ?? null,
  })
}
