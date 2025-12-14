// file: app/(protected)/dashboard/tutor/sessions/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function TutorSessionsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all sessions
  const { data: allSessions } = await supabase
    .from('tutoring_sessions')
    .select(`
      *,
      student:profiles!tutoring_sessions_student_id_fkey(full_name, avatar_url)
    `)
    .eq('tutor_id', user.id)
    .order('scheduled_at', { ascending: false });

  // Filter by status
  const upcomingSessions = allSessions?.filter(
    s => s.status === 'confirmed' && new Date(s.scheduled_at) > new Date()
  ) || [];
  
  const completedSessions = allSessions?.filter(
    s => s.status === 'completed'
  ) || [];
  
  const pendingSessions = allSessions?.filter(
    s => s.status === 'pending'
  ) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'confirmed':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return "border-green-500/50 text-green-400";
      case 'confirmed':
        return "border-blue-500/50 text-blue-400";
      case 'pending':
        return "border-orange-500/50 text-orange-400";
      case 'cancelled':
        return "border-red-500/50 text-red-400";
      default:
        return "border-gray-500/50 text-gray-400";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-400" />
            Sessions
          </h1>
          <p className="text-gray-400">
            Manage your tutoring sessions
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {upcomingSessions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {completedSessions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {pendingSessions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {allSessions?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-white/10">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white/10">
              Completed ({completedSessions.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/10">
              Pending ({pendingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              All ({allSessions?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Sessions */}
          <TabsContent value="upcoming" className="mt-6">
            {upcomingSessions.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming sessions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session: any) => (
                  <Card key={session.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-500/30 transition">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={session.student?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                            {session.student?.full_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {session.subject}
                              </h3>
                              <p className="text-sm text-gray-400">
                                with {session.student?.full_name || "Student"}
                              </p>
                            </div>
                            <Badge variant="outline" className={getStatusBadgeClass(session.status)}>
                              {session.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.scheduled_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration_minutes} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Sessions */}
          <TabsContent value="completed" className="mt-6">
            {completedSessions.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No completed sessions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedSessions.map((session: any) => (
                  <Card key={session.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={session.student?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500">
                            {session.student?.full_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {session.subject}
                              </h3>
                              <p className="text-sm text-gray-400">
                                with {session.student?.full_name || "Student"}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-green-500/50 text-green-400">
                              Completed
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.scheduled_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.duration_minutes} min
                            </div>
                          </div>

                          {session.notes && (
                            <div className="bg-black/20 rounded-lg p-3">
                              <p className="text-sm text-gray-300">
                                <span className="font-medium">Notes:</span> {session.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Sessions */}
          <TabsContent value="pending" className="mt-6">
            {pendingSessions.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No pending sessions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingSessions.map((session: any) => (
                  <Card key={session.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={session.student?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-500">
                            {session.student?.full_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {session.subject}
                              </h3>
                              <p className="text-sm text-gray-400">
                                from {session.student?.full_name || "Student"}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                              Pending
                            </Badge>
                          </div>

                          {session.description && (
                            <p className="text-sm text-gray-300 mb-2">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Sessions */}
          <TabsContent value="all" className="mt-6">
            {!allSessions || allSessions.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allSessions.map((session: any) => (
                  <Card key={session.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(session.status)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-white font-semibold">
                                {session.subject}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {session.student?.full_name || "Student"}
                              </p>
                            </div>
                            <Badge variant="outline" className={getStatusBadgeClass(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(session.scheduled_at).toLocaleString()} • {session.duration_minutes} min
                          </p>
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