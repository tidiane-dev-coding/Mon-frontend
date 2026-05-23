/** E-mails des délégués (alignés sur le backend). */
export const DELEGATE_EMAILS = [
  'mariama1.diallo@univ-labe.edu.gn',
  'alpharahma2018@gmail.com',
  'dep.math@univ-labe.edu.gn',
] as const;

export function normalizeEmail(email?: string): string {
  return String(email || '').trim().toLowerCase();
}

export function isDelegateEmail(email?: string): boolean {
  const e = normalizeEmail(email);
  return !!e && DELEGATE_EMAILS.map(normalizeEmail).includes(e);
}

export function canManageAnnouncements(user: {
  role?: string;
  email?: string;
  isSuperAdmin?: boolean;
} | null): boolean {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === 'Admin') return true;
  return isDelegateEmail(user.email);
}
