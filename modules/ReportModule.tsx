
import React, { useState, useMemo } from 'react';
import { Invoice, Product, Batch, SessionLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { auditSalesData } from '../services/geminiService';

interface ReportModuleProps {
  invoices: Invoice[];
  products: Product[];
  batches: Batch[];
  logs: SessionLog[];
}

const ReportModule: React.FC<ReportModuleProps> = ({ invoices, products, batches, logs }) => {
  const [activeTab, setActiveTab] = useState<'vendas' | 'stock' | 'auditoria'>('vendas');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const salesData = useMemo(() => {
    // Top 5 products
    const productCounts: Record<string, { name: string, qty: number, total: number }> = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { name: item.productName, qty: 0, total: 0 };
        }
        productCounts[item.productId].qty += item.quantity;
        productCounts[item.productId].total += item.total;
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [invoices]);

  const totalRevenue = useMemo(() => invoices.reduce((acc, inv) => acc + inv.total, 0), [invoices]);
  const totalProfit = useMemo(() => {
    // Simplified profit calculation
    return invoices.reduce((acc, inv) => {
      const costs = inv.items.reduce((sum, item) => {
        const prod = products.find(p => p.id === item.productId);
        return sum + (prod ? prod.buyPrice * item.quantity : 0);
      }, 0);
      return acc + (inv.total - costs);
    }, 0);
  }, [invoices, products]);

  const handleAudit = async () => {
    setIsAnalyzing(true);
    const result = await auditSalesData(invoices, products, batches);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios e Análise</h2>
          <p className="text-slate-500">Visão estratégica e auditoria do sistema</p>
        </div>
        <button 
          onClick={handleAudit}
          disabled={isAnalyzing}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-2 rounded-lg shadow-md transition-all font-bold flex items-center gap-2"
        >
          {isAnalyzing ? 'Analisando...' : '💡 Auditoria Inteligente (IA)'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {(['vendas', 'stock', 'auditoria'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 font-bold transition-all border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'vendas' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border">
              <p className="text-sm font-bold text-slate-500 uppercase">Faturação Total</p>
              <p className="text-3xl font-black text-emerald-600">{totalRevenue.toFixed(2)} Kz</p>
              <p className="text-xs text-slate-400 mt-2">{invoices.length} documentos emitidos</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border">
              <p className="text-sm font-bold text-slate-500 uppercase">Lucro Estimado</p>
              <p className="text-3xl font-black text-indigo-600">{totalProfit.toFixed(2)} Kz</p>
              <p className="text-xs text-slate-400 mt-2">Margem operacional estimada</p>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md border">
              <p className="text-sm font-bold text-slate-500 uppercase">Ticket Médio</p>
              <p className="text-3xl font-black text-slate-800">{(invoices.length ? totalRevenue / invoices.length : 0).toFixed(2)} Kz</p>
              <p className="text-xs text-slate-400 mt-2">Valor médio por venda</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-bold mb-6">Produtos Mais Vendidos (Valor Total)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#4f46e5', '#059669', '#d97706', '#be185d', '#0891b2'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-md border border-amber-200">
                <h3 className="font-bold text-amber-700 mb-4">Atenção: Stock Crítico</h3>
                <div className="space-y-3">
                  {products.map(p => {
                    const total = batches.filter(b => b.productId === p.id).reduce((acc, b) => acc + b.quantity, 0);
                    if (total > p.minStock) return null;
                    return (
                      <div key={p.id} className="flex justify-between items-center bg-amber-50 p-2 rounded border border-amber-100">
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-xs font-bold text-amber-700">{total} / {p.minStock} un</span>
                      </div>
                    );
                  })}
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-md border border-red-200">
                <h3 className="font-bold text-red-700 mb-4">Atenção: Produtos Vencidos</h3>
                <div className="space-y-3">
                  {batches.filter(b => new Date(b.expiryDate) < new Date()).map(b => (
                    <div key={b.id} className="flex justify-between items-center bg-red-50 p-2 rounded border border-red-100">
                      <span className="text-sm font-medium">{products.find(p => p.id === b.productId)?.name}</span>
                      <span className="text-xs font-bold text-red-700">Lote: {b.batchNumber}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'auditoria' && (
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold mb-4">Log de Sessões e Auditoria</h3>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Utilizador</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ação</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Data e Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm font-bold">{log.username}</td>
                    <td className="px-4 py-3 text-sm">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 animate-slide-up">
           <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-indigo-900">Análise da IA PharmaBill</h3>
           </div>
           <div className="prose prose-indigo max-w-none text-indigo-800 leading-relaxed">
             {aiAnalysis.split('\n').map((line, i) => (
               <p key={i} className="mb-2">{line}</p>
             ))}
           </div>
           <button 
            onClick={() => setAiAnalysis(null)}
            className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
           >
             FECHAR ANÁLISE
           </button>
        </div>
      )}
    </div>
  );
};

export default ReportModule;
