
export interface Project {
  id: string;
  name: string;
  sorting: number;
}

export interface User {
  id: string; // This ID should now match the Supabase Auth user ID (UUID)
  name: string;
  email: string;
  status: 'pending' | 'approved';
  // Fix: Made `is_admin` non-optional to create a strict Row type. The optionality for inserts is handled by a separate, explicit Insert type in `supabaseClient.ts`.
  // This resolves the core issue that was causing all Supabase client calls to be inferred as `never`.
  is_admin: boolean;
}

export interface Note {
  date: string;
  text: string;
}

export interface Task {
  id: string;
  project_id: string;
  task: string;
  assigned_to_id: string;
  status: 'New' | 'Waiting' | 'Completed';
  start_by: string; // YYYY-MM-DD
  notes: Note[];
  send_reminder: boolean;
}

export interface AugmentedTask extends Task {
    project: string;
    assignedTo: string;
}

export interface CompletedTask {
  id: string;
  project_id: string;
  task: string;
  assigned_to_id: string;
  status: 'Completed';
  start_by: string; // YYYY-MM-DD
  notes: Note[];
  completion_date: string; // ISO string
  marked_done_by_id: string;
}

export interface AugmentedCompletedTask {
    id: string;
    project_id: string;
    task: string;
    assigned_to_id: string;
    status: 'Completed';
    start_by: string;
    notes: Note[];
    completion_date: string;
    marked_done_by_id: string;
    project: string;
    assignedTo: string;
    markedDoneBy: string;
}


export type ModalType = 'addTask' | 'projects' | 'users' | 'waiting' | 'editUser' | 'editTask';

export type SortOption = 'project' | 'all';