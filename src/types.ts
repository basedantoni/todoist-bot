export interface Task {
  creator_id: string;
  created_at: string;
  assignee_id: string;
  assigner_id: string;
  comment_count: number;
  is_completed: boolean;
  content: string;
  description: string;
  due: Due;
  duration: any;
  id: string;
  labels: string[];
  order: number;
  priority: number;
  project_id: string;
  section_id: string;
  parent_id: string;
  url: string;
}

export interface NewTask {
  content: string;
  description: string;
  project_id: string;
  labels: string[];
}

export interface Due {
  date: string;
  is_recurring: boolean;
  datetime: string;
  string: string;
  timezone: string;
}

export type TaskEventType =
  | "added"
  | "updated"
  | "deleted"
  | "completed"
  | "uncompleted"
  | "archived"
  | "unarchived"
  | "shared"
  | "left";

export interface SyncResources {
  completed_info: CompletedInfo[];
  full_sync: boolean;
  items: Item[];
  stats: Stats;
  sync_token: string;
  temp_id_mapping: TempIdMapping;
}

export interface CompletedInfo {
  archived_sections: number;
  completed_items: number;
  project_id: string;
  v2_project_id: string;
}

export interface Item {
  added_at: string;
  added_by_uid: string;
  assigned_by_uid?: string;
  checked: boolean;
  child_order: number;
  collapsed: boolean;
  completed_at: string | null;
  content: string;
  day_order: number;
  deadline: any;
  description: string;
  due?: Due;
  duration: any;
  id: string;
  is_deleted: boolean;
  labels: any[];
  parent_id: any;
  priority: number;
  project_id: string;
  responsible_uid?: string;
  section_id: any;
  sync_id?: string;
  updated_at: string;
  user_id: string;
  v2_id: string;
  v2_parent_id: any;
  v2_project_id: string;
  v2_section_id: any;
}

export interface Due {
  date: string;
  is_recurring: boolean;
  lang: string;
  string: string;
  timezone: string;
}

export interface Stats {
  completed_count: number;
  days_items: DaysItem[];
  week_items: WeekItem[];
}

export interface DaysItem {
  date: string;
  total_completed: number;
}

export interface WeekItem {
  from: string;
  to: string;
  total_completed: number;
}

export interface TempIdMapping {}

export type UserStats = {
  completedItems: number;
  totalItems: number;
  moneyOwed: number;
};
