import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Plus, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudyGroupsPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Study Groups
          </h1>
          <p className="text-gray-400">
            Collaborate and learn together with your peers
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          <Link href="/protected/dashboard/student/study-groups/create">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </Link>
          <Link href="/marketing/study-groups">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Globe className="w-4 h-4 mr-2" />
              Browse Public Groups
            </Button>
          </Link>
        </div>

        <Suspense fallback={<GroupsSkeleton />}>
          <StudyGroupsList />
        </Suspense>
      </div>
    </div>
  );
}

async function StudyGroupsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: groupMembers } = await supabase
    .from("group_members")
    .select(`
      group_id,
      role,
      status,
      joined_at,
      study_groups(
        id,
        name,
        description,
        subject,
        members_count,
        max_members,
        is_public,
        meeting_schedule,
        creator_id,
        creator:profiles!study_groups_creator_id_fkey(full_name)
      )
    `)
    .eq("member_id", user.id)
    .eq("status", "active");

  const myGroups = groupMembers
    ?.map((gm: any) => ({
      ...gm.study_groups,
      memberRole: gm.role,
      joinedAt: gm.joined_at,
    }))
    .filter(Boolean) || [];

  if (myGroups.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No study groups yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Join or create a study group to collaborate with peers
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/protected/dashboard/student/study-groups/create">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                Create Group
              </Button>
            </Link>
            <Link href="/marketing/study-groups">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Browse Groups
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        Your Groups ({myGroups.length})
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myGroups.map((group: any) => (
          <Link
            key={group.id}
            href={`/protected/dashboard/student/study-groups/${group.id}`}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/50 transition h-full">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-white text-lg">
                    {group.name}
                  </CardTitle>
                  {group.is_public ? (
                    <Globe className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <Badge variant="outline" className="border-purple-500/50 text-purple-400 w-fit">
                  {group.subject}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                  {group.description || "No description"}
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Members</span>
                    <span className="text-white font-medium">
                      {group.members_count} / {group.max_members}
                    </span>
                  </div>
                  {group.meeting_schedule && (
                    <div className="flex items-start justify-between">
                      <span>Schedule</span>
                      <span className="text-white text-right">
                        {group.meeting_schedule}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span>Your Role</span>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                      {group.memberRole}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GroupsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-white/5 border-white/10 h-[250px]">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 bg-white/10 mb-2" />
            <Skeleton className="h-4 w-1/4 bg-white/10" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full bg-white/10 mb-4" />
            <Skeleton className="h-4 w-full bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}