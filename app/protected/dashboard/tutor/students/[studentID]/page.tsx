// file: app/(protected)/dashboard/tutor/students/[studentID]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Star,
  BookOpen,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PageProps {
  params: Promise<{ studentID: string }>;
}

export default async function StudentProgressPage({ params }: PageProps) {
  const { studentID } = await params;
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch student profile
  const { data: student, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentID)
    .single();

  if (error || !student) {
    return notFound();
  }

  // Fetch session history with this student
  const { data: sessions } = await supabase
    .from('tutoring_sessions')
    .select('*')
    .eq('tutor_id', user.id)
    .eq('student_id', studentID)
    .order('scheduled_at', { ascending: false });

  // Calculate stats
  const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
  const totalHours = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const subjects = [...new Set(sessions?.map(s => s.subject))];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/protected/dashboard/tutor/students"
          className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Student Info & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Profile Card */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={student.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-3xl">
                      {student.full_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {student.full_name || "Anonymous Student"}
                    </h1>
                    <p className="text-gray-400 mb-4">
                      {student.email || "No email"}
                    </p>
                    {student.bio && (
                      <p className="text-gray-300 text-sm">
                        {student.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Sessions
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
                    Study Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {totalHours.toFixed(1)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {subjects.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subjects Studied */}
            {subjects.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Subjects Studied
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <Badge
                        key={subject}
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 px-4 py-2"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session History */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Session History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-lg bg-black/20 border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold">
                              {session.subject}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {new Date(session.scheduled_at).toLocaleDateString()} • {session.duration_minutes} min
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              session.status === 'completed'
                                ? "border-green-500/50 text-green-400"
                                : session.status === 'confirmed'
                                ? "border-blue-500/50 text-blue-400"
                                : "border-gray-500/50 text-gray-400"
                            }
                          >
                            {session.status}
                          </Badge>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-300 mt-2">
                            Notes: {session.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No session history
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/protected/dashboard/tutor/messages/${studentID}`}
                  className="block"
                >
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                    Send Message
                  </button>
                </Link>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                  Schedule Session
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                  Assign Task
                </button>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Attendance</span>
                      <span className="text-sm text-white font-medium">95%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Engagement</span>
                      <span className="text-sm text-white font-medium">88%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}