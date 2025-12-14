// file: app/protected/page.tsx

// This page is now just a placeholder. 
// The Middleware handles the redirect to /student or /tutor before this loads.
export default function ProtectedRootPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground animate-pulse">Redirecting...</p>
    </div>
  );
}