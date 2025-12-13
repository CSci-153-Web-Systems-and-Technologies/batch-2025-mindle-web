import Background from "@/components/bg";
import Footer from "@/components/footer";
import Link from "next/link";
import { Rocket, Users, BookOpen, Award } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";

export default function AboutPage() {
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
            <Link href="/marketing/study-groups" className="hover:text-blue-400 transition">Study Groups</Link>
            <Link href="/marketing/about" className="text-blue-400">About</Link>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-blue-400">Mindle</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're on a mission to make learning accessible, collaborative, and engaging for everyone across the universe.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 mb-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Mindle connects learners with expert tutors and collaborative study groups. Whether you're mastering a new skill, preparing for exams, or exploring a passion, we provide the tools and community to help you succeed. We believe that learning should be a journey shared with others, not a solitary struggle.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Expert Tutors</h3>
              <p className="text-gray-400">
                Connect with qualified tutors across hundreds of subjects. Get personalized one-on-one guidance tailored to your learning style.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Study Groups</h3>
              <p className="text-gray-400">
                Join or create study groups with peers who share your learning goals. Collaborate, discuss, and grow together.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Flexible Learning</h3>
              <p className="text-gray-400">
                Learn on your schedule with flexible session times and both online and in-person options available.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Track Progress</h3>
              <p className="text-gray-400">
                Monitor your learning journey with session tracking, reviews, and personalized progress insights.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of learners and tutors already using Mindle to achieve their goals.
            </p>
            <Link href="/auth/sign-up" className="inline-block px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}