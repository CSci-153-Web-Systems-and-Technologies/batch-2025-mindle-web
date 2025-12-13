import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TrendingUp, Calendar, BookOpen, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProgressPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch completed sessions count
  const { count: completedSessions } = await supabase
    .from('tutoring_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('status', 'completed');

  // Fetch total study hours (estimated)
  const { data: sessions } = await supabase
    .from('tutoring_sessions')
    .select('duration_minutes')
    .eq('student_id', user.id)
    .eq('status', 'completed');

  const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
  const totalHours = Math.round(totalMinutes / 60);

  // Fetch subjects studied
  const { data: sessionSubjects } = await supabase
    .from('tutoring_sessions')
    .select('subject')
    .eq('student_id', user.id)
    .eq('status', 'completed');

  const uniqueSubjects = [...new Set(sessionSubjects?.map(s => s.subject))];

  // Fetch groups joined count
  const { count: groupsCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', user.id)
    .eq('status', 'active');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            Your Progress
          </h1>
          <p className="text-gray-400">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Sessions Completed
                <Calendar className="w-5 h-5 text-green-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {completedSessions || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Study Hours
                <BookOpen className="w-5 h-5 text-blue-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {totalHours}
              </div>
              <p className="text-xs text-gray-500 mt-1">Hours learned</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Subjects
                <Star className="w-5 h-5 text-yellow-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {uniqueSubjects.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Topics explored</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                Study Groups
                <Award className="w-5 h-5 text-purple-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {groupsCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active memberships</p>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Breakdown */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Subjects You're Learning</h2>
          
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              {uniqueSubjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {uniqueSubjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 px-4 py-2 text-sm"
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  No subjects yet. Start learning to see your progress!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section (Placeholder) */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
          
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Coming Soon!</p>
              <p className="text-gray-600 text-sm">
                Earn badges and certificates as you progress through your learning journey
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}