import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  BookOpen,
  ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

import { TaskAssigner } from "@/components/task-assigner";
import { CreateSessionDialog } from "@/components/create-session-dialog";
// ✅ IMPORT THE NEW REQUESTS COMPONENT
import { TutorSessionRequests } from "@/components/tutor-session-requests";

interface PageProps {
  params: Promise<{ studentID: string }>;
}

export default async function TutorStudentDetailPage({ params }: PageProps) {
  const { studentID } = await params;
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 1. Fetch Student Profile
  const { data: student, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentID)
    .single();

  if (error || !student) {
    return notFound();
  }

  // 2. Check Connection Status
  const { data: requestStatus } = await supabase
    .from('tutor_student_requests')
    .select('status')
    .eq('tutor_id', user.id)
    .eq('student_id', studentID)
    .single();

  const isConnected = requestStatus?.status === 'accepted';

  // 3. Fetch Session Statistics
  const { data: sessions } = await supabase
    .from('tutoring_sessions')
    .select('*')
    .eq('tutor_id', user.id)
    .eq('student_id', studentID)
    .order('scheduled_at', { ascending: false });

  // ✅ Filter for Pending Requests
  const pendingRequests = sessions
    ?.filter(s => s.status === 'pending')
    .map(s => ({
      ...s,
      student: { // Manually attach student profile since we have it
        full_name: student.full_name,
        avatar_url: student.avatar_url,
        email: student.email
      }
    })) || [];

  // ✅ Filter for Confirmed Upcoming Sessions (Exclude pending/rejected)
  const upcomingSessions = sessions?.filter(s => 
    (s.status === 'confirmed' || s.status === 'accepted') && 
    new Date(s.scheduled_at) > new Date()
  ) || [];

  const totalSessions = sessions?.filter(s => s.status === 'completed').length || 0;
  
  // Calculate total hours
  const totalMinutes = sessions
    ?.filter(s => s.status === 'completed')
    .reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0;
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  // 4. Fetch Tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('tutor_id', user.id)
    .eq('student_id', studentID)
    .order('created_at', { ascending: false });

  const completedTasks = tasks?.filter(t => t.is_completed).length || 0;
  const totalAssignedTasks = tasks?.length || 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/protected/dashboard/tutor/students"
          className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Students
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Avatar Column */}
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32 border-4 border-white/10">
              <AvatarImage src={student.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-4xl text-white">
                {student.full_name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info Column */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {student.full_name || "Anonymous Student"}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-4">
                  {student.email && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Mail className="w-4 h-4" />
                      {student.email}
                    </div>
                  )}
                  {student.location && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="w-4 h-4" />
                      {student.location}
                    </div>
                  )}
                  <Badge 
                    variant="outline" 
                    className={
                      isConnected 
                      ? "border-green-500/50 text-green-400" 
                      : "border-orange-500/50 text-orange-400"
                    }
                  >
                    {isConnected ? "Active Student" : (requestStatus?.status || "No Status")}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6 max-w-2xl">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Total Sessions</div>
                <div className="text-2xl font-bold text-white">{totalSessions}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Hours Learned</div>
                <div className="text-2xl font-bold text-white">{totalHours}h</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Tasks Done</div>
                <div className="text-2xl font-bold text-white">{completedTasks}/{totalAssignedTasks}</div>
              </div>
            </div>

            {/* Action Buttons */}
            {isConnected && (
              <div className="flex flex-wrap gap-3">
                <CreateSessionDialog tutorId={user.id} studentId={studentID} />
                <TaskAssigner tutorId={user.id} studentId={studentID} />
                <Link href={`/protected/dashboard/tutor/messages/${studentID}`}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ✅ PENDING REQUESTS SECTION (New) */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pending Session Requests
            </h2>
            {/* Reuse the component to handle Accept/Decline logic */}
            <TutorSessionRequests requests={pendingRequests} />
          </div>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 w-full md:w-auto">
            <TabsTrigger value="sessions" className="data-[state=active]:bg-white/10">
              <Calendar className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white/10">
              <ClipboardList className="w-4 h-4 mr-2" />
              Tasks & Homework
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-white/10">
              <BookOpen className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          {/* SESSIONS TAB */}
          <TabsContent value="sessions" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Upcoming */}
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  Upcoming Confirmed
                </h3>
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map(session => (
                    <Card key={session.id} className="bg-white/5 border-green-500/30">
                      <CardContent className="p-4">
                        <div className="font-medium text-white mb-1">{session.subject}</div>
                        <div className="text-sm text-green-400 mb-2">
                          {new Date(session.scheduled_at).toLocaleString()}
                        </div>
                        <Badge variant="outline" className="border-white/20">
                          {session.duration_minutes} min
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No confirmed upcoming sessions.</p>
                )}
              </div>

              {/* History */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-white">Session History</h3>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-0">
                    {sessions && sessions.length > 0 ? (
                      <div className="divide-y divide-white/10">
                        {sessions.map(session => (
                          <div key={session.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                            <div>
                              <div className="font-medium text-white">{session.subject || "General Session"}</div>
                              <div className="text-sm text-gray-400">
                                {new Date(session.scheduled_at).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge 
                              variant="outline"
                              className={
                                session.status === 'completed' ? 'border-blue-500/50 text-blue-400' :
                                session.status === 'confirmed' ? 'border-green-500/50 text-green-400' :
                                session.status === 'pending' ? 'border-yellow-500/50 text-yellow-400' :
                                'border-red-500/50 text-red-400'
                              }
                            >
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No session history found.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TASKS TAB */}
          <TabsContent value="tasks" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Assigned Tasks</h3>
              {isConnected && <TaskAssigner tutorId={user.id} studentId={studentID} />}
            </div>

            <div className="grid gap-4">
              {tasks && tasks.length > 0 ? (
                tasks.map(task => (
                  <Card key={task.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`mt-1 p-1 rounded-full ${task.is_completed ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {task.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-lg font-medium ${task.is_completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          <span>Assigned: {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={task.is_completed ? "border-green-500/50 text-green-400" : "border-yellow-500/50 text-yellow-400"}>
                        {task.is_completed ? "Completed" : "Pending"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10 border-dashed">
                  <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No tasks assigned yet.</p>
                  <p className="text-sm text-gray-500 mb-4">Assign homework or goals to help them track progress.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">About Student</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Bio</h4>
                  <p className="text-gray-200 leading-relaxed">
                    {student.bio || "No bio available."}
                  </p>
                </div>
                <Separator className="bg-white/10" />
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Languages</h4>
                  <p className="text-gray-200">{student.preferred_language || "English"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}