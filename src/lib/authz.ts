import { cookies } from 'next/headers';
import { Role } from './roles';

const ROLES: Role[] = ['patron','muhasebe','depo','santiye_sefi','ofis'];
const isRole = (x: unknown): x is Role =>
  typeof x === 'string' && ROLES.includes(x as Role);

export function getRole(): Role {
  const c = cookies().get('role')?.value;
  return isRole(c) ? c : 'patron';
}

export function requireAny(allowed: Role[]) {
  const r = getRole();
  if (!allowed.includes(r)) throw new Error('forbidden');
  return r;
}
