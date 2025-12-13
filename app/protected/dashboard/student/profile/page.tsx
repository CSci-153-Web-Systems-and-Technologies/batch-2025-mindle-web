import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Mail, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
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
            View and manage your personal information
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-3xl">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile?.full_name || "Student"}
              </h2>
              
              {profile?.username && (
                <p className="text-gray-400 mb-4">@{profile.username}</p>
              )}

              <Badge
                variant="outline"
                className="border-blue-500/50 text-blue-400 mb-4"
              >
                {profile?.role || "student"}
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

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Timezone</label>
                <p className="text-white">{profile?.timezone || "UTC"}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Preferred Language
                </label>
                <p className="text-white">{profile?.preferred_language || "English"}</p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  To edit your profile, go to{" "}
                  <a
                    href="/protected/dashboard/student/settings"
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