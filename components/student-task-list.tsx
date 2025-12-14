"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "completed";
  type: "homework" | "quiz";
}

// UPDATE: Add tutorId as an optional prop here
interface StudentTaskListProps {
  studentId: string;
  tutorId?: string; 
}

export function StudentTaskList({ studentId, tutorId }: StudentTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTasks() {
      // Start query: Tasks assigned TO the student
      let query = supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", studentId)
        .order("due_date", { ascending: true });

      // UPDATE: If a tutorId is passed, filter by that tutor (created_by)
      if (tutorId) {
        query = query.eq("created_by", tutorId);
      }

      const { data, error } = await query;

      if (!error && data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    }

    if (studentId) {
      fetchTasks();
    }
  }, [studentId, tutorId, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6 italic">
        No tasks assigned yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-white/20 transition-colors group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                {task.title}
              </h4>
              <p className="text-sm text-gray-400 line-clamp-2">
                {task.description}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                task.status === "completed"
                  ? "border-green-500/50 text-green-400 bg-green-500/10"
                  : "border-orange-500/50 text-orange-400 bg-orange-500/10"
              }
            >
              {task.status === "completed" ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <Circle className="w-3 h-3 mr-1" />
              )}
              {task.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Due: {format(new Date(task.due_date), "MMM d, yyyy")}
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
              <FileText className="w-3 h-3 mr-1" />
              {task.type}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}