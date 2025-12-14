import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch the user's role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // If fetching the profile or role fails, redirect to a safe fallback
  if (error || !profile) {
    console.error("Error fetching user role:", error);
    redirect("/auth/login?error=role_missing");
  }

  const role = user.user_metadata?.role?.toLowerCase();

  switch (role) {
    case "student":
      redirect("/protected/dashboard/student");
      
    case "tutor":
      redirect("/protected/dashboard/tutor");
      
    case "both":
      redirect("/protected/dashboard/both");
    // Add admin  
    default:
      // If role is missing/unknown, send them to student as a fallback
      // instead of kicking them out.
      console.log("Unknown role:", role);
      redirect("/protected/dashboard/student");
  }
}