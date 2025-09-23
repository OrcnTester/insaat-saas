//src/lib/qty.ts
export function parseAmount(s: string): { qty: number; unit: string } {
  const m = String(s).trim().match(/^([\d.,]+)\s*(\S+)$/);
  if (!m) return { qty: 0, unit: "" };
  const qty = Number(m[1].replace(",", "."));
  const unit = m[2].toLowerCase();
  return { qty: isNaN(qty) ? 0 : qty, unit };
}
