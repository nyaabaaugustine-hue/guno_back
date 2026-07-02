import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { prepare: false, max: 1 })
const db = drizzle(client)

await migrate(db, { migrationsFolder: 'migrations' })
await client.end()

console.log('Migrations complete') // eslint-disable-line no-console
