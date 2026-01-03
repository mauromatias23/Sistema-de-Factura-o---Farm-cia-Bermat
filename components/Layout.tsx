
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user?: { username: string; role: string };
  onLogout: () => void;
  onNavigateHome: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigateHome }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-emerald-700 text-white p-4 shadow-md no-print">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={onNavigateHome}>
            <div className="bg-white text-emerald-700 p-2 rounded-lg font-bold text-xl">
              FB
            </div>
            <h1 className="text-xl font-bold tracking-tight">Farmácia Bermat</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <p className="font-semibold">{user.username}</p>
                <p className="text-emerald-200 text-xs uppercase">{user.role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md transition-colors text-sm font-medium"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>

      <footer className="bg-slate-800 text-slate-400 py-4 text-center text-xs no-print">
        &copy; {new Date().getFullYear()} Farmácia Bermat - Sistema de Gestão Farmacêutica
      </footer>
    </div>
  );
};

export default Layout;
