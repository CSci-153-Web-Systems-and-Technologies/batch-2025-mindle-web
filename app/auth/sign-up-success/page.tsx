"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignUpSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timerInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Redirect timeout
    const redirectTimeout = setTimeout(() => {
      router.push("/auth/log-in");
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(timerInterval);
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#0a0a0f]">
      {/* Optional: Background gradient effect similar to dashboard */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0f] to-[#0a0a0f] -z-10" />

      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
            <CardHeader className="items-center pb-2">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">
                Account Created!
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Welcome to the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3 text-left">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-200">
                  We've sent a confirmation link to your email. Please verify your
                  account to continue.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Link href="/auth/log-in" className="w-full">
                <Button className="w-full bg-white text-black hover:bg-gray-200">
                  Go to Login <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Redirecting in {countdown} seconds...
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}