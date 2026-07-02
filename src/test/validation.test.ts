import { describe, it, expect } from 'vitest'
import { registerSchema, signinSchema, createClientSchema } from '@/lib/validation'

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({ name: 'Test', email: 'a@b.com', password: '12345678', firmName: 'Acme' })
    expect(result.success).toBe(true)
  })

  it('rejects short password', () => {
    const result = registerSchema.safeParse({ name: 'Test', email: 'a@b.com', password: '123', firmName: 'Acme' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ name: 'Test', email: 'notanemail', password: '12345678', firmName: 'Acme' })
    expect(result.success).toBe(false)
  })
})

describe('createClientSchema', () => {
  it('accepts minimum required fields', () => {
    const result = createClientSchema.safeParse({ firstName: 'John', lastName: 'Doe' })
    expect(result.success).toBe(true)
  })

  it('accepts full client data', () => {
    const result = createClientSchema.safeParse({
      firstName: 'John', lastName: 'Doe', email: 'j@d.com', phone: '555-0100', ssn: '123-45-6789', address: '123 St', notes: 'Test'
    })
    expect(result.success).toBe(true)
  })
})

describe('signinSchema', () => {
  it('accepts valid signin', () => {
    const result = signinSchema.safeParse({ email: 'a@b.com', password: 'x' })
    expect(result.success).toBe(true)
  })

  it('rejects missing password', () => {
    const result = signinSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(result.success).toBe(false)
  })
})
