import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell, Calendar, MessageSquare, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function NotificationsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Group by read status
  const unreadNotifications = notifications?.filter(n => !n.is_read) || [];
  const readNotifications = notifications?.filter(n => n.is_read) || [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_request':
      case 'session_confirmed':
      case 'session_reminder':
        return <Calendar className="w-5 h-5 text-green-400" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'group_invite':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'review_received':
        return <Star className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-red-400" />
            Notifications
          </h1>
          <p className="text-gray-400">
            Stay updated with your learning activities
          </p>
        </div>

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              New Notifications
              <Badge variant="outline" className="border-red-500/50 text-red-400">
                {unreadNotifications.length}
              </Badge>
            </h2>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-white/5 transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Earlier
            </h2>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {readNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-white/5 transition opacity-60"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {notifications && notifications.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No notifications yet</p>
              <p className="text-gray-600 text-sm">
                We'll notify you about sessions, messages, and group activities
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}