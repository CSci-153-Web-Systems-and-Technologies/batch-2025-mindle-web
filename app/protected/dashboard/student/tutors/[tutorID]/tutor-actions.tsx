// file: app/(protected)/dashboard/student/tutors/[tutorID]/tutor-actions.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, UserMinus } from "lucide-react"; 
import { useRouter } from "next/navigation";
import RequestStudentButton from "./request-student-button"; 

interface TutorActionsProps {
  tutorId: string;
  userId: string;
}

export default function TutorActions({ tutorId, userId }: TutorActionsProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkStatus();
  }, [tutorId, userId]);

  const checkStatus = async () => {
    try {
      // Fetch the STATUS specifically
      const { data, error } = await supabase
        .from('tutoring_sessions')
        .select('status')
        .eq('student_id', userId)
        .eq('tutor_id', tutorId)
        .maybeSingle();

      if (!error && data) {
        setStatus(data.status);
      } else {
        setStatus(null);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to stop learning with this tutor?")) return;
    
    setIsLoading(true);
    try {
        const { error } = await supabase
          .from('tutoring_sessions')
          .delete()
          .eq('student_id', userId)
          .eq('tutor_id', tutorId);

        if (error) throw error;
        
        setStatus(null);
        router.refresh();
    } catch (error: any) {
      console.error("Error disconnecting:", error);
      alert(error.message || "Failed to disconnect");
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

  // ONLY show "Request Pending" if status is strictly 'pending'
  if (status === 'pending') {
    return (
      <Button variant="outline" disabled className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10 cursor-not-allowed">
        <Clock className="w-4 h-4 mr-2" />
        Request Pending
      </Button>
    );
  }

  // ONLY show "Stop Learning" if status is strictly 'accepted'
  if (status === 'accepted') {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        disabled={isLoading}
        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <UserMinus className="w-4 h-4 mr-2" />
        )}
        Stop Learning
      </Button>
    );
  }

  // Otherwise, show the Request Button
  return <RequestStudentButton tutorId={tutorId} studentId={userId} />;
}