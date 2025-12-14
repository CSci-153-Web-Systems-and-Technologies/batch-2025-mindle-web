import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Plus, Globe, Lock, Clock } from "lucide-react";
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Study Groups
          </h1>
          <p className="text-gray-400">
            Collaborate and learn together with your peers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Link href="/protected/dashboard/student/study-groups/create">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </Link>
          <Link href="/protected/dashboard/student/study-groups/browse">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Globe className="w-4 h-4 mr-2" />
              Browse Public Groups
            </Button>
          </Link>
        </div>

        {/* Group List */}
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

  // Fetch groups where the current user is a member
  const { data: groupMembers, error } = await supabase
    .from("group_members")
    .select(`
      group_id,
      joined_at,
      study_groups (
        id,
        name,
        description,
        subject,
        members_count,
        max_members,
        is_public,
        meeting_schedule,
        creator_id
      )
    `)
    .eq("member_id", user.id);

  if (error) {
    console.error("Error fetching groups:", error);
    return <p className="text-red-400">Failed to load groups.</p>;
  }

  // Flatten the data structure
  const myGroups = groupMembers
    ?.map((gm: any) => {
      if (!gm.study_groups) return null;
      return {
        ...gm.study_groups,
        joinedAt: gm.joined_at,
      };
    })
    .filter(Boolean) || [];

  // EMPTY STATE
  if (myGroups.length === 0) {
    return (
      <Card className="bg-[#13132B]/50 backdrop-blur-md border-white/10">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No study groups yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            You haven't joined any groups yet. Create one to start leading or browse public groups to join.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/protected/dashboard/student/study-groups/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Create Group
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // LIST STATE
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        Your Groups ({myGroups.length})
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myGroups.map((group: any) => (
          <Link
            key={group.id}
            // UPDATED LINK: Uses the Query Parameter format we created
            href={`/protected/dashboard/student/study-groups/view?id=${group.id}`}
            className="block h-full"
          >
            <Card className="bg-[#1E1E3F]/50 backdrop-blur-md border-white/10 hover:border-purple-500/50 hover:bg-[#1E1E3F]/70 transition-all duration-300 h-full group relative overflow-hidden">
              
              {/* Decoration gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-300">
                    {group.subject}
                  </Badge>
                  {group.is_public ? (
                    <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/10">
                      <Globe className="w-3 h-3" /> Public
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/10">
                      <Lock className="w-3 h-3" /> Private
                    </div>
                  )}
                </div>
                <CardTitle className="text-white text-xl leading-tight group-hover:text-purple-300 transition-colors">
                  {group.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-400 mb-6 line-clamp-2 h-10">
                  {group.description || "No description provided."}
                </p>
                
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Members
                    </span>
                    <span className="text-white font-medium bg-white/5 px-2 py-0.5 rounded">
                      {group.members_count} <span className="text-gray-500">/ {group.max_members}</span>
                    </span>
                  </div>
                  
                  {group.meeting_schedule && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Schedule
                      </span>
                      <span className="text-white text-right truncate max-w-[150px]" title={group.meeting_schedule}>
                        {group.meeting_schedule}
                      </span>
                    </div>
                  )}
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
        <Card key={i} className="bg-white/5 border-white/10 h-[280px]">
          <CardHeader>
            <div className="flex justify-between mb-4">
              <Skeleton className="h-5 w-20 bg-white/10" />
              <Skeleton className="h-5 w-16 bg-white/10" />
            </div>
            <Skeleton className="h-7 w-3/4 bg-white/10" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full bg-white/10 mb-6" />
            <div className="space-y-3 pt-4 border-t border-white/5">
               <Skeleton className="h-5 w-full bg-white/10" />
               <Skeleton className="h-5 w-full bg-white/10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}