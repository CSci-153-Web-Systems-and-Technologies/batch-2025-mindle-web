import Background from "@/components/bg";
import Footer from "@/components/footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GroupCard from "@/components/group-card";

interface StudyGroup {
  id: number;
  name: string;
  description: string | null;
  subject: string;
  members_count: number;
  max_members: number;
  is_public: boolean;
  creator_id: string;
  created_at: string;
}

export default async function StudyGroupsPage() {
  const supabase = await createClient();
  
  const { data: groups, error } = await supabase
    .from('study_groups')
    .select('*')
    .eq('is_public', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <main className="min-h-screen flex flex-col">
      <Background />
      
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 px-8 bg-black/20 backdrop-blur-sm">
        <div className="w-full max-w-7xl flex justify-between items-center text-sm">
          <Link href="/" className="flex gap-3 items-center font-semibold text-white hover:text-blue-400 transition">
            <img src="/logo.png" alt="Mindle Logo" className="h-8 w-8" />
            <span>MINDLE</span>
          </Link>
          <div className="flex gap-6 items-center text-gray-300">
            <Link href="/marketing/find-tutors" className="hover:text-blue-400 transition">Find Tutors</Link>
            <Link href="/marketing/study-groups" className="text-blue-400">Study Groups</Link>
            <Link href="/marketing/about" className="hover:text-blue-400 transition">About</Link>
            <Link href="/auth/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Join a <span className="text-purple-400">Study Group</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Connect with peers, collaborate on projects, and achieve your learning goals together.
          </p>
          <Link href="/auth/sign-up" className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium">
            Create Your Group
          </Link>
        </div>

        {/* Groups Grid */}
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-400">Error loading study groups. Please try again later.</p>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No study groups available yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}