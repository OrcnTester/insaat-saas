// src/components/FeatureGate.tsx
export default function FeatureGate({ when, children, fallback=null }:{
  when: boolean; children: React.ReactNode; fallback?: React.ReactNode;
}) {
  return when ? <>{children}</> : <>{fallback}</>;
}
