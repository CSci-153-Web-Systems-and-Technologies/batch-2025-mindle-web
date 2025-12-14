"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, UserPlus, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GroupActionsProps {
  groupId: number;
  isMember: boolean;
  isOwner: boolean;
}

export default function GroupActions({ groupId, isMember, isOwner }: GroupActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleJoinGroup = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.rpc('join_study_group', {
        p_group_id: groupId
      });

      if (error) throw error;

      if (data?.success) {
        if (data.requires_approval) {
          alert("Join request sent! Waiting for approval.");
        } else {
          alert("Successfully joined the group!");
          router.refresh();
        }
      } else {
        alert(data?.error || "Failed to join group");
      }
    } catch (error: any) {
      console.error("Error joining group:", error);
      alert(error.message || "Failed to join group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.rpc('leave_study_group', {
        p_group_id: groupId
      });

      if (error) throw error;

      if (data?.success) {
        if (data.group_deleted) {
          alert("Group deleted");
          router.push('/protected/dashboard/student/study-groups');
        } else {
          alert("Left the group");
          router.refresh();
        }
      } else {
        alert(data?.error || "Failed to leave group");
      }
    } catch (error: any) {
      console.error("Error leaving group:", error);
      alert(error.message || "Failed to leave group");
    } finally {
      setIsLoading(false);
      setShowLeaveDialog(false);
    }
  };

  if (isOwner) {
    return (
      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <Settings className="w-4 h-4 mr-2" />
        Manage Group
      </Button>
    );
  }

  if (isMember) {
    return (
      <>
        <Button 
          variant="destructive" 
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none"
          onClick={() => setShowLeaveDialog(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          Leave Group
        </Button>

        <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <AlertDialogContent className="bg-[#1E1E3F] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Leave Study Group?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to leave this group? You'll need to request to join again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeaveGroup}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Leaving..." : "Leave Group"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Button 
      className="bg-purple-600 hover:bg-purple-700 text-white"
      onClick={handleJoinGroup}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      Join Group
    </Button>
  );
}