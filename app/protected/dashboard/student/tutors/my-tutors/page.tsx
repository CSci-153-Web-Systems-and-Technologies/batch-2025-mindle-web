// file: app/(protected)/dashboard/student/tutors/my-tutors/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Heart, Star, Calendar, MessageSquare, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function MyTutorsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch tutors this student has had sessions with
  const { data: sessionData } = await supabase
    .from('tutoring_sessions')
    .select(`
      tutor_id,
      tutor:profiles!tutoring_sessions_tutor_id_fkey(*)
    `)
    .eq('student_id', user.id)
    // ✅ Check for 'confirmed' (active) or 'completed' (past) sessions
    .in('status', ['confirmed', 'completed']) 
    .order('created_at', { ascending: false });

  // Get unique tutors
  const tutorMap = new Map();
  sessionData?.forEach((session: any) => {
    if (session.tutor && !tutorMap.has(session.tutor.id)) {
      tutorMap.set(session.tutor.id, session.tutor);
    }
  });

  const myTutors = Array.from(tutorMap.values());

  // Count sessions per tutor
  const tutorSessionCounts = new Map();
  sessionData?.forEach((session: any) => {
    const count = tutorSessionCounts.get(session.tutor_id) || 0;
    tutorSessionCounts.set(session.tutor_id, count + 1);
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-400 fill-red-400" />
            My Tutors
          </h1>
          <p className="text-gray-400">
            Tutors you've connected with and had sessions with
          </p>
        </div>

        {/* Empty State */}
        {myTutors.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No tutors yet</p>
              <p className="text-gray-600 text-sm mb-6">
                Browse tutors and book your first session to get started
              </p>
              <Link href="/protected/dashboard/student/tutors">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Browse Tutors
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-gray-400">
              Showing {myTutors.length} tutor{myTutors.length !== 1 ? 's' : ''}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTutors.map((tutor: any) => (
                <Card
                  key={tutor.id}
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/50 transition"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={tutor.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xl">
                          {tutor.full_name?.charAt(0) || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-1">
                          {tutor.full_name || "Anonymous Tutor"}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-medium text-sm">
                            {tutor.average_rating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Sessions together</span>
                      <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                        {tutorSessionCounts.get(tutor.id) || 0}
                      </Badge>
                    </div>

                    {tutor.subjects_of_expertise && tutor.subjects_of_expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects_of_expertise.slice(0, 2).map((subject: string) => (
                          <Badge
                            key={subject}
                            variant="outline"
                            className="border-blue-500/50 text-blue-400 text-xs"
                          >
                            {subject}
                          </Badge>
                        ))}
                        {tutor.subjects_of_expertise.length > 2 && (
                          <Badge
                            variant="outline"
                            className="border-gray-500/50 text-gray-400 text-xs"
                          >
                            +{tutor.subjects_of_expertise.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/protected/dashboard/student/tutors/${tutor.id}`} className="flex-1">
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 text-sm">
                          View Profile
                        </Button>
                      </Link>
                      <Link href={`/protected/dashboard/student/messages/${tutor.id}`}>
                        <Button size="icon" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}