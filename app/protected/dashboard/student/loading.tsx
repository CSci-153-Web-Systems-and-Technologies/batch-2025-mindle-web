// file: app/(protected)/dashboard/student/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StudentDashboardLoading() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-80 bg-white/10 mb-2" />
          <Skeleton className="h-5 w-96 bg-white/10" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20 bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-12 bg-white/10 mb-2" />
                <Skeleton className="h-3 w-24 bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid md:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48 bg-white/10" />
                <Skeleton className="h-4 w-16 bg-white/10" />
              </div>
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-4 space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 bg-white/10" />
                        <Skeleton className="h-3 w-48 bg-white/10" />
                        <Skeleton className="h-3 w-24 bg-white/10" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Study Groups Skeleton */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="h-4 w-16 bg-white/10" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <Skeleton className="h-5 w-32 bg-white/10" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-5 w-20 bg-white/10 mb-2" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}