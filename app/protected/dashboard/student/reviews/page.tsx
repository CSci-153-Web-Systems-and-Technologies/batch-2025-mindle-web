// file: app/(protected)/dashboard/student/reviews/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Star, Calendar, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ReviewsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch reviews written by this student
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewee:profiles!reviews_reviewee_id_fkey(full_name, avatar_url),
      session:tutoring_sessions(subject, scheduled_at)
    `)
    .eq('reviewer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
  }

  // Calculate average rating given
  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            My Reviews
          </h1>
          <p className="text-gray-400">
            Reviews you've written for tutors
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {reviews?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Average Rating Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white flex items-center gap-2">
                {averageRating}
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {!reviews || reviews.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No reviews yet</p>
              <p className="text-gray-600 text-sm mb-6">
                Complete sessions with tutors to leave reviews
              </p>
              <Link href="/protected/dashboard/student/tutors">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Find Tutors
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Card
                key={review.id}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Link href={`/protected/dashboard/student/tutors/${review.reviewee_id}`}>
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={review.reviewee?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xl">
                          {review.reviewee?.full_name?.charAt(0) || "T"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link 
                            href={`/protected/dashboard/student/tutors/${review.reviewee_id}`}
                            className="text-lg font-semibold text-white hover:text-purple-300 transition"
                          >
                            {review.reviewee?.full_name || "Anonymous Tutor"}
                          </Link>
                          {review.session?.subject && (
                            <p className="text-sm text-gray-400 mt-1">
                              Session: {review.session.subject}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {review.comment && (
                        <div className="bg-black/20 rounded-lg p-4 mb-3">
                          <p className="text-gray-300 leading-relaxed">
                            "{review.comment}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            review.is_visible
                              ? "border-green-500/50 text-green-400"
                              : "border-gray-500/50 text-gray-400"
                          }
                        >
                          {review.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}