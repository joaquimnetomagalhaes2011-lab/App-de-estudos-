import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Difficulty, QuizQuestion } from "../types";

// NOTE: Ideally, the API key comes from process.env.API_KEY.
// For this frontend-only demo, we assume it is available.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// 1. Generate Quiz Questions
export const generateQuizQuestions = async (subject: string, difficulty: Difficulty, count: number = 5): Promise<QuizQuestion[]> => {
  if (!apiKey) throw new Error("API Key missing");

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        questionText: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        correctOptionIndex: { type: Type.INTEGER, description: "Zero-based index of the correct option" },
        explanation: { type: Type.STRING, description: "Brief explanation of why the answer is correct" }
      },
      required: ["questionText", "options", "correctOptionIndex", "explanation"],
      propertyOrdering: ["questionText", "options", "correctOptionIndex", "explanation"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate ${count} multiple-choice questions about "${subject}" at a ${difficulty} difficulty level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert tutor. Create accurate, educational questions.",
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw error;
  }
};

// 2. Analyze Essay
export const analyzeEssay = async (topic: string, content: string): Promise<{ feedback: string; score: number }> => {
  if (!apiKey) throw new Error("API Key missing");

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      feedback: { type: Type.STRING, description: "Markdown formatted detailed feedback covering grammar, coherence, and structure." },
      score: { type: Type.INTEGER, description: "A score from 0 to 100 based on quality." }
    },
    required: ["feedback", "score"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Topic: ${topic}\n\nEssay Content:\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a strict but helpful writing coach. Analyze the essay for grammar, structure, coherence, and argument strength. Provide constructive feedback in Markdown format.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Essay analysis error:", error);
    throw error;
  }
};

// 3. Chat Bot
// We return the chat instance to maintain history in the component
export const createChatSession = () => {
  if (!apiKey) throw new Error("API Key missing");
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are Studify, a friendly and helpful study assistant. Keep answers concise, encouraging, and focused on educational topics. Use Markdown for formatting.",
    }
  });
};
