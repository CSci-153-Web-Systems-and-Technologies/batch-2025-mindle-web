import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import Background from '@/components/bg';
import Hero2 from "@/components/hero2";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col ">
      <Background />

      {/* Navigation */}
      <nav className="w-full  flex justify-center border-b border-b-foreground/10 h-16 px-8 bg-black/20 backdrop-blur-sm">
        <div className="w-full max-w-7xl flex justify-between items-center text-sm">
            <Link href="/" className="flex gap-3 items-center font-semibold text-white hover:text-blue-400 transition">
              <img src="/logo.png" alt="Mindle Logo" className="h-8 w-8" />
              <span>MINDLE</span>
            </Link>
          <div className="flex gap-6 items-center text-gray-300">
            <Link href="/marketing/find-tutors" className="hover:underline hover:text-blue-400 transition">Find Tutors</Link>
            <Link href="/marketing/study-groups" className="hover:underline hover:text-blue-400 transition">Study Groups</Link>
            <Link href="/marketing/about" className="hover:underline hover:text-blue-400 transition">About</Link>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col gap-20 max-w-7xl items-center mx-auto">
          <main className="flex-1 flex flex-col px-4">
            <section className="flex flex-col md:flex-row items-center justify-between gap-10 p-10">
  
              {/* Left Side: Text content */}
              <div className="flex-1 space-y-6 py-3">
                <h1 className="text-7xl font-bold text-white">
                  Where minds meet to <span className="text-blue-400">learn</span>
                </h1>
                <p className="text-xl text-gray-300">
                  Connect with tutors and study groups across the universe of knowledge. Explore subjects, share expertise, and launch your learning journey into orbit.
                </p>
                <button className="ml-1 px-9 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition">
                  Get Started
                </button>
              </div>

              {/* Right Side: Image placeholder */}
              <div className="flex-1 flex justify-center">
                <img src="lp.png" alt="hero illustration" className="h-auto w-5/6" />
              </div>

            </section>

            <Hero2 />
            
            <Testimonials />
          </main>
        </div>

        <footer className="w-full">
            <Footer />
        </footer>
    </main>
  );
}
