export interface User {
  id: string;
  email: string;
  name: string;
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  subject: string;
  score: number;
  totalQuestions: number;
  difficulty: Difficulty;
  date: string;
}

export interface EssayResult {
  id: string;
  topic: string;
  content: string;
  feedback: string;
  score: number; // 0-100
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
