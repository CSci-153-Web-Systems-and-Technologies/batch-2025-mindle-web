"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc"
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Destructure 'data' to access the user object
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.refresh(); // Sync server/middleware with new session

      // 2. Get the role from metadata
      // The "?." checks ensure the app doesn't crash if metadata is missing
      const role = data.user?.user_metadata?.role;

      // 3. Redirect based on role
      if (role === 'student') {
        router.push("/protected/dashboard/student");
      } else if (role === 'tutor') {
        router.push("/protected/dashboard/tutor");
      } else if (role === 'both') {
      router.push("/protected/dashboard/both");
      } else {
        // Default fallback (e.g. for students or users with no role)
        router.push("/protected/dashboard"); 
      }

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center items-center w-full", className)} {...props}>
      {/* Main Glass Container */}
      <div className="flex flex-col md:flex-row bg-[#13132B]/20 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-2xl w-full border border-white/5">
        
        {/* Left Gradient Column */}
        <div className="relative hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600/80 to-pink-500/80 items-center justify-center p-12">
          <Link href={"/"}>
          <Image
            src={"/astronaut.png"}
            alt="Astronaut Icon"
            width={400} 
            height={400}
            className="opacity-80"
          />
          </Link>
        </div>

        {/* Right Form Column */}
        <div className="w-full md:w-1/2 p-8 md:px-12 md:py-16 bg-transparent">
          <div className="flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex flex-col gap-2 text-center mb-2">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-gray-400 text-sm">
                Sign in to continue your learning journey
              </p>
            </div>

            <form onSubmit={handleLogin} className="grid gap-5">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1E1E3F] border-[#2E2E5F] text-white placeholder:text-gray-500 rounded-xl h-12 focus-visible:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1E1E3F] border-[#2E2E5F] text-white placeholder:text-gray-500 rounded-xl h-12 focus-visible:ring-blue-500"
                />
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white" />
                  <Label htmlFor="remember" className="text-gray-300 text-sm font-normal cursor-pointer">Remember me</Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Login Button */}
              <Button type="submit" className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl h-12 text-base font-bold mt-2" disabled={isLoading}>
                {isLoading ? "Logging in..." : "LOGIN"}
              </Button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#13132B] px-4 text-gray-400">or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <Button variant="outline" type="button" className="w-full bg-[#1E1E3F] border-[#2E2E5F] text-white hover:bg-[#2E2E5F]/80 hover:text-white rounded-xl h-12 gap-3 font-medium">
                <FcGoogle className="w-5 h-5" />
                Google
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-400 mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}