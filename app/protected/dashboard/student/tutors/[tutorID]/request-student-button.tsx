// file: app/(protected)/dashboard/student/tutors/[tutorID]/request-student-button.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, Check, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RequestStudentButtonProps {
  tutorId: string;
  studentId: string;
}

type RequestStatus = 'none' | 'pending' | 'accepted' | 'rejected';

export default function RequestStudentButton({ tutorId, studentId }: RequestStudentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<RequestStatus>('none');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkRequestStatus();
  }, [tutorId, studentId]);

  const checkRequestStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_student_requests')
        .select('status')
        .eq('student_id', studentId)
        .eq('tutor_id', tutorId)
        .maybeSingle();

      if (data) {
        setStatus(data.status as RequestStatus);
      } else {
        setStatus('none');
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSendRequest = async () => {
    setIsSubmitting(true);
    try {
      // 1. Send Notification to Tutor
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: tutorId,
          type: 'session_request',
          title: 'New Student Request',
          message: message || 'A student wants to learn with you!',
          related_id: studentId,
        });

      if (notifError) throw notifError;

      // 2. Upsert the request record (Handle re-requesting logic)
      // We use upsert so if a 'rejected' row exists, we update it back to 'pending'
      const { error: requestError } = await supabase
        .from('tutor_student_requests')
        .upsert({
          student_id: studentId,
          tutor_id: tutorId,
          status: 'pending',
          message: message,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id, tutor_id' });

      if (requestError) throw requestError;

      setStatus('pending');
      setIsOpen(false);
      router.refresh();
      
    } catch (error: any) {
      console.error("Error sending request:", error);
      alert(error.message || "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <Button disabled variant="outline" className="border-white/10">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // If already accepted, maybe hide button or show "Book Session"
  if (status === 'accepted') {
    return (
      <Button className="bg-green-600 hover:bg-green-700 text-white cursor-default">
        <Check className="w-4 h-4 mr-2" />
        Connected
      </Button>
    );
  }

  // If pending, show pending state (disabled)
  if (status === 'pending') {
    return (
      <Button disabled className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50">
        <Clock className="w-4 h-4 mr-2" />
        Request Pending
      </Button>
    );
  }

  // Render "Request" button if status is 'none' OR 'rejected'
  // If rejected, we might want to change the text slightly, or keep it standard
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={status === 'rejected' 
          ? "bg-purple-600 hover:bg-purple-700 text-white" // Standard color for retry
          : "bg-blue-600 hover:bg-blue-700 text-white"
        }
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {status === 'rejected' ? "Request Again" : "Request to be Student"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#1E1E3F] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {status === 'rejected' ? "Try Again?" : "Request to Learn with Tutor"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {status === 'rejected' 
                ? "Your previous request was declined, but you can try sending a new message." 
                : "Send a request to this tutor. They will review and approve your request."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white">
                Message to Tutor
              </Label>
              <Textarea
                id="message"
                placeholder="Tell the tutor about your learning goals..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-black/20 border-white/10 text-white min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}