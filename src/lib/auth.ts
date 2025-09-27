// src/lib/auth.ts
import type { Role } from "./roles";

export function getRoleFromRequest(req: Request): Role {
  // 1) URL'den ?role=… (öncelik)
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("role") as Role | null;
    if (q) return q;
  } catch {}

  // 2) Cookie'den role=
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)role=([^;]+)/);
  if (m) return decodeURIComponent(m[1]) as Role;

  // 3) Default
  return "patron";
}
