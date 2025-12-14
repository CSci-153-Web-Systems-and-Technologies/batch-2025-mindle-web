import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  MessageSquare,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Video,
  Circle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import RequestStudentButton from "./request-student-button";
import { SubjectManager } from "@/components/subject-manager"; 
import { CreateSessionDialog } from "@/components/create-session-dialog";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ tutorID: string }>;
}

export default async function TutorDetailPage({ params }: PageProps) {
  const { tutorID } = await params;
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 1. Fetch tutor profile
  const { data: tutor, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', tutorID)
    .single();

  if (error || !tutor) {
    return notFound();
  }

  // 2. Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
    `)
    .eq('reviewee_id', tutorID)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. Fetch ALL Sessions (History & Status)
  const { data: sessionHistory } = await supabase
    .from('tutoring_sessions')
    .select('*')
    .eq('student_id', user.id)
    .eq('tutor_id', tutorID)
    .order('scheduled_at', { ascending: false });

  // 4. ✅ Fetch TASKS directly (Server-side)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('student_id', user.id)
    .eq('tutor_id', tutorID)
    .order('due_date', { ascending: true }); // Show earliest due date first

  // Determine relationship status
  const latestSession = sessionHistory && sessionHistory.length > 0 ? sessionHistory[0] : null;
  const status = latestSession?.status; 

  const hasActiveRelationship = sessionHistory?.some(s => 
    s.status === 'confirmed' || s.status === 'completed' || s.status === 'accepted'
  );

  const isPending = status === 'pending';
  const canRequest = !sessionHistory || sessionHistory.length === 0 || status === 'rejected';

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/protected/dashboard/student/tutors"
          className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tutor Profile */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Header */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={tutor.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-4xl">
                      {tutor.full_name?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                          {tutor.full_name || "Anonymous Tutor"}
                        </h1>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xl text-white font-bold">
                            {tutor.average_rating?.toFixed(1) || "N/A"}
                          </span>
                          <span className="text-gray-400">
                            ({tutor.total_sessions || 0} sessions)
                          </span>
                        </div>
                        {tutor.location && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {tutor.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {canRequest && (
                        <RequestStudentButton tutorId={tutorID} studentId={user.id} />
                      )}

                      {isPending && (
                        <Button disabled variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10">
                          <Clock className="w-4 h-4 mr-2" />
                          Request Pending
                        </Button>
                      )}

                      {hasActiveRelationship && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 py-2 px-4">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Your Tutor
                        </Badge>
                      )}

                      <Link href={`/protected/dashboard/student/messages/${tutorID}`}>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {tutor.bio || "This tutor hasn't added a bio yet."}
                </p>
              </CardContent>
            </Card>

            {/* Subjects Section */}
            {tutor.subjects_of_expertise && tutor.subjects_of_expertise.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Subjects of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SubjectManager
                    initialSubjects={tutor.subjects_of_expertise}
                    readOnly={true} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Sessions History */}
            {hasActiveRelationship && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-orange-400" />
                    Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessionHistory && sessionHistory.length > 0 ? (
                    sessionHistory.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{session.subject || "General Session"}</p>
                            <p className="text-sm text-gray-400">
                              {format(new Date(session.scheduled_at), "PPP p")}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            session.status === 'confirmed' || session.status === 'accepted' ? 'text-green-400 border-green-500/30' :
                            session.status === 'completed' ? 'text-blue-400 border-blue-500/30' :
                            'text-yellow-400 border-yellow-500/30'
                          }
                        >
                          {session.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No sessions scheduled yet.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ✅ ASSIGNMENTS & TASKS (Direct Render) */}
            {hasActiveRelationship && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-400" />
                    Assignments & Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   {tasks && tasks.length > 0 ? (
                     <div className="space-y-3">
                       {tasks.map((task) => (
                         <div key={task.id} className="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                           <div className="flex items-start justify-between gap-4">
                             <div className="flex items-start gap-3">
                               {task.is_completed ? (
                                 <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                               ) : (
                                 <Circle className="w-5 h-5 text-gray-500 mt-1" />
                               )}
                               <div>
                                 <h4 className={`font-medium ${task.is_completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                                   {task.title}
                                 </h4>
                                 {task.description && (
                                   <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                                 )}
                                 {task.due_date && (
                                   <div className="flex items-center gap-2 mt-2 text-xs text-blue-400">
                                     <Clock className="w-3 h-3" />
                                     Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                                   </div>
                                 )}
                               </div>
                             </div>
                             <Badge variant="outline" className={task.is_completed ? "border-green-500/30 text-green-500" : "border-gray-500/30 text-gray-400"}>
                               {task.is_completed ? 'Completed' : 'Pending'}
                             </Badge>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p>No tasks assigned yet</p>
                     </div>
                   )}
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Reviews ({reviews?.length || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-white/10 pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.reviewer?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                              {review.reviewer?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-white">
                                {review.reviewer?.full_name || "Anonymous"}
                              </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-400">
                              {review.comment}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Total Sessions
                  </span>
                  <span className="text-white font-medium">
                    {tutor.total_sessions || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Rating
                  </span>
                  <span className="text-white font-medium">
                    {tutor.average_rating?.toFixed(1) || "N/A"} / 5.0
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Status
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      tutor.is_available
                        ? "border-green-500/50 text-green-400"
                        : "border-red-500/50 text-red-400"
                    }
                  >
                    {tutor.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                <Separator className="bg-white/10" />

                {/* Enable Booking via Dialog */}
                {hasActiveRelationship && (
                  <div className="space-y-2">
                    <CreateSessionDialog tutorId={tutorID} studentId={user.id} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relationship Status Card */}
            {hasActiveRelationship && (
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-medium text-sm mb-1">
                        Active Student
                      </p>
                      <p className="text-green-500/60 text-xs">
                        You are currently learning with this tutor
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isPending && (
               <Card className="bg-yellow-500/5 border-yellow-500/20">
               <CardContent className="p-4">
                 <div className="flex items-start gap-3">
                   <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                   <div>
                     <p className="text-yellow-400 font-medium text-sm mb-1">
                       Request Sent
                     </p>
                     <p className="text-yellow-500/60 text-xs">
                       Waiting for tutor approval. You will be notified once they accept.
                     </p>
                   </div>
                 </div>
               </CardContent>
             </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}