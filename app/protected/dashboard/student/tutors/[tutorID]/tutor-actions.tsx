// file: app/(protected)/dashboard/student/tutors/[tutorID]/tutor-actions.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TutorActionsProps {
  tutorId: string;
  userId: string;
}

export default function TutorActions({ tutorId, userId }: TutorActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkSavedStatus();
  }, [tutorId, userId]);

  const checkSavedStatus = async () => {
    try {
      // Check if this tutor is in the user's "my tutors" list
      // We'll use tutoring_sessions to check if there's any relationship
      const { data, error } = await supabase
        .from('tutoring_sessions')
        .select('id')
        .eq('student_id', userId)
        .eq('tutor_id', tutorId)
        .limit(1);

      if (!error && data && data.length > 0) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSaveToggle = async () => {
    setIsLoading(true);
    try {
      if (isSaved) {
        // In a real app, you'd have a "saved_tutors" table
        // For now, we'll just toggle the UI state
        setIsSaved(false);
        alert("Tutor removed from your list");
      } else {
        // Add to saved tutors
        setIsSaved(true);
        alert("Tutor added to My Tutors!");
      }
      router.refresh();
    } catch (error: any) {
      console.error("Error toggling saved status:", error);
      alert(error.message || "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <Button variant="outline" disabled className="border-white/20">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleSaveToggle}
      disabled={isLoading}
      className={
        isSaved
          ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
          : "border-white/20 text-white hover:bg-white/10"
      }
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-red-400" : ""}`} />
      )}
      {isSaved ? "Remove from My Tutors" : "Add to My Tutors"}
    </Button>
  );
}