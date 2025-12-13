// file: app/(protected)/dashboard/student/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  MessageSquare, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Bell, 
  Settings, 
  User 
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  /* // Verify user has student or both role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'student' && profile.role !== 'both')) {
    redirect("/protected/dashboard");
  } */

  // Count unread notifications
  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return (
    <div className="min-h-screen bg-[#0a0a16] flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-black/20 backdrop-blur-sm border-r border-white/10 p-6 fixed left-0 top-0">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <img src="/logo.png" alt="Mindle" className="w-8 h-8" />
            <span>Mindle</span>
          </Link>
        </div>

        <nav className="space-y-2">
          <Link 
            href="/protected/dashboard/student" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/20 text-blue-400 font-medium"
          >
            <TrendingUp className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link 
            href="/protected/dashboard/student/messages" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <MessageSquare className="w-5 h-5" />
            Messages
          </Link>

          <Link 
            href="/protected/dashboard/student/notifications" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Bell className="w-5 h-5" />
            Notifications
            {(unreadNotifications ?? 0) > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Link 
            href="/protected/dashboard/student/tutors" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <BookOpen className="w-5 h-5" />
            Tutors
          </Link>

          <Link 
            href="/protected/dashboard/student/study-groups" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Users className="w-5 h-5" />
            Study Groups
          </Link>

          <Link 
            href="/protected/dashboard/student/progress" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <TrendingUp className="w-5 h-5" />
            Progress
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/10">
          <Link 
            href="/protected/dashboard/student/profile" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>
          
          <Link 
            href="/protected/dashboard/student/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>

          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}