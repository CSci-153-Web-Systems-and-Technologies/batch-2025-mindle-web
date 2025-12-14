// file: components/create-session-dialog.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Loader2, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CreateSessionDialogProps {
  tutorId: string;
  studentId: string;
}

export function CreateSessionDialog({ tutorId, studentId }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [subject, setSubject] = useState("General");
  const [description, setDescription] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!date) throw new Error("Please select a date");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      const isCreatorTutor = user.id === tutorId;

      // 1. Prepare Date
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);

      if (scheduledAt < new Date()) {
        throw new Error("Cannot schedule sessions in the past");
      }

      // 2. Insert Session
      const { data: sessionData, error: sessionError } = await supabase
        .from("tutoring_sessions")
        .insert({
          tutor_id: tutorId,
          student_id: studentId,
          subject: subject,
          description: description,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(duration),
          status: isCreatorTutor ? "confirmed" : "pending", 
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("No session data returned");

      // 3. Send Notification
      const recipientId = isCreatorTutor ? studentId : tutorId;

      // 🛑 SAFETY CHECK: Ensure we actually have a person to notify
      if (!recipientId) {
        console.warn("Skipping notification: No recipient ID found (studentId might be missing)");
      } else {
        const notifTitle = isCreatorTutor ? 'New Session Scheduled' : 'New Session Request';
        const notifMessage = isCreatorTutor 
          ? `Your tutor scheduled a session for ${format(scheduledAt, "PPP p")}`
          : `A student requested a session for ${format(scheduledAt, "PPP p")}`;
        
        const targetUrl = isCreatorTutor ? `/dashboard/student/sessions` : `/dashboard/tutor/sessions`;

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: recipientId,
            type: 'session_scheduled',
            title: notifTitle,
            message: notifMessage,
            related_id: sessionData.id.toString(),
            action_url: targetUrl,
            is_read: false
          });

        if (notifError) {
          // 🛑 DEBUG: Log the full JSON string to see the real error
          console.error("Notification Error:", JSON.stringify(notifError, null, 2));
        }
      }

      // 4. Success State
      setOpen(false);
      setDate(undefined);
      setSubject("General");
      setDescription("");
      router.refresh();
      toast.success(isCreatorTutor ? "Session scheduled!" : "Request sent!");

    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-500/20 text-green-400 hover:bg-green-500/10">
          <Clock className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1E1E3F] border-white/10 text-white sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSchedule} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              className="bg-black/20 border-white/10"
              placeholder="e.g. Mathematics"
            />
          </div>

          <div className="space-y-2">
            <Label>Description / Notes</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black/20 border-white/10 min-h-[80px]"
              placeholder="What will you cover in this session?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-black/20 border-white/10",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1E1E3F] border-white/10">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    autoFocus
                    className="text-white bg-[#1E1E3F]"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                className="bg-black/20 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1E3F] border-white/10 text-white">
                <SelectItem value="30">30 Minutes</SelectItem>
                <SelectItem value="45">45 Minutes</SelectItem>
                <SelectItem value="60">1 Hour</SelectItem>
                <SelectItem value="90">1.5 Hours</SelectItem>
                <SelectItem value="120">2 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}