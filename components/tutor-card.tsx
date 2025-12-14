import Link from "next/link";
import { Star, MapPin, BookOpen } from "lucide-react";

interface Tutor {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  subjects_of_expertise: string[];
  average_rating: number;
  total_sessions: number;
  location: string | null;
}

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition group">
      <div className="flex items-start gap-4 mb-4">
        {tutor.avatar_url ? (
          <img src={tutor.avatar_url} alt={tutor.full_name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            {tutor.full_name?.charAt(0) || "T"}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">{tutor.full_name}</h3>
          <p className="text-sm text-gray-400">@{tutor.username}</p>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{tutor.bio || "No bio available"}</p>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-white">{tutor.average_rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <BookOpen className="w-4 h-4" />
          <span>{tutor.total_sessions} sessions</span>
        </div>
      </div>

      {tutor.location && (
        <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{tutor.location}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {tutor.subjects_of_expertise?.slice(0, 3).map((subject, idx) => (
          <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
            {subject}
          </span>
        ))}
      </div>

      <Link href={`/protected/tutors/${tutor.id}`} className="block w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-lg font-medium transition">
        View Profile
      </Link>
    </div>
  );
}