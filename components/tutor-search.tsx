"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TutorCard from "@/components/tutor-card";
import { Search } from "lucide-react";

interface Tutor {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  subjects_of_expertise: string[];
  average_rating: number;
  total_sessions: number;
  location: string | null;
}

interface TutorSearchProps {
  initialTutors: Tutor[];
}

export default function TutorSearch({ initialTutors }: TutorSearchProps) {
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);
  const [searchName, setSearchName] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, subjects_of_expertise, average_rating, total_sessions, location')
        .eq('role', 'tutor')
        .eq('is_available', true);

      if (searchName.trim()) {
        query = query.or(`full_name.ilike.%${searchName}%,username.ilike.%${searchName}%`);
      }

      if (searchSubject.trim()) {
        query = query.contains('subjects_of_expertise', [searchSubject]);
      }

      const { data, error } = await query.order('average_rating', { ascending: false }).limit(12);

      if (error) throw error;
      setTutors(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchName || searchSubject) {
        handleSearch();
      } else {
        setTutors(initialTutors);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchName, searchSubject]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="bg-[#1E1E3F]/50 border-[#2E2E5F] text-white placeholder:text-gray-500"
            />
          </div>
          <div className="md:col-span-1">
            <Input
              type="text"
              placeholder="Search by subject..."
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
              className="bg-[#1E1E3F]/50 border-[#2E2E5F] text-white placeholder:text-gray-500"
            />
          </div>
          <div className="md:col-span-1">
            <Button onClick={handleSearch} disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600">
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 animate-pulse">
              <div className="w-16 h-16 bg-gray-700 rounded-full mb-4" />
              <div className="h-4 bg-gray-700 rounded mb-2" />
              <div className="h-3 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : tutors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No tutors found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}