
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface EmployeeModuleProps {
  employees: User[];
  setEmployees: React.Dispatch<React.SetStateAction<User[]>>;
  addLog: (action: string) => void;
}

const EmployeeModule: React.FC<EmployeeModuleProps> = ({ employees, setEmployees, addLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    fullName: '',
    role: UserRole.OPERATOR,
    nif: '',
    phone: '',
    status: 'ativo'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      lastLogin: 'Nunca',
    } as User;
    
    setEmployees(prev => [...prev, newUser]);
    addLog(`Novo funcionário cadastrado: ${formData.username}`);
    setShowForm(false);
    setFormData({ username: '', fullName: '', role: UserRole.OPERATOR, nif: '', phone: '', status: 'ativo' });
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const newStatus = emp.status === 'ativo' ? 'inativo' : 'ativo';
        addLog(`Status do funcionário ${emp.username} alterado para ${newStatus}`);
        return { ...emp, status: newStatus };
      }
      return emp;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Funcionários</h2>
          <p className="text-slate-500">Controlo de acesso e perfis de utilizador</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg shadow-md font-bold transition-all"
          >
            + Novo Funcionário
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-slide-up max-w-3xl mx-auto">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full border-b pb-4 mb-2">
              <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest">Registo de Colaborador</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Nome Completo*</label>
                <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Nome de Utilizador*</label>
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">NIF</label>
                <input value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Contacto Telefónico</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Perfil de Acesso*</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                  <option value={UserRole.OPERATOR}>Operador / Farmacêutico</option>
                  <option value={UserRole.ADMIN}>Administrador / Gerente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Senha Inicial*</label>
                <input type="password" required className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="••••••••" />
              </div>
            </div>

            <div className="col-span-full flex justify-end gap-3 pt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-xl font-black shadow-lg hover:bg-orange-700 transition-all">Salvar Funcionário</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(emp => (
            <div key={emp.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-2 h-full ${emp.status === 'ativo' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xl">
                  {emp.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${emp.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {emp.role}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-black text-slate-800 text-lg leading-tight">{emp.fullName || emp.username}</h3>
                <p className="text-xs text-slate-400 font-bold tracking-widest mt-1">@{emp.username}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {emp.phone || 'Sem contacto'}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Último acesso: {emp.lastLogin}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between">
                <button 
                  onClick={() => toggleEmployeeStatus(emp.id)}
                  className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-2 transition-all ${emp.status === 'ativo' ? 'text-rose-500 border-rose-100 hover:bg-rose-50' : 'text-emerald-500 border-emerald-100 hover:bg-emerald-50'}`}
                >
                  {emp.status === 'ativo' ? 'Desativar Conta' : 'Ativar Conta'}
                </button>
                <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Editar Perfil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeModule;
