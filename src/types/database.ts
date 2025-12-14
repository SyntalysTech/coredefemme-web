export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: number;
          username: string;
          email: string;
          full_name: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          username: string;
          email: string;
          full_name?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          username?: string;
          email?: string;
          full_name?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      articles: {
        Row: {
          id: number;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          category_id: number | null;
          featured_image: string | null;
          status: "draft" | "published";
          is_featured: boolean;
          publish_date: string | null;
          created_at: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          id?: number;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          category_id?: number | null;
          featured_image?: string | null;
          status?: "draft" | "published";
          is_featured?: boolean;
          publish_date?: string | null;
          created_at?: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          id?: number;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string | null;
          category_id?: number | null;
          featured_image?: string | null;
          status?: "draft" | "published";
          is_featured?: boolean;
          publish_date?: string | null;
          created_at?: string;
          updated_at?: string;
          views?: number;
        };
      };
      article_images: {
        Row: {
          id: number;
          article_id: number;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          article_id: number;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          article_id?: number;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      article_links: {
        Row: {
          id: number;
          article_id: number;
          link_url: string;
          link_title: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          article_id: number;
          link_url: string;
          link_title?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          article_id?: number;
          link_url?: string;
          link_title?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      article_status: "draft" | "published";
    };
  };
}

// Tipos de ayuda
export type Admin = Database["public"]["Tables"]["admins"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleImage = Database["public"]["Tables"]["article_images"]["Row"];
export type ArticleLink = Database["public"]["Tables"]["article_links"]["Row"];
export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

// Tipo para artículo con categoría
export interface ArticleWithCategory extends Article {
  category: Category | null;
}
