import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  // Fail fast and loudly instead of letting postgres.js silently fall back
  // to default connection settings (e.g. localhost), which just hangs when
  // the app is deployed somewhere without DATABASE_URL configured — this is
  // what made the sign-in button appear stuck on "Signing in...".
  throw new Error(
    'DATABASE_URL is not set. Add it to your environment variables (see .env.example).'
  )
}

const client = postgres(connectionString, {
  prepare: false,
  // Fail fast instead of hanging when the database is unreachable/misconfigured.
  connect_timeout: 10,
  idle_timeout: 20,
  // Serverless functions get their own process per invocation; keep the pool small.
  max: 1,
})
export const db = drizzle(client, { schema })
export type Db = typeof db
