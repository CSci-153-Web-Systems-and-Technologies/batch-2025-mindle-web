import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, Calendar, Star, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function TutorDashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch tutor profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 1. Fetch Total Connected Students (Active Students)
  // We now check the requests table for 'accepted' status
  const { count: studentsCount } = await supabase
    .from('tutor_student_requests')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', user.id)
    .eq('status', 'accepted');

  // 2. Fetch upcoming sessions (Remains the same)
  const { data: upcomingSessions } = await supabase
    .from('tutoring_sessions')
    .select(`
      id,
      subject,
      scheduled_at,
      duration_minutes,
      status,
      student:profiles!tutoring_sessions_student_id_fkey(full_name, avatar_url)
    `)
    .eq('tutor_id', user.id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5);

  // 3. Fetch recent messages (Remains the same)
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      sender_id,
      content,
      created_at,
      is_read,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. Fetch Pending Requests (FIXED: Uses new table)
  const { data: rawRequests } = await supabase
    .from('tutor_student_requests')
    .select('*')
    .eq('tutor_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3);

  // Manually fetch profiles for these requests to avoid FK issues
  const studentIds = rawRequests?.map(r => r.student_id) || [];
  const { data: requestProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', studentIds);

  const profileMap = new Map(requestProfiles?.map(p => [p.id, p]));

  const pendingRequests = rawRequests?.map(r => ({
    ...r,
    student: profileMap.get(r.student_id)
  }));

  // Count unread notifications
  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  // Count total completed sessions
  const { count: completedSessions } = await supabase
    .from('tutoring_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', user.id)
    .eq('status', 'completed');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name || "Tutor"}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your students today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Total Students
                <Users className="w-5 h-5 text-blue-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {studentsCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active learners</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Sessions
                <Calendar className="w-5 h-5 text-green-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {completedSessions || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Rating
                <Star className="w-5 h-5 text-yellow-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {profile?.average_rating?.toFixed(1) || "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Average rating</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Notifications
                <Bell className="w-5 h-5 text-red-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {unreadNotifications || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Unread</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Pending Requests
              </h2>
              <Link
                href="/protected/dashboard/tutor/students"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View All
              </Link>
            </div>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                {pendingRequests && pendingRequests.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {pendingRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className="p-4 hover:bg-white/5 transition"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={request.student?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                              {request.student?.full_name?.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-white">
                                {request.student?.full_name || "Student"}
                              </p>
                              <Badge
                                variant="outline"
                                className="border-orange-500/50 text-orange-400"
                              >
                                Pending
                              </Badge>
                            </div>
                            {request.message && (
                                <p className="text-sm text-gray-400 line-clamp-1 italic">
                                "{request.message}"
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No pending requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Upcoming Sessions
              </h2>
              <Link
                href="/protected/dashboard/tutor/sessions"
                className="text-sm text-green-400 hover:text-green-300"
              >
                View All
              </Link>
            </div>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                {upcomingSessions && upcomingSessions.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {upcomingSessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="p-4 hover:bg-white/5 transition"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={session.student?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500">
                              {session.student?.full_name?.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-white">
                                {session.subject}
                              </p>
                              <Badge
                                variant="outline"
                                className="border-green-500/50 text-green-400"
                              >
                                {session.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              with {session.student?.full_name || "Student"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(session.scheduled_at).toLocaleString()} • {session.duration_minutes} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Recent Messages
            </h2>
            <Link
              href="/protected/dashboard/tutor/messages"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              View All
            </Link>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-0">
              {messages && messages.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className="p-4 hover:bg-white/5 transition"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={msg.sender?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                            {msg.sender?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-white truncate">
                              {msg.sender?.full_name || "Unknown"}
                            </p>
                            {!msg.is_read && (
                              <Badge
                                variant="outline"
                                className="border-blue-500/50 text-blue-400 text-xs"
                              >
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {msg.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}