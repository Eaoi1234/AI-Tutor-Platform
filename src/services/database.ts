import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// User service
export const userService = {
  async createUser(userData: Tables['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByAuthId(authUserId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUser(userId: string, updates: Tables['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Subject service
export const subjectService = {
  async getAllSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getSubjectById(id: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Course service
export const courseService = {
  async createCourse(courseData: Tables['courses']['Insert']) {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCoursesBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules (
          *,
          course_lessons (*)
        )
      `)
      .eq('subject_id', subjectId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getCourseById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules (
          *,
          course_lessons (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserCourses(userId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules (
          *,
          course_lessons (*)
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Module service
export const moduleService = {
  async createModule(moduleData: Tables['course_modules']['Insert']) {
    const { data, error } = await supabase
      .from('course_modules')
      .insert(moduleData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getModulesByCourse(courseId: string) {
    const { data, error } = await supabase
      .from('course_modules')
      .select(`
        *,
        course_lessons (*)
      `)
      .eq('course_id', courseId)
      .order('order_number');
    
    if (error) throw error;
    return data;
  }
};

// Lesson service
export const lessonService = {
  async createLesson(lessonData: Tables['course_lessons']['Insert']) {
    const { data, error } = await supabase
      .from('course_lessons')
      .insert(lessonData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getLessonsByModule(moduleId: string) {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_number');
    
    if (error) throw error;
    return data;
  },

  async getLessonById(id: string) {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Chat service
export const chatService = {
  async createChatSession(sessionData: Tables['chat_sessions']['Insert']) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addMessage(messageData: Tables['chat_messages']['Insert']) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getChatSession(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        chat_messages (*)
      `)
      .eq('id', sessionId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Bookmark service
export const bookmarkService = {
  async addBookmark(bookmarkData: Tables['bookmarks']['Insert']) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert(bookmarkData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeBookmark(userId: string, contentType: string, contentId: string) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId);
    
    if (error) throw error;
  },

  async getUserBookmarks(userId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async isBookmarked(userId: string, contentType: string, contentId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// Progress service
export const progressService = {
  async updateProgress(progressData: {
    user_id: string;
    course_id: string;
    lesson_id: string;
    is_completed?: boolean;
    completion_percentage?: number;
    time_spent?: number;
  }) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(progressData, {
        onConflict: 'user_id,lesson_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserProgress(userId: string, courseId?: string) {
    let query = supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }
};