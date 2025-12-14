// file: app/(protected)/dashboard/student/tutors/[tutorID]/request-student-button.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, Check } from "lucide-react";
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

export default function RequestStudentButton({ tutorId, studentId }: RequestStudentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSendRequest = async () => {
    setIsSubmitting(true);
    try {
      // Create a notification for the tutor
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

      // Create a pending session request
      const { error: sessionError } = await supabase
        .from('tutoring_sessions')
        .insert({
          tutor_id: tutorId,
          student_id: studentId,
          subject: 'General', // Can be customized
          description: message,
          scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now as placeholder
          duration_minutes: 60,
          status: 'pending',
        });

      if (sessionError) throw sessionError;

      setRequestSent(true);
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Error sending request:", error);
      alert(error.message || "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Request to be Student
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#1E1E3F] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Request to Learn with Tutor
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Send a request to this tutor. They will review and approve your request.
            </DialogDescription>
          </DialogHeader>

          {!requestSent ? (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">
                    Introduce yourself (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the tutor about your learning goals and what subjects you'd like help with..."
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
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Request Sent!
              </h3>
              <p className="text-gray-400 text-sm">
                The tutor will review your request and get back to you soon.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}