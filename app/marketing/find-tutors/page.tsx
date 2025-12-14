import { Suspense } from "react";
import Background from "@/components/bg";
import Footer from "@/components/footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TutorSearch from "@/components/tutor-search";

// --- 1. The Async Component that fetches data ---
// This component performs the fetch and will be "streamed" in.
async function TutorResults() {
  const supabase = await createClient();

  const { data: tutors, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, subjects_of_expertise, average_rating, total_sessions, location')
    .eq('role', 'tutor')
    .eq('is_available', true)
    .order('average_rating', { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching tutors:", error);
    // You could return an error message UI here if you want
  }

  return <TutorSearch initialTutors={tutors || []} />;
}

// --- 2. The Loading Fallback ---
// This is what users see while the database is connecting
function TutorsLoading() {
  return (
    <div className="w-full text-center py-20">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="mt-4 text-gray-400">Finding expert tutors...</p>
    </div>
  );
}

// --- 3. The Main Page Shell ---
export default function FindTutorsPage() {
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
      <section className="px-4 py-12 flex-grow">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Find Your Perfect <span className="text-blue-400">Tutor</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Browse expert tutors across hundreds of subjects. Get personalized learning support tailored to your goals.
          </p>
        </div>

        {/* Search Component Wrapper
            We wrap the async component in Suspense so the page shell loads first.
        */}
        <Suspense fallback={<TutorsLoading />}>
          <TutorResults />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}