import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { User, Difficulty, QuizQuestion, ChatMessage } from './types';
import { authService, dbService } from './services/store';
import { generateQuizQuestions, analyzeEssay, createChatSession } from './services/geminiService';
import { 
  Loader2, Send, CheckCircle, XCircle, BookOpen, AlertCircle, 
  BarChart3, RefreshCw, PenSquare, Trophy, ChevronRight,
  Brain, MessageCircle, PenTool
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat } from '@google/genai';

// --- SUB-COMPONENTS (VIEWS) ---

// 1. LOGIN VIEW
const LoginView = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await authService.signUp(email, name);
      } else {
        user = await authService.signIn(email);
      }
      onLogin(user);
    } catch (err) {
      alert("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Studify</h1>
          <p className="text-slate-500 mt-2">Your AI-powered study companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              required 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-slate-600 hover:text-primary font-medium"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. DASHBOARD VIEW
const DashboardView = ({ user, onNavigate }: { user: User, onNavigate: (v: string) => void }) => {
  const quizHistory = dbService.getQuizHistory();
  const recentScore = quizHistory.length > 0 ? Math.round((quizHistory[0].score / quizHistory[0].totalQuestions) * 100) : 0;
  const totalQuizzes = quizHistory.length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hello, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-slate-500">Ready to learn something new today?</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Last Score</p>
          <p className="text-2xl font-bold text-slate-900">{recentScore}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Quizzes Taken</p>
          <p className="text-2xl font-bold text-slate-900">{totalQuizzes}</p>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Daily Study Challenge</h3>
          <p className="text-indigo-100 mb-6 max-w-md">Complete a quick 5-question quiz on a new topic to keep your streak alive!</p>
          <button 
            onClick={() => onNavigate('quiz')}
            className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors"
          >
            Start Quiz
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
          <Brain className="w-48 h-48" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => onNavigate('quiz')} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900">Generate Quiz</h4>
              <p className="text-xs text-slate-500">Test your knowledge</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
        </button>

        <button onClick={() => onNavigate('chat')} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900">AI Tutor Chat</h4>
              <p className="text-xs text-slate-500">Ask any question</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
        </button>

        <button onClick={() => onNavigate('essay')} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenSquare className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900">Essay Helper</h4>
              <p className="text-xs text-slate-500">Get instant feedback</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
        </button>
      </div>
    </div>
  );
};

// 3. QUIZ VIEW
const QuizView = () => {
  const [step, setStep] = useState<'config' | 'loading' | 'playing' | 'result'>('config');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const startQuiz = async () => {
    if (!subject.trim()) return;
    setStep('loading');
    try {
      const qs = await generateQuizQuestions(subject, difficulty, 5);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setStep('playing');
    } catch (e) {
      console.error(e);
      setStep('config');
      alert('Failed to generate quiz. Please check your API key.');
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (answers[currentIndex] !== -1) return; // Prevent changing answer
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx].correctOptionIndex ? 1 : 0), 0);
    dbService.saveQuizResult({
      id: Date.now().toString(),
      subject,
      difficulty,
      score,
      totalQuestions: questions.length,
      date: new Date().toISOString()
    });
    setStep('result');
  };

  const reset = () => {
    setStep('config');
    setSubject('');
    setCurrentIndex(0);
    setQuestions([]);
    setAnswers([]);
    setShowExplanation(false);
  };

  if (step === 'config') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Generate New Quiz</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject / Topic</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Photosynthesis, World War II, Calculus Basics"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(Difficulty).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                    difficulty === level 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={startQuiz}
            disabled={!subject}
            className="w-full bg-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <Brain className="w-5 h-5" />
            Generate Questions with AI
          </button>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Studify AI is crafting your quiz...</p>
      </div>
    );
  }

  if (step === 'result') {
    const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx].correctOptionIndex ? 1 : 0), 0);
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8">You scored {score} out of {questions.length}</p>
        
        <div className="text-5xl font-black text-primary mb-8">{percentage}%</div>

        <button 
          onClick={reset}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
        >
          Take Another Quiz
        </button>
      </div>
    );
  }

  // Playing View
  const currentQ = questions[currentIndex];
  const isAnswered = answers[currentIndex] !== -1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{subject}</span>
        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
          Q {currentIndex + 1} / {questions.length}
        </span>
      </div>
      
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 leading-relaxed">
          {currentQ.questionText}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let stateClass = "border-slate-200 hover:bg-slate-50";
            if (isAnswered) {
              if (idx === currentQ.correctOptionIndex) stateClass = "bg-green-100 border-green-500 text-green-900";
              else if (idx === answers[currentIndex]) stateClass = "bg-red-50 border-red-300 text-red-900";
              else stateClass = "opacity-50 border-slate-100";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${stateClass} ${!isAnswered && 'hover:border-primary/50'}`}
              >
                <span className="font-medium">{opt}</span>
                {isAnswered && idx === currentQ.correctOptionIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                {isAnswered && idx === answers[currentIndex] && idx !== currentQ.correctOptionIndex && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
            <span className="font-bold block mb-1">Explanation:</span>
            {currentQ.explanation}
          </div>
        )}

        {isAnswered && (
          <div className="mt-8 flex justify-end">
            <button 
              onClick={nextQuestion}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2"
            >
              {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. CHAT VIEW
const ChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hi! I am your Studify AI tutor. What are you studying today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage(userMsg.text);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'model',
         text: "I'm having trouble connecting right now. Please check your API configuration.",
         timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] md:h-[600px] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
            }`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
               <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
             </div>
           </div>
        )}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about Math, History, Science..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none bg-slate-50"
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-primary text-white p-3 rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

