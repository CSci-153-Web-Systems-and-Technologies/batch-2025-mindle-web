import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function MessagesPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all conversations (grouped by sender)
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      sender_id,
      recipient_id,
      content,
      created_at,
      is_read,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(50);

  // Group messages by conversation partner
  const conversations = new Map<string, any>();
  
  messages?.forEach((msg: any) => {
    const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
    const partner = msg.sender_id === user.id ? msg.recipient : msg.sender;
    
    if (!conversations.has(partnerId)) {
      conversations.set(partnerId, {
        partner,
        lastMessage: msg,
        unreadCount: 0,
        messages: []
      });
    }
    
    const conv = conversations.get(partnerId);
    conv.messages.push(msg);
    
    // Count unread messages from this partner
    if (msg.recipient_id === user.id && !msg.is_read) {
      conv.unreadCount++;
    }
  });

  const conversationList = Array.from(conversations.values());

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            Messages
          </h1>
          <p className="text-gray-400">
            View and manage your conversations
          </p>
        </div>

        {/* Conversations List */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-0">
            {conversationList.length > 0 ? (
              <div className="divide-y divide-white/10">
                {conversationList.map((conv) => (
                  <Link
                    key={conv.partner.id}
                    href={`/protected/dashboard/student/messages/${conv.partner.id}`}
                    className="block p-4 hover:bg-white/5 transition"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conv.partner.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                          {conv.partner.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white">
                            {conv.partner.full_name || "Unknown User"}
                          </p>
                          <div className="flex items-center gap-2">
                            {conv.unreadCount > 0 && (
                              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                                {conv.unreadCount} new
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <p className={`text-sm line-clamp-2 ${
                          conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'
                        }`}>
                          {conv.lastMessage.sender_id === user.id ? 'You: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No messages yet</p>
                <p className="text-gray-600 text-sm">
                  Start a conversation with a tutor or study group member
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}