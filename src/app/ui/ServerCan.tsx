// src/app/ui/ServerCan.tsx
import React from 'react';
import type { Role } from '@/lib/roles';

export default function ServerCan({
  role,
  anyOf,
  children,
}: {
  role: Role;
  anyOf: Role[];
  children: React.ReactNode;
}) {
  if (!anyOf.includes(role)) return null;
  return <>{children}</>;
}
