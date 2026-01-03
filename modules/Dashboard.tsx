
import React from 'react';
import { UserRole } from '../types';

interface DashboardProps {
  onSelectModule: (module: string) => void;
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectModule, userRole }) => {
  const modules = [
    { 
      id: 'faturacao', 
      title: 'Faturação / POS', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-blue-500',
      allowed: [UserRole.ADMIN, UserRole.OPERATOR]
    },
    { 
      id: 'proforma', 
      title: 'Factura Pró-Forma', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-cyan-500',
      allowed: [UserRole.ADMIN, UserRole.OPERATOR]
    },
    { 
      id: 'produtos', 
      title: 'Produtos', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'bg-emerald-500',
      allowed: [UserRole.ADMIN]
    },
    { 
      id: 'lotes', 
      title: 'Lotes e Validade', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-amber-500',
      allowed: [UserRole.ADMIN, UserRole.OPERATOR]
    },
    { 
      id: 'stock', 
      title: 'Gestão de Stock', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-purple-500',
      allowed: [UserRole.ADMIN]
    },
    { 
      id: 'clientes', 
      title: 'Clientes / CRM', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-rose-500',
      allowed: [UserRole.ADMIN, UserRole.OPERATOR]
    },
    { 
      id: 'funcionarios', 
      title: 'Funcionários', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'bg-orange-600',
      allowed: [UserRole.ADMIN]
    },
    { 
      id: 'relatorios', 
      title: 'Relatórios / IA', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-indigo-600',
      allowed: [UserRole.ADMIN]
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-slate-800">Painel de Controlo</h2>
        <p className="text-slate-500 mt-2">Selecione um módulo para começar a operar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {modules.map((m) => {
          const isAllowed = m.allowed.includes(userRole);
          return (
            <button
              key={m.id}
              onClick={() => isAllowed && onSelectModule(m.id)}
              disabled={!isAllowed}
              className={`
                group p-6 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col items-center justify-center gap-4 border
                ${isAllowed 
                  ? 'bg-white hover:shadow-2xl hover:-translate-y-1 border-slate-200 cursor-pointer' 
                  : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'}
              `}
            >
              <div className={`p-4 rounded-2xl ${m.color} text-white group-hover:scale-110 transition-transform shadow-lg`}>
                {m.icon}
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold text-slate-800 leading-tight">{m.title}</span>
                {!isAllowed && <span className="text-[10px] font-black text-rose-500 uppercase mt-1 block">Acesso Restrito</span>}
              </div>
              <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-5 ${m.color}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
