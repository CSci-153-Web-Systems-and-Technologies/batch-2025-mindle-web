// file: app/(protected)/layout.tsx
// Simplified layout - authentication handled by middleware
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}