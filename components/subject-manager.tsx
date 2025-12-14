"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface SubjectManagerProps {
  userId?: string;           // Required for editing, optional for read-only if data is passed
  initialSubjects?: string[]; // Pass data from server component to avoid client-side fetch
  readOnly?: boolean;        // If true, hides add/remove buttons
}

export function SubjectManager({ 
  userId, 
  initialSubjects = [], 
  readOnly = false 
}: SubjectManagerProps) {
  
  // Initialize state with passed data
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [newSubject, setNewSubject] = useState("");
  // Only show loading if we aren't read-only and don't have initial data
  const [loading, setLoading] = useState(!readOnly && initialSubjects.length === 0);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  // 1. Fetch subjects only if needed (Edit mode + no initial data)
  useEffect(() => {
    // If we are in read-only mode, or if data was passed down, don't fetch.
    if (readOnly || initialSubjects.length > 0 || !userId) {
      setLoading(false);
      return;
    }

    async function fetchSubjects() {
      const { data } = await supabase
        .from("profiles")
        .select("subjects_of_expertise")
        .eq("id", userId)
        .single();

      if (data) {
        setSubjects(data.subjects_of_expertise || []);
      }
      setLoading(false);
    }
    fetchSubjects();
  }, [userId, readOnly, initialSubjects, supabase]);

  // 2. Handle Adding
  const handleAddSubject = async () => {
    // Guard clause: prevent action if read-only
    if (readOnly || !userId) return;

    const trimmedSubject = newSubject.trim();
    if (!trimmedSubject) return;
    
    // Prevent duplicates
    if (subjects.map(s => s.toLowerCase()).includes(trimmedSubject.toLowerCase())) {
      toast.error("Subject already added");
      return;
    }

    const updatedSubjects = [...subjects, trimmedSubject];
    
    // Optimistic UI update
    setSubjects(updatedSubjects);
    setNewSubject("");
    
    await saveSubjects(updatedSubjects);
  };

  // 3. Handle Removing
  const handleRemoveSubject = async (subjectToRemove: string) => {
    if (readOnly || !userId) return;

    const updatedSubjects = subjects.filter((s) => s !== subjectToRemove);
    setSubjects(updatedSubjects);
    await saveSubjects(updatedSubjects);
  };

  // 4. Save to Supabase
  const saveSubjects = async (updatedList: string[]) => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ subjects_of_expertise: updatedList })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      toast.error("Error saving subjects");
      // Optional: Revert state here if strictly necessary
    } else {
      toast.success("Subjects updated");
    }
  };

  if (loading) return <Loader2 className="animate-spin h-6 w-6 text-gray-400" />;

  return (
    <div className="space-y-4 max-w-md">
      {/* HEADER & INPUT - Only show if NOT Read Only */}
      {!readOnly && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-lg">My Expertise</h3>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Calculus, Physics, React..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
              disabled={saving}
            />
            <Button onClick={handleAddSubject} disabled={!newSubject.trim() || saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </>
      )}

      {/* BADGE LIST */}
      <div className="flex flex-wrap gap-2 mt-4">
        {subjects.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            {readOnly ? "No subjects listed." : "No subjects added yet."}
          </p>
        )}
        
        {subjects.map((subject) => (
          <Badge 
            key={subject} 
            variant={readOnly ? "outline" : "secondary"} 
            className={`
              px-3 py-1 flex items-center gap-2 
              ${readOnly 
                ? "border-purple-500/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20" 
                : "bg-secondary text-secondary-foreground"
              }
            `}
          >
            {subject}
            
            {/* DELETE BUTTON - Only show if NOT Read Only */}
            {!readOnly && (
              <button
                onClick={() => handleRemoveSubject(subject)}
                className="hover:text-red-500 transition-colors ml-1 focus:outline-none"
                aria-label={`Remove ${subject}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}