// file: app/(protected)/dashboard/student/tutors/[tutorID]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  MessageSquare,
  Heart,
  ArrowLeft,
  BookOpen,
  UserPlus,
  CheckCircle2,
  ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import TutorActions from "./tutor-actions";
import RequestStudentButton from "./request-student-button";

interface PageProps {
  params: Promise<{ tutorID: string }>;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "completed";
  type: "homework" | "quiz";
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

  // Fetch tutor profile
  const { data: tutor, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', tutorID)
    .single();

  if (error || !tutor) {
    return notFound();
  }

  // Fetch reviews for this tutor
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

  // Check if student has active relationship with tutor
  const { data: existingSessions } = await supabase
    .from('tutoring_sessions')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('tutor_id', tutorID)
    .limit(1);

  const hasRelationship = existingSessions && existingSessions.length > 0;

  // If has relationship, fetch assignments/tasks
  let assignments: Assignment[] = [];
  if (hasRelationship) {
    // For now, we'll create a placeholder structure
    // make an assignments table
    assignments = [
      {
        id: 1,
        title: "Complete Chapter 5 Exercises",
        description: "Work through problems 1-20 in the calculus textbook",
        due_date: "2025-01-15",
        status: "pending",
        type: "homework"
      },
      {
        id: 2,
        title: "Weekly Quiz - Derivatives",
        description: "Quiz covering derivative rules and applications",
        due_date: "2025-01-18",
        status: "completed",
        type: "quiz"
      }
    ];
  }

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
                      {!hasRelationship && (
                        <RequestStudentButton tutorId={tutorID} studentId={user.id} />
                      )}
                      {hasRelationship && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Your Tutor
                        </Badge>
                      )}
                      <TutorActions tutorId={tutorID} userId={user.id} />
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

            {/* Subjects */}
            {tutor.subjects_of_expertise && tutor.subjects_of_expertise.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Subjects of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects_of_expertise.map((subject: string) => (
                      <Badge
                        key={subject}
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 px-4 py-2"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assignments/Tasks - Only visible if student has relationship */}
            {hasRelationship && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-400" />
                    Assignments & Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignments.length > 0 ? (
                    <div className="space-y-3">
                      {assignments.map((assignment: any) => (
                        <div
                          key={assignment.id}
                          className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-purple-500/30 transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">
                                {assignment.title}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {assignment.description}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                assignment.status === 'completed'
                                  ? "border-green-500/50 text-green-400"
                                  : "border-orange-500/50 text-orange-400"
                              }
                            >
                              {assignment.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                              {assignment.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No assignments yet
                    </p>
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

                {hasRelationship && (
                  <div className="space-y-2">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relationship Status Card */}
            {hasRelationship && (
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
          </div>
        </div>
      </div>
    </div>
  );
}