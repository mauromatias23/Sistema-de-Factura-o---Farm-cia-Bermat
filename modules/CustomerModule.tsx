
import React, { useState } from 'react';
import { Customer, Invoice } from '../types';

interface CustomerModuleProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  invoices: Invoice[];
  addLog: (action: string) => void;
}

const CustomerModule: React.FC<CustomerModuleProps> = ({ customers, setCustomers, invoices, addLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    type: 'ocasional',
    nif: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      history: []
    } as Customer;
    setCustomers(prev => [...prev, newCustomer]);
    addLog(`Novo cliente registado: ${formData.name}`);
    setShowForm(false);
    setFormData({ name: '', type: 'ocasional', nif: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Clientes</h2>
          <p className="text-slate-500">Registo e histórico de clientes</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg shadow-md transition-all font-semibold"
          >
            Novo Cliente
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-slide-up">
           <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo / Instituição*</label>
                <input 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cliente*</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="ocasional">Ocasional (Pessoa Física)</option>
                  <option value="institucional">Institucional (Empresa/ONG)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIF (Opcional)</label>
                <input 
                  value={formData.nif} 
                  onChange={e => setFormData({...formData, nif: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md" 
                />
              </div>

              <div className="col-span-full flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-slate-200 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-rose-600 text-white rounded-md font-bold"
                >
                  Registar Cliente
                </button>
              </div>
           </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {customers.map(c => {
            const customerInvoices = invoices.filter(inv => inv.customerId === c.id);
            const totalSpent = customerInvoices.reduce((acc, inv) => acc + inv.total, 0);

            return (
              <div key={c.id} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:border-rose-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{c.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {c.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.type === 'institucional' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                    {c.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">NIF</p>
                    <p className="text-sm font-medium">{c.nif || 'Não informado'}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Compras</p>
                    <p className="text-sm font-medium">{customerInvoices.length} docs</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500 italic">Volume Total: <strong>{totalSpent.toFixed(2)} Kz</strong></span>
                  <button className="text-rose-600 font-bold text-xs hover:underline">VER HISTÓRICO</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerModule;
