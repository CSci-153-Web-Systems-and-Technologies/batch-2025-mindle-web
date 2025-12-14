// file: app/(protected)/dashboard/tutor/students/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, UserCheck, Clock, Search, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import StudentActions from "./student-actions";

export default async function TutorStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 1. Fetch all relationship requests (Accepted & Pending)
  const { data: requests } = await supabase
    .from('tutor_student_requests')
    .select('*')
    .eq('tutor_id', user.id)
    .in('status', ['pending', 'accepted']) // We filter out 'rejected' so they disappear
    .order('created_at', { ascending: false });

  // 2. Fetch Profiles for these students
  // (We do this manually to avoid Foreign Key naming issues with the new table)
  const studentIds = requests?.map(r => r.student_id) || [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', studentIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]));

  // 3. Fetch Session Stats (for count)
  const { data: sessionStats } = await supabase
    .from('tutoring_sessions')
    .select('student_id')
    .eq('tutor_id', user.id);

  const sessionCounts = new Map();
  sessionStats?.forEach((s: any) => {
    sessionCounts.set(s.student_id, (sessionCounts.get(s.student_id) || 0) + 1);
  });

  // 4. Organize Data
  const pendingRequests = requests
    ?.filter(r => r.status === 'pending')
    .map(r => ({
      ...r,
      student: profileMap.get(r.student_id)
    }));

  let activeStudents = requests
    ?.filter(r => r.status === 'accepted')
    .map(r => ({
      ...r,
      student: profileMap.get(r.student_id)
    }));

  // Apply search filter
  if (params.search) {
    activeStudents = activeStudents?.filter((item: any) =>
      item.student?.full_name?.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            My Students
          </h1>
          <p className="text-gray-400">
            Manage your students and pending requests
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="active" className="data-[state=active]:bg-white/10">
              <UserCheck className="w-4 h-4 mr-2" />
              Active Students ({activeStudents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/10">
              <Clock className="w-4 h-4 mr-2" />
              Pending Requests ({pendingRequests?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Active Students Tab */}
          <TabsContent value="active" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
              <CardContent className="p-4">
                <form method="GET" className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    name="search"
                    placeholder="Search students by name..."
                    defaultValue={params.search}
                    className="pl-10 bg-black/20 border-white/10 text-white"
                  />
                </form>
              </CardContent>
            </Card>

            {!activeStudents || activeStudents.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No active students</p>
                  <p className="text-gray-600 text-sm">
                    Accept pending requests to see students here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeStudents.map((item: any) => (
                  <Card
                    key={item.id}
                    className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-500/50 transition"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={item.student?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-xl">
                            {item.student?.full_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-1">
                            {item.student?.full_name || "Anonymous Student"}
                          </CardTitle>
                          <Badge variant="outline" className="border-green-500/50 text-green-400">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Total Sessions</span>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                          {sessionCounts.get(item.student_id) || 0}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/protected/dashboard/tutor/students/${item.student_id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 text-sm">
                            View Progress
                          </Button>
                        </Link>
                        <Link href={`/protected/dashboard/tutor/messages/${item.student_id}`}>
                          <Button size="icon" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            💬
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="mt-6">
            {!pendingRequests || pendingRequests.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No pending requests</p>
                  <p className="text-gray-600 text-sm">
                    New student requests will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request: any) => (
                  <Card
                    key={request.id}
                    className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-orange-500/30 transition"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={request.student?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-500 text-xl">
                            {request.student?.full_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {request.student?.full_name || "Anonymous Student"}
                              </h3>
                              <p className="text-sm text-gray-400">
                                Interested in learning with you
                              </p>
                            </div>
                            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                              Pending
                            </Badge>
                          </div>

                          {request.message && (
                            <div className="bg-black/20 rounded-lg p-3 mb-4">
                              <p className="text-sm text-gray-300">
                                "{request.message}"
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Requested {new Date(request.created_at).toLocaleDateString()}
                            </span>
                            
                            {/* Inserted Component */}
                            <StudentActions 
                              requestId={request.id} 
                              studentId={request.student_id} 
                              studentName={request.student?.full_name} 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}