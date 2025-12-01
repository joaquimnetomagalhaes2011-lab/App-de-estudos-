import { User, QuizResult, EssayResult } from "../types";

/**
 * MOCK SUPABASE IMPLEMENTATION
 * In a real app, this would use the @supabase/supabase-js client.
 * We use localStorage here so the app is fully functional in the preview.
 */

const KEYS = {
  USER: 'studify_user',
  QUIZ_HISTORY: 'studify_quiz_history',
  ESSAY_HISTORY: 'studify_essay_history',
};

// Auth Service
export const authService = {
  signIn: async (email: string): Promise<User> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    const user = { id: 'user_123', email, name: email.split('@')[0] };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return user;
  },

  signUp: async (email: string, name: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 800));
    const user = { id: `user_${Date.now()}`, email, name };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return user;
  },

  signOut: async () => {
    localStorage.removeItem(KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }
};

// Database Service
export const dbService = {
  saveQuizResult: async (result: QuizResult) => {
    const history = dbService.getQuizHistory();
    history.unshift(result);
    localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));
  },

  getQuizHistory: (): QuizResult[] => {
    const stored = localStorage.getItem(KEYS.QUIZ_HISTORY);
    return stored ? JSON.parse(stored) : [];
  },

  saveEssayResult: async (result: EssayResult) => {
    const history = dbService.getEssayHistory();
    history.unshift(result);
    localStorage.setItem(KEYS.ESSAY_HISTORY, JSON.stringify(history));
  },

  getEssayHistory: (): EssayResult[] => {
    const stored = localStorage.getItem(KEYS.ESSAY_HISTORY);
    return stored ? JSON.parse(stored) : [];
  }
};
