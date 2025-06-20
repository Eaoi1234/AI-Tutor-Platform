/*
  # Create Learning Platform Database Schema

  1. New Tables
    - `users` - User profiles and authentication data
    - `subjects` - Available subjects/courses
    - `courses` - AI-generated courses
    - `course_modules` - Course modules/chapters
    - `course_lessons` - Individual lessons within modules
    - `user_progress` - Track user progress through courses
    - `chat_sessions` - AI chat conversation sessions
    - `chat_messages` - Individual messages in chat sessions
    - `quiz_sessions` - Quiz attempts and results
    - `quiz_questions` - Generated quiz questions
    - `quiz_answers` - User answers to quiz questions
    - `bookmarks` - User bookmarked content
    - `study_sessions` - Track study time and activities
    - `weak_areas` - Identified areas needing improvement
    - `generated_content` - AI-generated educational content

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public read access where appropriate
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar_url text,
  bio text,
  date_of_birth date,
  phone text,
  location text,
  student_id text,
  major text,
  academic_year text,
  gpa decimal(3,2),
  total_study_time integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  level_number integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  description text,
  icon text,
  color text DEFAULT 'from-blue-500 to-blue-600',
  difficulty text CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  total_topics integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI-generated courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  estimated_hours integer DEFAULT 0,
  prerequisites text[] DEFAULT '{}',
  learning_objectives text[] DEFAULT '{}',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course modules
CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_number integer NOT NULL,
  estimated_time integer DEFAULT 0,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, order_number)
);

-- Course lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  lesson_type text CHECK (lesson_type IN ('text', 'video', 'quiz', 'assignment')) DEFAULT 'text',
  duration integer DEFAULT 0,
  order_number integer NOT NULL,
  key_points text[] DEFAULT '{}',
  examples text[] DEFAULT '{}',
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, order_number)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completion_percentage integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Chat sessions with AI tutor
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE SET NULL,
  title text,
  session_type text CHECK (session_type IN ('general', 'lesson_help', 'concept_explanation')) DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_type text CHECK (message_type IN ('user', 'ai')) NOT NULL,
  content text NOT NULL,
  context_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE SET NULL,
  quiz_type text CHECK (quiz_type IN ('practice', 'assessment', 'daily')) DEFAULT 'practice',
  total_questions integer NOT NULL,
  correct_answers integer DEFAULT 0,
  score_percentage integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Quiz questions (AI-generated)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')) DEFAULT 'multiple_choice',
  options jsonb DEFAULT '[]',
  correct_answer text NOT NULL,
  explanation text,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  points integer DEFAULT 1,
  order_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, order_number)
);

-- User answers to quiz questions
CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user_answer text,
  is_correct boolean DEFAULT false,
  time_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- User bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content_type text CHECK (content_type IN ('subject', 'course', 'lesson', 'chat_session')) NOT NULL,
  content_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Study sessions tracking
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_type text CHECK (session_type IN ('chat', 'quiz', 'lesson', 'review')) NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE SET NULL,
  duration integer NOT NULL,
  topics_covered text[] DEFAULT '{}',
  score integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Weak areas identification
CREATE TABLE IF NOT EXISTS weak_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  topic_name text NOT NULL,
  accuracy_percentage integer DEFAULT 0,
  questions_attempted integer DEFAULT 0,
  improvement_suggestions text[] DEFAULT '{}',
  last_attempt timestamptz DEFAULT now(),
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject_id, topic_name)
);

-- AI-generated content cache
CREATE TABLE IF NOT EXISTS generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text CHECK (content_type IN ('course', 'lesson', 'quiz', 'explanation')) NOT NULL,
  subject text NOT NULL,
  topic text,
  difficulty text,
  prompt_hash text NOT NULL,
  content_data jsonb NOT NULL,
  usage_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(prompt_hash)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weak_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Subjects policies (public read)
CREATE POLICY "Anyone can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Courses policies
CREATE POLICY "Users can read public courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can read own courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Course modules policies
CREATE POLICY "Users can read course modules"
  ON course_modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_modules.course_id 
      AND (courses.is_public = true OR courses.created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
    )
  );

-- Course lessons policies
CREATE POLICY "Users can read course lessons"
  ON course_lessons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_modules 
      JOIN courses ON courses.id = course_modules.course_id
      WHERE course_modules.id = course_lessons.module_id 
      AND (courses.is_public = true OR courses.created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
    )
  );

-- User progress policies
CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Chat sessions policies
CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Chat messages policies
CREATE POLICY "Users can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Quiz sessions policies
CREATE POLICY "Users can manage own quiz sessions"
  ON quiz_sessions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Quiz questions policies
CREATE POLICY "Users can read quiz questions for own sessions"
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions 
      WHERE quiz_sessions.id = quiz_questions.session_id 
      AND quiz_sessions.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Quiz answers policies
CREATE POLICY "Users can manage own quiz answers"
  ON quiz_answers
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Bookmarks policies
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Study sessions policies
CREATE POLICY "Users can manage own study sessions"
  ON study_sessions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Weak areas policies
CREATE POLICY "Users can manage own weak areas"
  ON weak_areas
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Generated content policies (read-only for users, system manages)
CREATE POLICY "Users can read generated content"
  ON generated_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weak_areas_updated_at BEFORE UPDATE ON weak_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_courses_subject_id ON courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id ON quiz_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_weak_areas_user_id ON weak_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_prompt_hash ON generated_content(prompt_hash);