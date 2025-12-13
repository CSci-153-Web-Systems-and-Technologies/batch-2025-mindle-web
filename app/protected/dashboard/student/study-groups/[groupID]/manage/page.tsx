// file: app/(protected)/dashboard/student/study-groups/[groupID]/manage/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Trash2, 
  Save, 
  Loader2, 
  ArrowLeft,
  Users,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export default function ManageStudyGroupPage({ 
  params 
}: { 
  params: Promise<{ groupID: string }> 
}) {
  const resolvedParams = use(params);
  const { groupID } = resolvedParams;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    subject: "",
    max_members: 10,
    meeting_schedule: "",
    meeting_link: "",
    is_public: true,
    requires_approval: false,
  });

  useEffect(() => {
    fetchGroupData();
  }, [groupID]);

  const fetchGroupData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: group, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupID)
        .single();

      if (error) throw error;

      // Check if user is the creator
      if (group.creator_id !== user.id) {
        alert("Only the group creator can manage this group");
        router.push(`/protected/dashboard/student/study-groups/view?id=${groupID}`);
        return;
      }

      setIsCreator(true);
      setGroupData({
        name: group.name,
        description: group.description || "",
        subject: group.subject,
        max_members: group.max_members,
        meeting_schedule: group.meeting_schedule || "",
        meeting_link: group.meeting_link || "",
        is_public: group.is_public,
        requires_approval: group.requires_approval,
      });
    } catch (error) {
      console.error("Error fetching group:", error);
      alert("Failed to load group data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('study_groups')
        .update({
          ...groupData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupID);

      if (error) throw error;

      alert("Group updated successfully!");
      router.push(`/protected/dashboard/student/study-groups/view?id=${groupID}`);
    } catch (error: any) {
      console.error("Error updating group:", error);
      alert(error.message || "Failed to update group");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete all members first
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupID);

      // Delete the group
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupID);

      if (error) throw error;

      alert("Group deleted successfully");
      router.push('/protected/dashboard/student/study-groups');
    } catch (error: any) {
      console.error("Error deleting group:", error);
      alert(error.message || "Failed to delete group");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isCreator) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/protected/dashboard/student/study-groups/view?id=${groupID}`}
            className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors w-fit mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Group
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" />
            Manage Study Group
          </h1>
          <p className="text-gray-400">
            Update group settings or delete the group
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Group Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={groupData.name}
                  onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                  className="bg-black/20 border-white/10 text-white"
                  placeholder="e.g., Advanced Calculus Warriors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white">
                  Subject <span className="text-red-400">*</span>
                </Label>
                <select
                  id="subject"
                  value={groupData.subject}
                  onChange={(e) => setGroupData({ ...groupData, subject: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject} className="bg-[#13132B]">
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={groupData.description}
                  onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                  className="bg-black/20 border-white/10 text-white min-h-[100px]"
                  placeholder="What will you be studying? Any prerequisites?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_members" className="text-white">
                    Max Members
                  </Label>
                  <Input
                    id="max_members"
                    type="number"
                    min="2"
                    max="50"
                    value={groupData.max_members}
                    onChange={(e) => setGroupData({ ...groupData, max_members: parseInt(e.target.value) })}
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_schedule" className="text-white">
                    Meeting Schedule
                  </Label>
                  <Input
                    id="meeting_schedule"
                    value={groupData.meeting_schedule}
                    onChange={(e) => setGroupData({ ...groupData, meeting_schedule: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="e.g., Mondays at 4pm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link" className="text-white">
                  Meeting Link (Optional)
                </Label>
                <Input
                  id="meeting_link"
                  value={groupData.meeting_link}
                  onChange={(e) => setGroupData({ ...groupData, meeting_link: e.target.value })}
                  className="bg-black/20 border-white/10 text-white"
                  placeholder="https://zoom.us/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Public Group</p>
                  <p className="text-sm text-gray-400">
                    Anyone can see and join this group
                  </p>
                </div>
                <Switch
                  checked={groupData.is_public}
                  onCheckedChange={(checked) => setGroupData({ ...groupData, is_public: checked })}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Require Approval</p>
                  <p className="text-sm text-gray-400">
                    New members need your approval to join
                  </p>
                </div>
                <Switch
                  checked={groupData.requires_approval}
                  onCheckedChange={(checked) => setGroupData({ ...groupData, requires_approval: checked })}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/protected/dashboard/student/study-groups/view?id=${groupID}`)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>

              <Separator className="bg-white/10" />

              {/* Danger Zone */}
              <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Danger Zone</h3>
                    <p className="text-sm text-gray-400">
                      Deleting a group is permanent and cannot be undone. All members will be removed.
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-[#1E1E3F] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Delete Study Group?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete the group
                and remove all members. Are you absolutely sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Group"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}