// 5. ESSAY VIEW
const EssayView = () => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{feedback: string, score: number} | null>(null);

  const handleAnalyze = async () => {
    if (!topic || !content) return;
    setLoading(true);
    try {
      const res = await analyzeEssay(topic, content);
      setResult(res);
      dbService.saveEssayResult({
        id: Date.now().toString(),
        topic,
        content,
        feedback: res.feedback,
        score: res.score,
        date: new Date().toISOString()
      });
    } catch (e) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-primary" />
              Write Essay
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Essay Topic (e.g., The Impact of Technology)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
              />
              <textarea
                placeholder="Type your essay here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !topic || !content}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Analyze Essay
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           {result ? (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
               <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                 <h3 className="font-bold text-slate-900">Analysis Result</h3>
                 <div className={`px-4 py-1 rounded-full text-sm font-bold ${result.score > 80 ? 'bg-green-100 text-green-700' : result.score > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                   Score: {result.score}/100
                 </div>
               </div>
               <div className="prose prose-sm prose-slate max-w-none">
                 <ReactMarkdown>{result.feedback}</ReactMarkdown>
               </div>
               <button 
                onClick={() => { setResult(null); setTopic(''); setContent(''); }}
                className="mt-6 w-full border border-slate-200 text-slate-600 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium"
               >
                 Start New Essay
               </button>
             </div>
           ) : (
             <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
               <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
               <p>Enter your essay topic and content to get instant AI feedback on grammar, structure, and coherence.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// 6. HISTORY VIEW
const HistoryView = () => {
  const quizHistory = dbService.getQuizHistory();
  const essayHistory = dbService.getEssayHistory();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Recent Quizzes
        </h2>
        {quizHistory.length === 0 ? (
          <p className="text-slate-500 italic">No quizzes taken yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Difficulty</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizHistory.map((q) => (
                    <tr key={q.id}>
                      <td className="px-6 py-3 font-medium text-slate-900">{q.subject}</td>
                      <td className="px-6 py-3">{q.difficulty}</td>
                      <td className="px-6 py-3">
                        <span className="font-bold text-primary">{q.score}/{q.totalQuestions}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{new Date(q.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-secondary" />
          Essay History
        </h2>
        {essayHistory.length === 0 ? (
          <p className="text-slate-500 italic">No essays submitted yet.</p>
        ) : (
           <div className="grid md:grid-cols-2 gap-4">
             {essayHistory.map(e => (
               <div key={e.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-900">{e.topic}</h4>
                   <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">
                     {e.score}/100
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 line-clamp-2 mb-2">{e.content}</p>
                 <p className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</p>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};


// MAIN APP COMPONENT
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    // Check for existing session
    const u = authService.getCurrentUser();
    if (u) setUser(u);
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setView('dashboard');
  };

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  return (
    <Layout 
      user={user} 
      currentView={view} 
      onNavigate={setView} 
      onLogout={handleLogout}
    >
      {view === 'dashboard' && <DashboardView user={user} onNavigate={setView} />}
      {view === 'quiz' && <QuizView />}
      {view === 'chat' && <ChatView />}
      {view === 'essay' && <EssayView />}
      {view === 'history' && <HistoryView />}
    </Layout>
  );
};

export default App;