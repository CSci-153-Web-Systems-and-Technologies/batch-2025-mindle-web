// file: app/(protected)/dashboard/student/messages/[userID]/page.tsx
"use client";

import { useEffect, useState, useRef, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  MessageSquare 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export default function ChatPage({ params }: { params: Promise<{ userID: string }> }) {
  const resolvedParams = use(params);
  const { userID } = resolvedParams;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    initializeChat();
  }, [userID]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setCurrentUserId(user.id);

      // Fetch other user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userID)
        .single();

      setOtherUser(profile);

      // Fetch messages
      await fetchMessages(user.id);

      // Mark messages as read
      await markMessagesAsRead(user.id);

      // Subscribe to new messages
      const channel = supabase
        .channel(`chat-${user.id}-${userID}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new.sender_id === userID) {
              setMessages((prev) => [...prev, payload.new as Message]);
              markMessagesAsRead(user.id);
            }
          }
        )
        .subscribe();

      setIsLoading(false);

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error initializing chat:", error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${userID}),and(sender_id.eq.${userID},recipient_id.eq.${userId})`)
      .eq('message_type', 'direct')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async (userId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .eq('sender_id', userID)
      .eq('is_read', false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !currentUserId) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: userID,
          content: newMessage.trim(),
          message_type: 'direct',
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="max-w-5xl mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/protected/dashboard/student/messages"
            className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Link>

          {otherUser && (
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherUser.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                  {otherUser.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {otherUser.full_name || "Unknown User"}
                </h1>
                <p className="text-sm text-gray-400">Active now</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Card */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 flex-1 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={`text-xs ${
                            isOwn 
                              ? 'bg-purple-500/20 text-purple-300' 
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {isOwn ? 'You' : otherUser?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-black/20 border-white/10 text-white"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}