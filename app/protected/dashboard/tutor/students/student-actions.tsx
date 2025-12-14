// file: app/(protected)/dashboard/tutor/students/student-actions.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentActionsProps {
  sessionId: number;
}

export default function StudentActions({ sessionId }: StudentActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      // Update session status to confirmed
      const { error } = await supabase
        .from('tutoring_sessions')
        .update({ status: 'confirmed' })
        .eq('id', sessionId);

      if (error) throw error;

      // Create notification for student
      const { data: session } = await supabase
        .from('tutoring_sessions')
        .select('student_id')
        .eq('id', sessionId)
        .single();

      if (session) {
        await supabase
          .from('notifications')
          .insert({
            user_id: session.student_id,
            type: 'session_confirmed',
            title: 'Request Accepted!',
            message: 'Your tutor has accepted your request. You can now schedule sessions.',
          });
      }

      router.refresh();
    } catch (error: any) {
      console.error("Error accepting request:", error);
      alert(error.message || "Failed to accept request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      // Update session status to cancelled
      const { error } = await supabase
        .from('tutoring_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      router.refresh();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      alert(error.message || "Failed to reject request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={handleAccept}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Check className="w-4 h-4 mr-1" />
            Accept
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={isLoading}
        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <X className="w-4 h-4 mr-1" />
            Reject
          </>
        )}
      </Button>
    </div>
  );
}