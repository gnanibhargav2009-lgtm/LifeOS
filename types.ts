
export interface UserProfile {
  name: string;
  photo: string | null; // Base64 string
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  content: string;
}

export interface TimetableEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  title: string;
  description: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
}

export interface StrategyDay {
  id: string;
  dayNumber: number;
  purpose: string;
  chapters: string;
  priorityTasks: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Strategy {
  id: string;
  name: string;
  totalDays: number;
  createdAt: number;
  days: StrategyDay[];
}

export interface MistakeEntry {
  id: string;
  subject: string;
  chapter: string;
  tag: string;
  correction: string;
  isExorcised: boolean;
  createdAt: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  time: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DIARY = 'DIARY',
  TIMETABLE = 'TIMETABLE',
  TASKS = 'TASKS',
  HABITS = 'HABITS',
  WATER = 'WATER',
  FOCUS = 'FOCUS',
  STRATEGY = 'STRATEGY',
  GRAVEYARD = 'GRAVEYARD',
  MEALS = 'MEALS',
  SETTINGS = 'SETTINGS',
}