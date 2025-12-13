import Link from "next/link";
import { Users, BookOpen } from "lucide-react";

interface StudyGroup {
  id: number;
  name: string;
  description: string | null;
  subject: string;
  members_count: number;
  max_members: number;
  is_public: boolean;
}

interface GroupCardProps {
  group: StudyGroup;
}

export default function GroupCard({ group }: GroupCardProps) {
  const isFull = group.members_count >= group.max_members;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition mb-1">
            {group.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
              {group.subject}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {group.description || "No description available"}
      </p>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{group.members_count}/{group.max_members} members</span>
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{group.is_public ? "Public" : "Private"}</span>
        </div>
      </div>

      {isFull && (
        <div className="mb-3 text-yellow-400 text-sm font-medium">Group is full</div>
      )}

      <Link 
        href={`/protected/study-groups/${group.id}`} 
        className={`block w-full py-2 text-center rounded-lg font-medium transition ${
          isFull 
            ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
            : "bg-purple-500 hover:bg-purple-600 text-white"
        }`}
      >
        {isFull ? "View Group" : "Join Group"}
      </Link>
    </div>
  );
}