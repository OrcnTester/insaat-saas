"use client";
import { useEffect, useState } from 'react';
import type { Role } from '@/lib/roles';

export default function ClientCan({
  anyOf, children,
}: { anyOf: Role[]; children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('patron');
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )role=([^;]+)/);
    if (m) setRole(decodeURIComponent(m[1]) as Role);
  }, []);
  return anyOf.includes(role) ? <>{children}</> : null;
}
