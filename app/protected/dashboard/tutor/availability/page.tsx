// file: app/(protected)/dashboard/tutor/availability/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface Availability {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function TutorAvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tutor_availability')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setAvailability(prev =>
        prev.map(slot =>
          slot.id === id ? { ...slot, is_available: !currentStatus } : slot
        )
      );
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability");
    }
  };

  const deleteSlot = async (id: number) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;

    try {
      const { error } = await supabase
        .from('tutor_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailability(prev => prev.filter(slot => slot.id !== id));
    } catch (error) {
      console.error("Error deleting slot:", error);
      alert("Failed to delete time slot");
    }
  };

  const getDayLabel = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            Availability
          </h1>
          <p className="text-gray-400">
            Set your available hours for tutoring sessions
          </p>
        </div>

        {/* Add New Slot Button */}
        <div className="mb-6">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>

        {/* Availability List */}
        {availability.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No availability set</p>
              <p className="text-gray-600 text-sm mb-6">
                Add time slots to let students know when you're available
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Time Slot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = availability.filter(slot => slot.day_of_week === day.value);
              
              if (daySlots.length === 0) return null;

              return (
                <Card key={day.value} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">
                      {day.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <Clock className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-white font-medium">
                                {slot.start_time} - {slot.end_time}
                              </p>
                              <p className="text-sm text-gray-400">
                                {slot.is_available ? "Available" : "Unavailable"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">Active</span>
                              <Switch
                                checked={slot.is_available}
                                onCheckedChange={() => toggleAvailability(slot.id, slot.is_available)}
                                className="data-[state=checked]:bg-green-500"
                              />
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteSlot(slot.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">How it works</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Set your available hours for each day of the week. Students will only be able to book sessions during your available time slots. You can toggle slots on/off without deleting them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}