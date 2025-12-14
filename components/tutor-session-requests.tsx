// file: components/tutor-session-requests.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Check, X, Loader2, MessageSquare, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SessionRequest = {
  id: number;
  created_at: string;
  scheduled_at: string;
  duration_minutes: number;
  subject: string;
  description: string;
  student_id: string;
  student: {
    full_name: string;
    avatar_url: string;
    email: string;
  } | null; // Handle case where student profile might be missing
};

export function TutorSessionRequests({ requests }: { requests: SessionRequest[] }) {
  const [pendingRequests, setPendingRequests] = useState(requests);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleAction = async (sessionId: number, studentId: string, action: 'confirm' | 'reject') => {
    setProcessingId(sessionId);
    try {
      // 1. Update the Session Status in Database
      const newStatus = action === 'confirm' ? 'confirmed' : 'rejected';
      
      const { error: updateError } = await supabase
        .from('tutoring_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // 2. Send Notification to the Student
      const notifTitle = action === 'confirm' ? 'Session Request Accepted' : 'Session Request Declined';
      const notifMessage = action === 'confirm' 
        ? `Your tutor accepted the session for ${format(new Date(pendingRequests.find(r => r.id === sessionId)!.scheduled_at), "PPP p")}`
        : `Your tutor was unable to accept the session request.`;

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: studentId, // Send to Student
          type: 'session_update',
          title: notifTitle,
          message: notifMessage,
          related_id: sessionId.toString(),
          action_url: '/dashboard/student/sessions', // Link for the student
          is_read: false
        });

      if (notifError) console.error("Notification failed:", notifError);

      // 3. Update UI immediately
      toast.success(action === 'confirm' ? "Session confirmed" : "Request rejected");
      setPendingRequests((prev) => prev.filter((req) => req.id !== sessionId));
      router.refresh(); // Refresh server data

    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update session");
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 border-dashed">
        <CardContent className="p-8 text-center text-gray-400">
          <p>No pending requests at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((session) => (
        <Card key={session.id} className="bg-white/5 border-white/10 overflow-hidden">
          <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6">
            
            {/* Student Info Column */}
            <div className="flex items-start gap-4 min-w-[200px]">
              <Avatar className="w-12 h-12 border-2 border-white/10">
                <AvatarImage src={session.student?.avatar_url || ""} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {session.student?.full_name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-semibold">{session.student?.full_name || "Unknown Student"}</h3>
                <p className="text-sm text-gray-400 mb-2">{session.student?.email}</p>
                <Link href={`/dashboard/tutor/messages/${session.student_id}`}>
                   <Button size="sm" variant="ghost" className="h-6 px-0 text-blue-400 hover:text-blue-300">
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      Message
                   </Button>
                </Link>
              </div>
            </div>

            {/* Session Details Column */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {session.subject}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-gray-400">
                  {session.duration_minutes} min
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="font-medium">
                  {format(new Date(session.scheduled_at), "PPP")}
                </span>
                <Clock className="w-4 h-4 text-orange-400 ml-2" />
                <span>
                  {format(new Date(session.scheduled_at), "p")}
                </span>
              </div>

              {session.description && (
                <div className="text-sm text-gray-400 bg-black/20 p-3 rounded-md border border-white/5">
                  "{session.description}"
                </div>
              )}
            </div>

            {/* Actions Column */}
            <div className="flex md:flex-col gap-3 justify-center md:border-l border-white/10 md:pl-6">
              <Button 
                onClick={() => handleAction(session.id, session.student_id, 'confirm')}
                disabled={processingId === session.id}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
              >
                {processingId === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Accept
              </Button>
              <Button 
                onClick={() => handleAction(session.id, session.student_id, 'reject')}
                disabled={processingId === session.id}
                variant="outline" 
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 min-w-[100px]"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>

          </div>
        </Card>
      ))}
    </div>
  );
}