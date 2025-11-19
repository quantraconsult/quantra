
import { createClient } from '@supabase/supabase-js';
// FIX: Import `Note` type as it is used in the updated `tasks.Insert` definition.
import { Project, User, Task, CompletedTask, Note } from '../types';

// =================================================================================
// INSTRUCTIONS FOR YOU:
// 1. In your Vercel project's "Environment Variables" settings, you must
//    RENAME your existing variables to include the `VITE_` prefix.
//
//    - RENAME `SUPABASE_URL`      -> `VITE_SUPABASE_URL`
//    - RENAME `SUPABASE_ANON_KEY` -> `VITE_SUPABASE_ANON_KEY`
//
// 2. After renaming the variables, you MUST redeploy your application for the
//    changes to take effect.
// =================================================================================

// For client-side projects, environment variables MUST be prefixed with VITE_
// to be exposed to the browser. We also use `import.meta.env` instead of `process.env`.
// Fix: Suppress TypeScript error for import.meta.env. In a Vite project, these variables will be available at runtime.
// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are not set or not prefixed with VITE_. Please check your Vercel project settings.");
}

// Define database types for type safety
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Project;
        Update: Partial<Project>;
      };
      users: {
        Row: User;
        // FIX: The `Insert` type for users was inconsistent with the database schema,
        // causing a global type failure. Columns with default values (`status`, `is_admin`)
        // must be optional in the `Insert` type. This resolves the `never` type inference
        // issue across all Supabase client calls.
        Insert: Omit<User, 'status' | 'is_admin'> & {
          status?: 'pending' | 'approved';
          is_admin?: boolean;
        };
        Update: Partial<User>;
      };
      tasks: {
        Row: Task;
        // FIX: Columns with default values (`status`, `notes`, `send_reminder`) must be optional
        // in the `Insert` type to match the database schema and fix the client-wide `never` type issue.
        Insert: Omit<Task, 'status' | 'notes' | 'send_reminder'> & {
            status?: 'New' | 'Waiting' | 'Completed';
            notes?: Note[];
            send_reminder?: boolean;
        };
        Update: Partial<Task>;
      };
      completed_tasks: {
        Row: CompletedTask;
        Insert: CompletedTask;
        Update: Partial<CompletedTask>;
      };
    };
  };
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);