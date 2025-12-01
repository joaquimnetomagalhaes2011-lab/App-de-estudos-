import React from 'react';
import { User, LogOut, Home, Brain, MessageCircle, PenTool, History } from 'lucide-react';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'quiz', label: 'Quiz', icon: Brain },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'essay', label: 'Essay', icon: PenTool },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64 transition-all">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Brain className="w-8 h-8" />
            Studify
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
           <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
           </div>
           <button
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
           >
             <LogOut className="w-5 h-5" />
             Log Out
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Studify
        </h1>
        <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-600">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-safe">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-3 px-1 w-full ${
                currentView === item.id ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-current' : ''}`} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
