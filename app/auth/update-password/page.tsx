import { UpdatePasswordForm } from "@/components/update-password-form";
import Background from "@/components/bg";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Background />
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
