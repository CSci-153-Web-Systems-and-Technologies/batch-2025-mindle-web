// file: app/(protected)/dashboard/student/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, BookOpen, Calendar, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch recent messages (last 5)
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

  // Fetch upcoming sessions
  const { data: upcomingSessions } = await supabase
    .from('tutoring_sessions')
    .select(`
      id,
      subject,
      scheduled_at,
      duration_minutes,
      status,
      tutor:profiles!tutoring_sessions_tutor_id_fkey(full_name, avatar_url)
    `)
    .eq('student_id', user.id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(3);

  // Fetch joined study groups
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select(`
      study_groups(id, name, subject, members_count)
    `)
    .eq('member_id', user.id)
    .eq('status', 'active')
    .limit(5);

  const groups = groupMembers?.map((gm: any) => gm.study_groups).filter(Boolean) || [];

  // Count unread notifications
  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  // Count total sessions
  const { count: totalSessions } = await supabase
    .from('tutoring_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('status', 'completed');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name || "Student"}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your learning journey today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Messages
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {messages?.filter(m => !m.is_read).length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Unread messages</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Study Groups
                <Users className="w-5 h-5 text-purple-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{groups.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active groups</p>
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
                {totalSessions || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
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
          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Upcoming Sessions
              </h2>
              <Link
                href="/protected/dashboard/student/tutors"
                className="text-sm text-blue-400 hover:text-blue-300"
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
                            <AvatarImage src={session.tutor?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                              {session.tutor?.full_name?.charAt(0) || "T"}
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
                              with {session.tutor?.full_name || "Tutor"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(session.scheduled_at).toLocaleString()} •{" "}
                              {session.duration_minutes} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No upcoming sessions</p>
                    <Link
                      href="/protected/dashboard/student/tutors"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Find a tutor
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Recent Messages
              </h2>
              <Link
                href="/protected/dashboard/student/messages"
                className="text-sm text-blue-400 hover:text-blue-300"
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
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
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

        {/* Study Groups */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Your Study Groups
            </h2>
            <Link
              href="/protected/dashboard/student/study-groups"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              View All
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {groups.length > 0 ? (
              groups.map((group: any) => (
                <Link
                  key={group.id}
                  href={`/protected/dashboard/student/study-groups/${group.id}`}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/50 transition h-full">
                    <CardHeader>
                      <CardTitle className="text-white text-base">
                        {group.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 mb-2"
                      >
                        {group.subject}
                      </Badge>
                      <p className="text-sm text-gray-400">
                        {group.members_count} members
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 col-span-3">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">
                    You haven't joined any study groups yet
                  </p>
                  <Link
                    href="/protected/dashboard/student/study-groups"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Browse Study Groups
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}