import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Users, Calendar, Clock, Shield, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import GroupActions from "./group-actions";
import GroupChat from "./group-chat";

interface PageProps {
  params: Promise<{ groupID: string }>;
}

export default async function StudyGroupDetailPage({ params }: PageProps) {
  const { groupID } = await params;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<GroupDetailSkeleton />}>
          <GroupContent groupID={groupID} />
        </Suspense>
      </div>
    </div>
  );
}

async function GroupContent({ groupID }: { groupID: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: group, error } = await supabase
    .from("study_groups")
    .select(`
      *,
      creator:profiles!study_groups_creator_id_fkey(full_name, avatar_url)
    `)
    .eq("id", groupID)
    .single();

  if (error || !group) return notFound();

  const { data: membership } = await supabase
    .from("group_members")
    .select("role, status")
    .eq("group_id", groupID)
    .eq("member_id", user.id)
    .single();

  const isMember = !!membership;
  const isOwner = group.creator_id === user.id;
  const userRole = membership?.role || null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{group.name}</h1>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              {group.subject}
            </Badge>
            {!group.is_public && (
              <Badge className="bg-yellow-500/10 text-yellow-500">
                Private
              </Badge>
            )}
          </div>
          <p className="text-gray-400 max-w-2xl">{group.description}</p>
        </div>

        <GroupActions groupId={group.id} isMember={isMember} isOwner={isOwner} />
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GroupChat groupId={group.id} isMember={isMember} userId={user.id} />
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Group Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Members
                </span>
                <span className="text-white font-medium">
                  {group.members_count} / {group.max_members}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Created
                </span>
                <span className="text-white">
                  {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>

              {group.meeting_schedule && (
                <div className="flex items-start justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-4 h-4" /> Schedule
                  </span>
                  <span className="text-white text-right max-w-[150px]">
                    {group.meeting_schedule}
                  </span>
                </div>
              )}

              <Separator className="bg-white/10 my-2" />

              <div className="pt-2">
                <p className="text-xs text-gray-500 uppercase font-bold mb-3">Organizer</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-xs">
                    {group.creator?.full_name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="text-sm text-white">{group.creator?.full_name || "Unknown"}</p>
                    <p className="text-xs text-gray-400">Group Admin</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isMember && (
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-emerald-400 font-medium text-sm">You are a member</p>
                  <p className="text-emerald-500/60 text-xs capitalize">Role: {userRole}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3 bg-white/10" />
        <Skeleton className="h-4 w-1/2 bg-white/10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full bg-white/10 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full bg-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

