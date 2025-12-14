// file: app/(protected)/dashboard/tutor/settings/settings-client.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, User, Bell, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_available: boolean;
  subjects_of_expertise: string[] | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  timezone: string | null;
  preferred_language: string | null;
  notification_preferences: any;
};

export function SettingsClient({ profile }: { profile: Profile }) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    location: profile.location || "",
    timezone: profile.timezone || "UTC",
    preferred_language: profile.preferred_language || "en",
    is_available: profile.is_available,
  });

  const [subjects, setSubjects] = useState<string[]>(profile.subjects_of_expertise || []);
  const [newSubject, setNewSubject] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState({
    push: profile.notification_preferences?.push ?? true,
    email: profile.notification_preferences?.email ?? true,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        timezone: formData.timezone,
        preferred_language: formData.preferred_language,
        is_available: formData.is_available,
        subjects_of_expertise: subjects,
        notification_preferences: notificationPrefs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } else {
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      router.refresh();
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information and tutor profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-gray-300">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell students about yourself and your teaching experience..."
                  className="bg-white/5 border-white/10 text-white mt-2 min-h-[120px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="language" className="text-gray-300">Preferred Language</Label>
                  <Input
                    id="language"
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects of Expertise */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Subjects of Expertise</CardTitle>
              <CardDescription className="text-gray-400">
                Add subjects you can teach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                  placeholder="e.g., Mathematics, Physics, English"
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button type="button" onClick={addSubject} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Badge key={subject} className="bg-blue-500/20 text-blue-400 border-blue-500/50 px-3 py-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {subjects.length === 0 && (
                  <p className="text-gray-400 text-sm">No subjects added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Availability Status</CardTitle>
              <CardDescription className="text-gray-400">
                Toggle your availability for new sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div>
                  <p className="font-medium text-white">Available for Sessions</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Students can request sessions when you're available
                  </p>
                </div>
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div>
                  <p className="font-medium text-white">Push Notifications</p>
                  <p className="text-sm text-gray-400 mt-1">Receive push notifications in the app</p>
                </div>
                <Switch
                  checked={notificationPrefs.push}
                  onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, push: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-gray-400 mt-1">Receive email notifications</p>
                </div>
                <Switch
                  checked={notificationPrefs.email}
                  onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-lg"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}