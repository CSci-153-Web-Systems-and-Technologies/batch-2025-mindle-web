"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Search, Globe, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BrowseGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const supabase = createClient();
    
    // Fetch ONLY public groups
    const { data, error } = await supabase
      .from("study_groups")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGroups(data);
    }
    setLoading(false);
  };

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Back Link */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/protected/dashboard/student/study-groups" 
          className="flex items-center text-gray-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Groups
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Browse Public Groups</h1>
          <p className="text-gray-400">Find a community to study with.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        <Input 
          placeholder="Search by name or subject..." 
          className="pl-10 bg-[#13132B]/50 border-white/10 text-white focus:border-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-gray-400">Loading public groups...</p>
        ) : filteredGroups.length === 0 ? (
           <p className="text-gray-400">No public groups found matching "{searchTerm}".</p>
        ) : (
          filteredGroups.map((group) => (
            <Card key={group.id} className="bg-[#1E1E3F]/50 backdrop-blur-md border-white/10 hover:border-purple-500/50 transition flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 hover:bg-purple-500/20">
                    {group.subject}
                  </Badge>
                  <Globe className="w-4 h-4 text-green-400" />
                </div>
                <CardTitle className="text-white text-xl">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-2">
                  {group.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="text-sm text-gray-500">
                    <span className="text-white font-medium">{group.members_count}</span> members
                  </div>
                  
                  <Link href={`/protected/dashboard/student/study-groups/view?id=${group.id}`}>
                    <Button size="sm" className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                      View Group <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}