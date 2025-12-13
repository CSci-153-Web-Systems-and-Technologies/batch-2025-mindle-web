"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Users, 
  Calendar, 
  ArrowLeft, 
  Shield, 
  Globe, 
  Lock,
  MessageCircle,
  Video,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type StudyGroup = {
  id: number;
  name: string;
  subject: string;
  description: string;
  max_members: number;
  members_count: number;
  is_public: boolean;
  meeting_schedule: string;
  meeting_link: string | null;
  creator_id: string;
  created_at: string;
};

function StudyGroupViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the 'id' from the URL (e.g., /view?id=12)
  const groupId = searchParams.get("id");

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId) {
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // 1. Fetch Group Details
        const { data: groupData, error: groupError } = await supabase
          .from("study_groups")
          .select("*")
          .eq("id", groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        if (user) {
          setIsCreator(groupData.creator_id === user.id);

          // 2. Check if user is a member
          const { data: memberData } = await supabase
            .from("study_group_members")
            .select("id")
            .eq("study_group_id", groupId)
            .eq("user_id", user.id)
            .maybeSingle(); // safe way to check existence without error
            
          setIsMember(!!memberData);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const handleJoin = async () => {
    if (!group) return;
    setJoinLoading(true);
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert into members table
      const { error } = await supabase
        .from("study_group_members")
        .insert({
          study_group_id: group.id,
          user_id: user.id
        });

      if (error) throw error;
      
      // Update local state to reflect change immediately
      setIsMember(true);
      // Optional: Increment member count visually
      setGroup(prev => prev ? ({ ...prev, members_count: prev.members_count + 1 }) : null);
      
      router.refresh();
    } catch (error: any) {
      console.error("Error joining group:", error);
      alert(error.message || "Failed to join group");
    } finally {
      setJoinLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!group || !groupId) {
    return (
      <div className="p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Group not found</h2>
        <p className="text-gray-400 mb-4">The group you are looking for does not exist or the link is invalid.</p>
        <Link href="/protected/dashboard/student/study-groups" className="text-purple-400 hover:underline">
          Return to list
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Link 
        href="/protected/dashboard/student/study-groups"
        className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Groups
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-0">
              {group.subject}
            </Badge>
            {group.is_public ? (
              <Badge variant="outline" className="border-green-500/30 text-green-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Public
              </Badge>
            ) : (
              <Badge variant="outline" className="border-orange-500/30 text-orange-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{group.name}</h1>
          <p className="text-gray-400">Created {new Date(group.created_at).toLocaleDateString()}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isCreator ? (
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
              Manage Group
            </Button>
          ) : isMember ? (
            <Button disabled className="bg-green-500/20 text-green-400 border border-green-500/20 cursor-default">
              Joined
            </Button>
          ) : (
            <Button 
              onClick={handleJoin}
              disabled={joinLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
            >
              {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Group"}
            </Button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#13132B]/50 backdrop-blur-md border-white/10 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                About this Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300 leading-relaxed">
              <p>{group.description || "No description provided."}</p>
            </CardContent>
          </Card>

          {/* Placeholder for future features */}
          <Card className="bg-[#13132B]/50 backdrop-blur-md border-white/10 text-white h-64 flex items-center justify-center border-dashed">
             <div className="text-center space-y-2">
                <MessageCircle className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-gray-500 font-medium">Group chat coming soon</p>
             </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-[#1E1E3F]/50 backdrop-blur-md border-white/10 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Group Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Schedule</p>
                  <p className="text-sm text-white mt-1">
                    {group.meeting_schedule || "No schedule set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 mt-1">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Members</p>
                  <p className="text-sm text-white mt-1">
                    {group.members_count} / {group.max_members} spots filled
                  </p>
                </div>
              </div>

              {isMember && group.meeting_link && (
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-green-500/10 rounded-lg text-green-400 mt-1">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Meeting Link</p>
                    <a href={group.meeting_link} target="_blank" className="text-sm text-purple-400 hover:underline break-all mt-1 block">
                      Join Meeting
                    </a>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for Next.js 13+ useSearchParams requirement
export default function StudyGroupViewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading...</div>}>
      <StudyGroupViewContent />
    </Suspense>
  );
}