# Mindle 🚀

**Mindle** is a community-driven peer-to-peer learning platform designed to connect students with tutors and study groups. By removing payment barriers, Mindle fosters a universe of knowledge where users can share expertise, schedule free tutoring sessions, and collaborate in study groups.



## 🚀 Features

👤 **User Roles**

- **Students**: Discover tutors, join study groups, manage upcoming sessions, and track learning progress.
- **Tutors**: Accept session requests, manage availability, build a reputation through reviews, and track student statistics.

🔍 **Discovery & Collaboration**

- **Find Tutors**: Browse profiles by subject expertise and availability.
- **Study Groups**: Join subject-specific groups (limited to 50 members) to collaborate with peers.
- **Reviews**: Transparent rating system (1-5 stars) with written feedback to build trust.

⚡ **Dashboard Management**

- **Student Dashboard**: View "Upcoming Sessions," "Recent Messages," and "Active Study Groups" at a glance.
- **Tutor Dashboard**: Manage "Pending Requests," view "Total Students" stats, and read reviews.
- **Notifications**: Real-time alerts for session requests, confirmations, and messages.

🛠️ **Tech Stack**

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Lucide React
- **UI Components**: Shadcn UI

## 🏁 Getting Started

Follow these steps to run the project locally.

### 1. Prerequisites
Make sure you have **Node.js** (v18 or higher) installed and a **Supabase** project set up.

### 2. Clone the Repository

```bash
git clone [https://github.com/yourusername/mindle.git](https://github.com/yourusername/mindle.git)
cd mindle
````

### 3\. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4\. Configure Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5\. Database Setup (Supabase)

Run the following SQL in your Supabase SQL Editor to set up the required tables.

```sql
-- 1. Profiles Table (Extends Auth)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id),
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'both', 'admin')),
  bio text,
  is_available boolean DEFAULT true,
  subjects_of_expertise text[],
  total_sessions integer DEFAULT 0,
  average_rating numeric DEFAULT 0.0 CHECK (average_rating BETWEEN 0 AND 5),
  location text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Tutoring Sessions
CREATE TABLE public.tutoring_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tutor_id uuid NOT NULL REFERENCES public.profiles(id),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  subject text NOT NULL,
  description text,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  meeting_link text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Study Groups
CREATE TABLE public.study_groups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creator_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL,
  description text,
  subject text NOT NULL,
  max_members integer DEFAULT 50,
  members_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Group Members
CREATE TABLE public.group_members (
  group_id bigint NOT NULL REFERENCES public.study_groups(id),
  member_id uuid NOT NULL REFERENCES public.profiles(id),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'banned')),
  joined_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (group_id, member_id)
);

-- 5. Messages
CREATE TABLE public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  recipient_id uuid REFERENCES public.profiles(id),
  group_id bigint REFERENCES public.study_groups(id),
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Reviews
CREATE TABLE public.reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id),
  reviewee_id uuid NOT NULL REFERENCES public.profiles(id),
  session_id bigint REFERENCES public.tutoring_sessions(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Notifications
CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (Recommended)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### 6\. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```text
mindle/
├── app/
│   ├── (protected)/        # Authenticated routes
│   │   └── dashboard/
│   │       ├── student/    # Student views (Sessions, Groups)
│   │       └── tutor/      # Tutor views (Requests, Stats)
│   ├── auth/               # Login / Signup pages
│   ├── marketing/          # Public pages (Find Tutors, About)
│   └── page.tsx            # Landing Page
├── components/             # Reusable UI Components
│   ├── ui/                 # Shadcn UI primitives
│   └── ...
├── lib/
│   └── supabase/           # Supabase Client & Server utilities
└── public/                 # Static assets (images, logos)
```

## 🤝 Contributing

Contributions are welcome\! Please fork this repository and submit a pull request for any features, bug fixes, or enhancements.