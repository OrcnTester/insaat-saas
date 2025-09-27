// src/app/ui/Rbac.tsx
export type Role = "OWNER" | "ACCOUNTING" | "SITE_LEAD" | "WAREHOUSE" | "BACKOFFICE";

export const canView = {
  financeSummary: (r: Role) => r === "OWNER" || r === "ACCOUNTING",
  payments:      (r: Role) => r === "OWNER" || r === "ACCOUNTING",
  excavation:    (r: Role) => r !== "WAREHOUSE", // çoğu rol görür
  dailyWork:     (r: Role) => r === "SITE_LEAD" || r === "OWNER" || r === "BACKOFFICE",
  costItems:     (r: Role) => true,
};
