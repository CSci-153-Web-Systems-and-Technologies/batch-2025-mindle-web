import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookOpen, Star, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TutorsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch tutors the student has worked with
  const { data: sessions } = await supabase
    .from('tutoring_sessions')
    .select(`
      tutor_id,
      tutor:profiles!tutoring_sessions_tutor_id_fkey(
        id,
        full_name,
        avatar_url,
        bio,
        subjects_of_expertise,
        average_rating,
        total_sessions,
        location
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  // Get unique tutors
  const uniqueTutors = new Map();
  sessions?.forEach((session: any) => {
    if (session.tutor && !uniqueTutors.has(session.tutor.id)) {
      uniqueTutors.set(session.tutor.id, session.tutor);
    }
  });

  const myTutors = Array.from(uniqueTutors.values());

  // Fetch upcoming sessions
  const { data: upcomingSessions } = await supabase
    .from('tutoring_sessions')
    .select(`
      id,
      subject,
      scheduled_at,
      duration_minutes,
      status,
      tutor:profiles!tutoring_sessions_tutor_id_fkey(id, full_name, avatar_url)
    `)
    .eq('student_id', user.id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-400" />
            My Tutors
          </h1>
          <p className="text-gray-400">
            Manage your tutoring sessions and find new tutors
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link href="/marketing/find-tutors">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Find New Tutors
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: My Tutors */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Your Tutors</h2>

            {myTutors.length > 0 ? (
              <div className="grid gap-4">
                {myTutors.map((tutor: any) => (
                  <Link
                    key={tutor.id}
                    href={`/protected/dashboard/student/tutors/${tutor.id}`}
                  >
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-green-500/50 transition">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={tutor.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-lg">
                              {tutor.full_name?.charAt(0) || "T"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-white">
                                  {tutor.full_name}
                                </h3>
                                {tutor.location && (
                                  <p className="text-sm text-gray-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {tutor.location}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-white font-medium">
                                  {tutor.average_rating?.toFixed(1) || "N/A"}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                              {tutor.bio || "No bio available"}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {tutor.subjects_of_expertise?.slice(0, 3).map((subject: string) => (
                                <Badge
                                  key={subject}
                                  variant="outline"
                                  className="border-green-500/50 text-green-400"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-xs text-gray-500">
                              {tutor.total_sessions} total sessions
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No tutors yet</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Find expert tutors to help you achieve your learning goals
                  </p>
                  <Link href="/marketing/find-tutors">
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                      Browse Tutors
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Upcoming Sessions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                {upcomingSessions && upcomingSessions.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {upcomingSessions.map((session: any) => (
                      <div key={session.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={session.tutor?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500">
                              {session.tutor?.full_name?.charAt(0) || "T"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm mb-1">
                              {session.subject}
                            </p>
                            <p className="text-xs text-gray-400 mb-2">
                              with {session.tutor?.full_name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.scheduled_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No upcoming sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}