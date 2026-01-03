
import React, { useState } from 'react';
import { Product, Batch } from '../types';

interface StockModuleProps {
  products: Product[];
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  addLog: (action: string) => void;
}

const StockModule: React.FC<StockModuleProps> = ({ products, batches, setBatches, addLog }) => {
  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustmentNote, setAdjustmentNote] = useState<string>('');

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';
  const getMinStock = (id: string) => products.find(p => p.id === id)?.minStock || 0;

  const handleAdjust = (batchId: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        const newQty = b.quantity + adjustmentValue;
        addLog(`Ajuste de stock manual: Lote ${b.batchNumber} (${getProductName(b.productId)}) alterado de ${b.quantity} para ${newQty}. Motivo: ${adjustmentNote}`);
        return { ...b, quantity: newQty };
      }
      return b;
    }));
    setEditingBatch(null);
    setAdjustmentValue(0);
    setAdjustmentNote('');
  };

  const productStocks = products.map(p => {
    const totalStock = batches.filter(b => b.productId === p.id).reduce((acc, b) => acc + b.quantity, 0);
    return { ...p, currentStock: totalStock };
  });

  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Inventário</h2>
        <p className="text-slate-500">Monitorização e ajustes de stock autorizados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
           <p className="text-xs font-bold text-rose-500 uppercase mb-1">Stock Crítico</p>
           <p className="text-2xl font-black">{productStocks.filter(p => p.currentStock <= p.minStock).length}</p>
           <p className="text-xs text-slate-400 mt-1">Produtos abaixo do mínimo</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
           <p className="text-xs font-bold text-emerald-500 uppercase mb-1">Stock Total</p>
           <p className="text-2xl font-black">{batches.reduce((acc, b) => acc + b.quantity, 0)}</p>
           <p className="text-xs text-slate-400 mt-1">Unidades em inventário</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Produto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lote</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mínimo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Atual</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batches.map(b => {
              const p = products.find(prod => prod.id === b.productId);
              if (!p) return null;
              
              return (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold">{p.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{b.batchNumber}</td>
                  <td className="px-6 py-4 text-sm">{p.minStock}</td>
                  <td className="px-6 py-4 font-bold">{b.quantity}</td>
                  <td className="px-6 py-4">
                    {b.quantity <= p.minStock / 2 ? (
                      <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Crítico</span>
                    ) : b.quantity <= p.minStock ? (
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Baixo</span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">OK</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingBatch(b.id)}
                      className="text-indigo-600 font-bold text-xs"
                    >
                      AJUSTAR
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingBatch && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-zoom-in">
            <h3 className="text-xl font-bold mb-4">Ajuste de Stock Manual</h3>
            <p className="text-sm text-slate-500 mb-4">Lote: {batches.find(b => b.id === editingBatch)?.batchNumber}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ajuste (+/- unidades)</label>
                <input 
                  type="number"
                  value={adjustmentValue}
                  onChange={e => setAdjustmentValue(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded"
                  placeholder="Ex: 10 ou -5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo do Ajuste</label>
                <textarea 
                  required
                  value={adjustmentNote}
                  onChange={e => setAdjustmentNote(e.target.value)}
                  className="w-full p-2 border rounded h-24"
                  placeholder="Ex: Produto danificado, inventário físico, etc."
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingBatch(null)}
                  className="flex-1 py-2 bg-slate-200 rounded font-bold"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleAdjust(editingBatch)}
                  disabled={!adjustmentNote}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold disabled:bg-slate-300"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockModule;
