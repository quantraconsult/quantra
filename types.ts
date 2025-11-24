export interface Organization {
  id: string;
  name: string;
  type?: 'agri' | 'pro';
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  sorting: number;
  department_id?: string;
  organization_id?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved';
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
  start_by: string;
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
  start_by: string;
  notes: Note[];
  completion_date: string;
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