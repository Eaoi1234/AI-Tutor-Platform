import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          username: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          bio?: string;
          date_of_birth?: string;
          phone?: string;
          location?: string;
          student_id?: string;
          major?: string;
          academic_year?: string;
          gpa?: number;
          total_study_time: number;
          current_streak: number;
          longest_streak: number;
          level_number: number;
          experience_points: number;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          username: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          bio?: string;
          date_of_birth?: string;
          phone?: string;
          location?: string;
          student_id?: string;
          major?: string;
          academic_year?: string;
          gpa?: number;
          total_study_time?: number;
          current_streak?: number;
          longest_streak?: number;
          level_number?: number;
          experience_points?: number;
          preferences?: any;
        };
        Update: {
          username?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string;
          bio?: string;
          date_of_birth?: string;
          phone?: string;
          location?: string;
          student_id?: string;
          major?: string;
          academic_year?: string;
          gpa?: number;
          total_study_time?: number;
          current_streak?: number;
          longest_streak?: number;
          level_number?: number;
          experience_points?: number;
          preferences?: any;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code?: string;
          description?: string;
          icon?: string;
          color: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          total_topics: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string;
          description?: string;
          icon?: string;
          color?: string;
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
          total_topics?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          code?: string;
          description?: string;
          icon?: string;
          color?: string;
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
          total_topics?: number;
          is_active?: boolean;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description?: string;
          subject_id: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          estimated_hours: number;
          prerequisites: string[];
          learning_objectives: string[];
          created_by?: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          subject_id: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          estimated_hours?: number;
          prerequisites?: string[];
          learning_objectives?: string[];
          created_by?: string;
          is_public?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          subject_id?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          estimated_hours?: number;
          prerequisites?: string[];
          learning_objectives?: string[];
          is_public?: boolean;
        };
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description?: string;
          order_number: number;
          estimated_time: number;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          order_number: number;
          estimated_time?: number;
          is_locked?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          order_number?: number;
          estimated_time?: number;
          is_locked?: boolean;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content?: string;
          lesson_type: 'text' | 'video' | 'quiz' | 'assignment';
          duration: number;
          order_number: number;
          key_points: string[];
          examples: string[];
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content?: string;
          lesson_type?: 'text' | 'video' | 'quiz' | 'assignment';
          duration?: number;
          order_number: number;
          key_points?: string[];
          examples?: string[];
          is_locked?: boolean;
        };
        Update: {
          title?: string;
          content?: string;
          lesson_type?: 'text' | 'video' | 'quiz' | 'assignment';
          duration?: number;
          order_number?: number;
          key_points?: string[];
          examples?: string[];
          is_locked?: boolean;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id?: string;
          lesson_id?: string;
          title?: string;
          session_type: 'general' | 'lesson_help' | 'concept_explanation';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string;
          lesson_id?: string;
          title?: string;
          session_type?: 'general' | 'lesson_help' | 'concept_explanation';
          is_active?: boolean;
        };
        Update: {
          title?: string;
          session_type?: 'general' | 'lesson_help' | 'concept_explanation';
          is_active?: boolean;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          message_type: 'user' | 'ai';
          content: string;
          context_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          message_type: 'user' | 'ai';
          content: string;
          context_data?: any;
        };
        Update: {
          content?: string;
          context_data?: any;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          content_type: 'subject' | 'course' | 'lesson' | 'chat_session';
          content_id: string;
          title: string;
          description?: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_type: 'subject' | 'course' | 'lesson' | 'chat_session';
          content_id: string;
          title: string;
          description?: string;
          tags?: string[];
        };
        Update: {
          title?: string;
          description?: string;
          tags?: string[];
        };
      };
    };
  };
}