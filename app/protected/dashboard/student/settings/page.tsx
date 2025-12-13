// file: app/(protected)/dashboard/student/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, User, Bell, Lock, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [profileData, setProfileData] = useState({
    full_name: "",
    username: "",
    bio: "",
    location: "",
    phone: "",
    timezone: "UTC",
    preferred_language: "en",
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    push: true,
    email: true,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfileData({
          full_name: profile.full_name || "",
          username: profile.username || "",
          bio: profile.bio || "",
          location: profile.location || "",
          phone: profile.phone || "",
          timezone: profile.timezone || "UTC",
          preferred_language: profile.preferred_language || "en",
        });
        setNotificationPrefs(profile.notification_preferences || { push: true, email: true });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Log the update attempt
      console.log("Attempting to update profile:", profileData);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          username: profileData.username,
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone,
          timezone: profileData.timezone,
          preferred_language: profileData.preferred_language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Profile updated successfully:", data);
      alert("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert(error.message || error.hint || "Failed to save profile. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notificationPrefs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert("Notification preferences updated!");
    } catch (error: any) {
      console.error("Error saving notifications:", error);
      alert(error.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
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
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-gray-400" />
            Settings
          </h1>
          <p className="text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-white">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="bg-black/20 border-white/10 text-white min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="City, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">Timezone</Label>
                  <Input
                    id="timezone"
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-white">Preferred Language</Label>
                  <select
                    id="language"
                    value={profileData.preferred_language}
                    onChange={(e) => setProfileData({ ...profileData, preferred_language: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="en" className="bg-[#13132B]">English</option>
                    <option value="es" className="bg-[#13132B]">Spanish</option>
                    <option value="fr" className="bg-[#13132B]">French</option>
                    <option value="de" className="bg-[#13132B]">German</option>
                  </select>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-400">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.push}
                  onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, push: checked })}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.email}
                  onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email: checked })}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>

              <Separator className="bg-white/10" />

              <Button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                Password management and security settings coming soon.
              </p>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}