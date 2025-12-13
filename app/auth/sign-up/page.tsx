import { SignUpForm } from "@/components/sign-up-form";
import Background from "@/components/bg";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-6xl">
        <Background />
        <SignUpForm />
      </div>
    </div>
  );
}
