// file: app/(protected)/dashboard/tutor/students/student-actions.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentActionsProps {
  requestId: string;
  studentId: string;
  studentName?: string;
}

export default function StudentActions({ requestId, studentId, studentName }: StudentActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAction = async (action: 'accepted' | 'rejected') => {
    setIsLoading(true);
    try {
      // 1. Update the request status
      const { error } = await supabase
        .from('tutor_student_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      // 2. Mark the relevant notification as read (so red badge disappears)
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('type', 'session_request')
        .eq('related_id', studentId); // Assuming related_id stores the student_id

      // 3. If accepted, send a notification back to the student
      if (action === 'accepted') {
        await supabase.from('notifications').insert({
          user_id: studentId,
          type: 'request_accepted',
          title: 'Request Accepted!',
          message: `Your tutor has accepted your request. You can now book sessions.`,
          related_id: requestId,
        });
        alert(`You have accepted ${studentName || 'the student'}.`);
      } else {
         // Optional: Notify student of rejection
         // alert("Request rejected.");
      }

      router.refresh();
    } catch (error: any) {
      console.error("Error updating request:", error);
      alert("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAction('rejected')}
        disabled={isLoading}
        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
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
      <Button
        size="sm"
        onClick={() => handleAction('accepted')}
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
    </div>
  );
}