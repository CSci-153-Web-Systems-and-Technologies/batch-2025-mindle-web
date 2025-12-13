// file: app/(protected)/dashboard/student/tutors/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GraduationCap, Search, Star, BookOpen, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function BrowseTutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; subject?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Build query for tutors
  let query = supabase
    .from('profiles')
    .select('*')
    .in('role', ['tutor', 'both'])
    .eq('is_available', true);

  // Apply search filter if provided
  if (params.search) {
    query = query.or(`full_name.ilike.%${params.search}%,bio.ilike.%${params.search}%`);
  }

  // Apply subject filter if provided
  if (params.subject) {
    query = query.contains('subjects_of_expertise', [params.subject]);
  }

  const { data: tutors, error } = await query.order('average_rating', { ascending: false });

  if (error) {
    console.error("Error fetching tutors:", error);
  }

  // Get unique subjects for filter
  const allSubjects = tutors?.flatMap(t => t.subjects_of_expertise || []) || [];
  const uniqueSubjects = [...new Set(allSubjects)].sort();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-400" />
            Browse Tutors
          </h1>
          <p className="text-gray-400">
            Find the perfect tutor to help you achieve your learning goals
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
          <CardContent className="p-6">
            <form method="GET" className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  name="search"
                  placeholder="Search by name or expertise..."
                  defaultValue={params.search}
                  className="pl-10 bg-black/20 border-white/10 text-white"
                />
              </div>
              <select
                name="subject"
                defaultValue={params.subject || ""}
                className="bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map((subject) => (
                  <option key={subject} value={subject} className="bg-[#13132B]">
                    {subject}
                  </option>
                ))}
              </select>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tutors Grid */}
        {!tutors || tutors.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No tutors found</p>
              <p className="text-gray-600 text-sm">
                Try adjusting your search filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <Link
                key={tutor.id}
                href={`/protected/dashboard/student/tutors/${tutor.id}`}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/50 transition h-full group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={tutor.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xl">
                          {tutor.full_name?.charAt(0) || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg group-hover:text-purple-300 transition">
                          {tutor.full_name || "Anonymous Tutor"}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-medium">
                            {tutor.average_rating?.toFixed(1) || "N/A"}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            ({tutor.total_sessions || 0} sessions)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400 line-clamp-2 h-10">
                      {tutor.bio || "No bio provided"}
                    </p>

                    {tutor.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {tutor.location}
                      </div>
                    )}

                    {tutor.subjects_of_expertise && tutor.subjects_of_expertise.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects_of_expertise.slice(0, 3).map((subject: string) => (
                          <Badge
                            key={subject}
                            variant="outline"
                            className="border-purple-500/50 text-purple-400 text-xs"
                          >
                            {subject}
                          </Badge>
                        ))}
                        {tutor.subjects_of_expertise.length > 3 && (
                          <Badge
                            variant="outline"
                            className="border-gray-500/50 text-gray-400 text-xs"
                          >
                            +{tutor.subjects_of_expertise.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}