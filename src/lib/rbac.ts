/**
 * Role-based access control helpers.
 *
 * Roles in the system:
 *  - admin        : super-admin, full access across the platform
 *  - firm_admin   : admin scoped to their own firm (manage staff, companies, clients, returns)
 *  - preparer     : prepares returns, no staff/company management
 *  - reviewer     : reviews returns, no staff/company management
 *  - advisor      : tax planning / advisory scenarios, no staff/company management
 *  - company_agent: scoped to only the companies they've been explicitly assigned to
 */

export type Role = 'admin' | 'firm_admin' | 'preparer' | 'reviewer' | 'advisor' | 'company_agent'

// Roles that can manage the firm's staff and company roster.
const STAFF_MANAGER_ROLES: Role[] = ['admin', 'firm_admin']

// Roles that are not restricted to a subset of companies.
const FULL_ACCESS_ROLES: Role[] = ['admin', 'firm_admin', 'preparer', 'reviewer', 'advisor']

export function normalizeRole(role: string | null | undefined): Role {
  const r = (role || '').toLowerCase().trim()
  if (r === 'org admin' || r === 'admin') return 'admin'
  if (r === 'firm admin' || r === 'firm_admin') return 'firm_admin'
  if (r === 'preparer') return 'preparer'
  if (r === 'reviewer') return 'reviewer'
  if (r === 'advisor') return 'advisor'
  if (r === 'company agent' || r === 'company_agent') return 'company_agent'
  return 'preparer'
}

export function canManageStaff(role: string | null | undefined): boolean {
  return STAFF_MANAGER_ROLES.includes(normalizeRole(role))
}

export function canManageCompanies(role: string | null | undefined): boolean {
  return STAFF_MANAGER_ROLES.includes(normalizeRole(role))
}

/** True if this role sees every company in the firm rather than an assigned subset. */
export function hasFullCompanyAccess(role: string | null | undefined): boolean {
  return FULL_ACCESS_ROLES.includes(normalizeRole(role))
}

export function isCompanyAgent(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'company_agent'
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  firm_admin: 'Firm Admin',
  preparer: 'Preparer',
  reviewer: 'Reviewer',
  advisor: 'Advisor',
  company_agent: 'Company Agent',
}

export function roleLabel(role: string | null | undefined): string {
  return ROLE_LABELS[normalizeRole(role)]
}
