export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          bio: string | null;
          date_of_birth: string | null;
          phone: string | null;
          location: string | null;
          preferences: {
            notifications: {
              email: boolean;
              push: boolean;
              assignments: boolean;
              grades: boolean;
              announcements: boolean;
            };
            theme: string;
            language: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          bio?: string;
          date_of_birth?: string;
          phone?: string;
          location?: string;
          preferences?: {
            notifications?: {
              email?: boolean;
              push?: boolean;
              assignments?: boolean;
              grades?: boolean;
              announcements?: boolean;
            };
            theme?: string;
            language?: string;
          };
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
          preferences?: {
            notifications?: {
              email?: boolean;
              push?: boolean;
              assignments?: boolean;
              grades?: boolean;
              announcements?: boolean;
            };
            theme?: string;
            language?: string;
          };
          updated_at?: string;
        };
      };
    };
  };
}