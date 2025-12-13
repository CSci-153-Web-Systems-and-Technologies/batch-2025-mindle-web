"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student"); // Changed default from "learner" to "student"
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected/dashboard`,
          data: {
            role: role,
            full_name: fullName || email.split('@')[0], // Use email username if no name provided
          },
        },
      });

      if (error) throw error;

      // Optional: Verify the profile was created
      if (data.user) {
        console.log("User created with role:", role);
        console.log("User ID:", data.user.id);
      }

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      console.error("Signup error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      console.error("Google signup error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center items-center w-full", className)} {...props}>
      <div className="flex flex-col md:flex-row bg-[#13132B]/20 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-2xl w-full border border-white/5">
        
        {/* Left Gradient Column (Astronaut) */}
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
        <div className="w-full md:w-1/2 p-8 md:px-12 md:py-8 bg-transparent">
          <div className="flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex flex-col gap-2 text-center mb-2">
              <h1 className="text-3xl font-bold text-white">Create Account</h1>
              <p className="text-gray-400 text-sm">
                Join us and start learning today
              </p>
            </div>

            <form onSubmit={handleSignUp} className="grid gap-5">
              
              {/* Full Name (Optional but recommended) */}
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-white font-medium">
                  Full Name <span className="text-gray-500 text-xs">(optional)</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[#1E1E3F]/50 border-[#2E2E5F] text-white placeholder:text-gray-500 rounded-xl h-12 focus-visible:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1E1E3F]/50 border-[#2E2E5F] text-white placeholder:text-gray-500 rounded-xl h-12 focus-visible:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1E1E3F]/50 border-[#2E2E5F] text-white placeholder:text-gray-500 rounded-xl h-12 focus-visible:ring-blue-500"
                />
              </div>

              {/* Repeat Password */}
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-white font-medium">Confirm Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="bg-[#1E1E3F]/50 border-[#2E2E5F] text-white placeholder:text-gray-500 rounded-xl h-12 focus-visible:ring-blue-500"
                />
              </div>

              {/* Role Selection */}
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-white font-medium">I want to join as a</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-[#1E1E3F]/50 border border-[#2E2E5F] text-white rounded-xl h-12 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="student" className="bg-[#13132B]">Student</option>
                  <option value="tutor" className="bg-[#13132B]">Tutor</option>
                  <option value="both" className="bg-[#13132B]">Both (Tutor & Student)</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Sign Up Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl h-12 text-base font-bold mt-2" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-4 text-gray-400">or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleGoogleSignUp}
                className="w-full bg-[#1E1E3F]/50 border-[#2E2E5F] text-white hover:bg-[#2E2E5F]/80 hover:text-white rounded-xl h-12 gap-3 font-medium"
                disabled={isLoading}
              >
                <FcGoogle className="w-5 h-5" />
                Google
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}