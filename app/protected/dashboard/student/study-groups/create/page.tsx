"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Users, Calendar, Lock, Globe, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const SUBJECTS = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature",
  "History",
  "Languages",
  "Other",
];

export default function CreateStudyGroupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    max_members: "5",
    meeting_schedule: "",
    is_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("You must be logged in.");

      const { data: group, error: groupError } = await supabase
        .from("study_groups")
        .insert({
          name: formData.name,
          subject: formData.subject,
          description: formData.description,
          max_members: parseInt(formData.max_members),
          meeting_schedule: formData.meeting_schedule,
          is_public: formData.is_public,
          creator_id: user.id,
          members_count: 1 
        })
        .select()
        .single();

      if (groupError) throw groupError;

      router.refresh();
      router.push(`/protected/dashboard/student/study-groups/view?id=${group.id}`);

    } catch (error: any) {
      console.error("Error creating group:", error);
      alert(error.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/protected/dashboard/student/study-groups"
          className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>
      </div>

      <Card className="bg-[#13132B]/50 backdrop-blur-md border-white/10 shadow-xl">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Create Study Group</CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Start a new learning community and invite your peers
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Group Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                required
                placeholder="e.g., Advanced Calculus Warriors"
                className="bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">
                  Subject <span className="text-red-400">*</span>
                </Label>
                <Select 
                  required 
                  onValueChange={(val) => setFormData({ ...formData, subject: val })}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E3F] border-white/10 text-white">
                    {SUBJECTS.map((subject) => (
                      <SelectItem 
                        key={subject} 
                        value={subject}
                        className="focus:bg-white/10 focus:text-white"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max" className="text-white">Max Members</Label>
                <Input
                  id="max"
                  type="number"
                  min="2"
                  max="50"
                  required
                  className="bg-black/20 border-white/10 text-white"
                  value={formData.max_members}
                  onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc" className="text-white">Description</Label>
              <Textarea
                id="desc"
                placeholder="What will you be studying? Any prerequisites?"
                className="bg-black/20 border-white/10 text-white min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule" className="text-white">Meeting Schedule (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  id="schedule"
                  placeholder="e.g., Mondays at 4pm, Weekends"
                  className="pl-9 bg-black/20 border-white/10 text-white"
                  value={formData.meeting_schedule}
                  onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.is_public ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {formData.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {formData.is_public ? 'Public Group' : 'Private Group'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formData.is_public 
                      ? 'Anyone can see and join this group.' 
                      : 'Only invited members can join.'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Group...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
