// file: app/(protected)/dashboard/tutor/profile/page.tsx
// This is nearly identical to student profile page
// Copy from: app/(protected)/dashboard/student/profile/page.tsx
// Just update navigation/branding if needed

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Mail, MapPin, Calendar, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function TutorProfilePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-blue-400" />
            Profile
          </h1>
          <p className="text-gray-400">
            View your tutor profile information
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-3xl">
                  {profile?.full_name?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile?.full_name || "Tutor"}
              </h2>
              
              {profile?.username && (
                <p className="text-gray-400 mb-4">@{profile.username}</p>
              )}

              <Badge
                variant="outline"
                className="border-purple-500/50 text-purple-400 mb-4"
              >
                {profile?.role || "tutor"}
              </Badge>

              <div className="space-y-2 text-sm text-gray-400 text-left mt-6">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined {new Date(profile?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Bio</label>
                <p className="text-white">
                  {profile?.bio || "No bio added yet"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Total Sessions
                  </label>
                  <p className="text-white text-2xl font-bold">
                    {profile?.total_sessions || 0}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Average Rating
                  </label>
                  <p className="text-white text-2xl font-bold">
                    {profile?.average_rating?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>

              {profile?.subjects_of_expertise && profile.subjects_of_expertise.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Subjects of Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects_of_expertise.map((subject: string) => (
                      <Badge
                        key={subject}
                        variant="outline"
                        className="border-purple-500/50 text-purple-400"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Timezone</label>
                <p className="text-white">{profile?.timezone || "UTC"}</p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  To edit your profile, go to{" "}
                  <a
                    href="/protected/dashboard/tutor/settings"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Settings
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}