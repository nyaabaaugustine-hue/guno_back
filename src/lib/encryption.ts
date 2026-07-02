import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
/**
 * Derive a 32-byte key from the SSN_ENCRYPTION_KEY env var.
 * Uses SHA-256 hashing to ensure the key is exactly 32 bytes.
 */
function getKey(): Buffer {
  const secret = process.env.SSN_ENCRYPTION_KEY
  if (!secret) {
    throw new Error(
      'SSN_ENCRYPTION_KEY environment variable is required for SSN encryption'
    )
  }
  return crypto.createHash('sha256').update(secret).digest()
}

/**
 * Encrypt a plaintext SSN string.
 * Returns a colon-delimited string: iv:authTag:ciphertext (all hex-encoded).
 */
export function encryptSSN(ssn: string): string {
  if (!ssn) return ''

  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(ssn, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')

  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Decrypt an encrypted SSN string.
 * Expects the format: iv:authTag:ciphertext (all hex-encoded).
 */
export function decryptSSN(encrypted: string): string {
  if (!encrypted) return ''

  const parts = encrypted.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted SSN format')
  }

  const [ivHex, authTagHex, ciphertext] = parts
  if (!ivHex || !authTagHex || !ciphertext) {
    throw new Error('Invalid encrypted SSN format')
  }

  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Mask an SSN for display purposes, showing only the last 4 digits.
 * Works with both plaintext and already-encrypted SSNs.
 */
export function maskSSN(ssn: string): string {
  if (!ssn) return ''

  // If encrypted format (contains colons and hex chars), attempt to decrypt first
  if (ssn.includes(':') && /^[0-9a-f:]+$/i.test(ssn)) {
    try {
      ssn = decryptSSN(ssn)
    } catch {
      return '••• Encrypted'
    }
  }

  // Strip non-numeric characters
  const digits = ssn.replace(/\D/g, '')
  if (digits.length < 4) return '••••'

  return `•••-••-${digits.slice(-4)}`
}
