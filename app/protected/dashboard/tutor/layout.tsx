// file: app/(protected)/dashboard/tutor/layout.tsx
import Link from "next/link";
import { Suspense } from "react";
import { 
  LayoutDashboard,
  MessageSquare, 
  Users, 
  Calendar,
  Bell, 
  Settings, 
  User,
  Star,
  BookOpen
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a16] flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-black/20 backdrop-blur-sm border-r border-white/10 p-6 fixed left-0 top-0">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <img src="/logo.png" alt="Mindle" className="w-8 h-8" />
            <span>Mindle</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Tutor Dashboard</p>
        </div>

        <nav className="space-y-2">
          <Link 
            href="/protected/dashboard/tutor" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/20 text-blue-400 font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link 
            href="/protected/dashboard/tutor/messages" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <MessageSquare className="w-5 h-5" />
            Messages
          </Link>

          <Suspense fallback={
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400">
              <Bell className="w-5 h-5" />
              Notifications
            </div>
          }>
            <TutorNotificationLink />
          </Suspense>

          <Link 
            href="/protected/dashboard/tutor/students" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Users className="w-5 h-5" />
            My Students
          </Link>

          <Link 
            href="/protected/dashboard/tutor/sessions" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Calendar className="w-5 h-5" />
            Sessions
          </Link>

          <Link 
            href="/protected/dashboard/tutor/availability" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <BookOpen className="w-5 h-5" />
            Availability
          </Link>

          <Link 
            href="/protected/dashboard/tutor/reviews" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <Star className="w-5 h-5" />
            Reviews
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/10">
          <Link 
            href="/protected/dashboard/tutor/profile" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>
          
          <Link 
            href="/protected/dashboard/tutor/settings" 
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

// Separate async component for notification count
async function TutorNotificationLink() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  
  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return (
    <Link 
      href="/protected/dashboard/tutor/notifications" 
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
  );
}