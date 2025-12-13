import Background from "@/components/bg";
import Footer from "@/components/footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TutorSearch from "@/components/tutor-search";

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

export default async function FindTutorsPage() {
  const supabase = await createClient();
  
  // Fetch initial tutors (first 12)
  const { data: tutors, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, subjects_of_expertise, average_rating, total_sessions, location')
    .eq('role', 'tutor')
    .eq('is_available', true)
    .order('average_rating', { ascending: false })
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
            <Link href="/marketing/find-tutors" className="text-blue-400">Find Tutors</Link>
            <Link href="/marketing/study-groups" className="hover:text-blue-400 transition">Study Groups</Link>
            <Link href="/marketing/about" className="hover:text-blue-400 transition">About</Link>
            <Link href="/auth/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Find Your Perfect <span className="text-blue-400">Tutor</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Browse expert tutors across hundreds of subjects. Get personalized learning support tailored to your goals.
          </p>
        </div>

        {/* Search Component */}
        <TutorSearch initialTutors={tutors || []} />
      </section>

      <Footer />
    </main>
  );
}