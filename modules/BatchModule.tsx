
import React, { useState } from 'react';
import { Batch, Product } from '../types';

interface BatchModuleProps {
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  products: Product[];
  addLog: (action: string) => void;
}

const BatchModule: React.FC<BatchModuleProps> = ({ batches, setBatches, products, addLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Batch>>({
    productId: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 0,
    entryDate: new Date().toISOString().split('T')[0]
  });

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setBatches(prev => prev.map(b => b.id === editingId ? { ...b, ...formData } as Batch : b));
      addLog(`Lote atualizado: ${formData.batchNumber} do produto ${getProductName(formData.productId || '')}`);
    } else {
      const newBatch: Batch = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      } as Batch;
      setBatches(prev => [...prev, newBatch]);
      addLog(`Novo lote registado: ${formData.batchNumber} para o produto ${getProductName(formData.productId || '')}`);
    }
    
    closeForm();
  };

  const handleEdit = (batch: Batch) => {
    setFormData(batch);
    setEditingId(batch.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      productId: '',
      batchNumber: '',
      expiryDate: '',
      quantity: 0,
      entryDate: new Date().toISOString().split('T')[0]
    });
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isNearExpiry = (date: string) => {
    const today = new Date();
    const expiry = new Date(date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lotes e Validades</h2>
          <p className="text-slate-500">Controlo rigoroso de inventário</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg shadow-md transition-all font-semibold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Registar Lote
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-slide-up">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full border-b pb-2 mb-2">
              <h3 className="text-lg font-bold text-slate-700">{editingId ? 'Editar Detalhes do Lote' : 'Registo de Novo Lote'}</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produto*</label>
              <select 
                required
                disabled={!!editingId}
                value={formData.productId} 
                onChange={e => setFormData({...formData, productId: e.target.value})}
                className="w-full px-3 py-2 border rounded-md bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">Selecione um produto</option>
                {products.filter(p => p.active || p.id === formData.productId).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número do Lote*</label>
              <input 
                required
                value={formData.batchNumber} 
                onChange={e => setFormData({...formData, batchNumber: e.target.value})}
                className="w-full px-3 py-2 border rounded-md" 
                placeholder="Ex: LOT-2024-X"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Validade*</label>
              <input 
                type="date"
                required
                value={formData.expiryDate} 
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-md" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade em Stock*</label>
              <input 
                type="number"
                required
                value={formData.quantity} 
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-md" 
              />
            </div>

            <div className="col-span-full flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={closeForm}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-amber-600 text-white rounded-md font-bold shadow-md"
              >
                {editingId ? 'Guardar Alterações' : 'Salvar Lote'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border overflow-hidden">
             <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Produto</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Lote</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Validade</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Estado</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{getProductName(b.productId)}</td>
                    <td className="px-4 py-3 text-xs font-mono">{b.batchNumber}</td>
                    <td className="px-4 py-3 text-sm">{new Date(b.expiryDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold">{b.quantity}</td>
                    <td className="px-4 py-3 text-center">
                      {isExpired(b.expiryDate) ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Vencido</span>
                      ) : isNearExpiry(b.expiryDate) ? (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Vence Breve</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleEdit(b)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
              <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Bloqueados (Vencidos)
              </h3>
              <p className="text-[10px] text-red-600 mb-3 uppercase font-bold tracking-tight">Vendas automáticas bloqueadas</p>
              <div className="space-y-2">
                {batches.filter(b => isExpired(b.expiryDate)).map(b => (
                   <div key={b.id} className="text-xs bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                      <p className="font-black text-slate-800">{getProductName(b.productId)}</p>
                      <p className="text-slate-500 font-mono mt-1">Lote: {b.batchNumber}</p>
                      <p className="text-red-600 font-bold mt-1 uppercase text-[10px]">Expirou em: {new Date(b.expiryDate).toLocaleDateString()}</p>
                   </div>
                ))}
                {batches.filter(b => isExpired(b.expiryDate)).length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Nenhum lote vencido</p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
              <h3 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Alertas (Próximos 60 dias)
              </h3>
              <div className="space-y-2">
                {batches.filter(b => isNearExpiry(b.expiryDate)).map(b => (
                   <div key={b.id} className="text-xs bg-white p-3 rounded-lg border border-amber-200 shadow-sm">
                      <p className="font-black text-slate-800">{getProductName(b.productId)}</p>
                      <p className="text-slate-500 font-mono mt-1">Lote: {b.batchNumber}</p>
                      <p className="text-amber-600 font-bold mt-1 uppercase text-[10px]">Vence em: {new Date(b.expiryDate).toLocaleDateString()}</p>
                   </div>
                ))}
                {batches.filter(b => isNearExpiry(b.expiryDate)).length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Nenhum alerta para os próximos 60 dias</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchModule;
