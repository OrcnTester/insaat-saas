// src/lib/roles.ts
export type Role = 'patron' | 'muhasebe' | 'depo' | 'santiye_sefi' | 'ofis';
export const ROLES = ['patron','muhasebe','depo','santiye_sefi','ofis'] as const
export function isRole(x: unknown): x is Role {
  return typeof x === 'string' && (ROLES as readonly string[]).includes(x);
}
// Hangi paneli kimler görür?
export const PANELS = {
  patronDashboard: ['patron'] as Role[],
  finance:        ['patron', 'muhasebe'] as Role[],
  inventory:      ['patron', 'depo',] as Role[],
  orders:         ['patron', 'ofis',] as Role[],
  shifts:         ['patron', 'santiye_sefi'] as Role[],
  miniTasks:      ['patron', 'santiye_sefi'] as Role[],
};

export function roleFromRequest(req: Request): Role {
  // 1) query string: ?role=...
  const url = new URL(req.url);
  const qp = url.searchParams.get('role');

  // 2) cookie: role=...
  let cp: string | null = null;
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)role=([^;]+)/);
  if (m) cp = decodeURIComponent(m[1]);

  const r = (qp || cp || 'patron') as Role;
  const allowed: Role[] = ['patron','muhasebe','depo','santiye_sefi','ofis'];
  return allowed.includes(r) ? r : 'patron';
}

// API guard: allowed rollerden biri mi?
export function requireAny(req: Request, allowed: Role[]): boolean {
  const r = roleFromRequest(req);
  return allowed.includes(r);
}
