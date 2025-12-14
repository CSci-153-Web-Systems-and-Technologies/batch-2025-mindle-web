"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2, ClipboardList } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you use sonner or similar for toasts

interface TaskAssignerProps {
  tutorId: string;
  studentId: string;
}

export function TaskAssigner({ tutorId, studentId }: TaskAssignerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!title) throw new Error("Title is required");
      if (!date) throw new Error("Due date is required");

      // FIX: Matches your 'tasks' schema (is_completed boolean, no 'status')
      const { error } = await supabase.from("tasks").insert({
        tutor_id: tutorId,
        student_id: studentId,
        title: title,
        description: description,
        due_date: date.toISOString(), // Postgres handles timestamp to date cast
        is_completed: false, 
      });

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message);
      }

      setOpen(false);
      setTitle("");
      setDescription("");
      setDate(undefined);
      router.refresh();
      toast.success("Task assigned successfully!");

    } catch (error: any) {
      console.error("Error assigning task:", error);
      toast.error(error.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
          <ClipboardList className="w-4 h-4 mr-2" />
          Assign Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1E1E3F] border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g. Read Chapter 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black/20 border-white/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Details about the assignment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black/20 border-white/10"
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Due Date</Label>
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
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1E1E3F] border-white/10">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  autoFocus
                  className="text-white bg-[#1E1E3F]"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}