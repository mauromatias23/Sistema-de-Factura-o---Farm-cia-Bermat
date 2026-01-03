
import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductCategory, Batch } from '../types';

interface ProductModuleProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  addLog: (action: string) => void;
}

const ProductModule: React.FC<ProductModuleProps> = ({ products, setProducts, setBatches, addLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories: ProductCategory[] = [
    'Analgésicos', 'Antibióticos', 'Anti-inflamatórios', 'Antipiréticos', 
    'Antimaláricos', 'Antidiabéticos', 'Antihipertensivos', 'Equipamentos descartáveis', 
    'Cosmético', 'Suplemento', 'Equipamento médico', 'Vitaminas', 'Minerais', 'Outros'
  ];

  const productTypes = [
    'Máscaras', 'Luvas', 'Algodão', 'Seringas', 'Comprimidos', 'Cápsulas', 
    'Xaropes', 'Injetáveis', 'Pomadas', 'Cremes', 'Supositórios', 
    'Protetores solares', 'Produtos antiacne', 'Shampoos terapêuticos', 
    'Sabonetes', 'Pastas dentífricas', 'Desinfetantes', 'Álcool', 
    'Fraldas', 'Leite infantil', 'Biberões', 'Outros'
  ];

  // Form states com campos temporários para sincronismo
  const [formData, setFormData] = useState<any>({
    code: '',
    name: '',
    activePrinciple: '',
    category: 'Analgésicos',
    productType: 'Comprimidos',
    priceType: 'livre',
    buyPrice: 0,
    sellPrice: 0,
    maxPrice: 0,
    hasIVA: true,
    supplier: '',
    active: true,
    minStock: 10,
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  const getNextCode = () => {
    if (products.length === 0) return '001';
    const numericCodes = products.map(p => parseInt(p.code, 10)).filter(c => !isNaN(c));
    if (numericCodes.length === 0) return '001';
    const maxCode = Math.max(...numericCodes);
    return (maxCode + 1).toString().padStart(3, '0');
  };

  useEffect(() => {
    if (showForm && !editingId) {
      setFormData(prev => ({
        ...prev,
        code: getNextCode()
      }));
    }
  }, [showForm, editingId, products]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.priceType === 'tabelado' && formData.maxPrice && (formData.sellPrice || 0) > formData.maxPrice) {
      alert(`Erro: O preço de venda (${formData.sellPrice}) não pode ser superior ao preço tabelado (${formData.maxPrice}).`);
      return;
    }

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
      addLog(`Produto atualizado: ${formData.name}`);
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const { purchaseDate, expiryDate, ...productData } = formData;
      
      const newProduct: Product = {
        ...productData,
        id: newId
      } as Product;

      setProducts(prev => [...prev, newProduct]);
      
      // SINCRONISMO: Criar lote automático para o novo produto
      const newBatch: Batch = {
        id: Math.random().toString(36).substr(2, 9),
        productId: newId,
        batchNumber: `LOTE-${formData.code}`,
        expiryDate: expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
        quantity: 0, // Inicia com zero, pode ser ajustado no módulo de stock
        entryDate: purchaseDate
      };
      
      setBatches(prev => [...prev, newBatch]);
      addLog(`Novo produto e lote inicial criados: ${formData.name} (Cód: ${formData.code})`);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '', name: '', activePrinciple: '', category: 'Analgésicos',
      productType: 'Comprimidos', priceType: 'livre', buyPrice: 0, sellPrice: 0, maxPrice: 0,
      hasIVA: true, supplier: '', active: true, minStock: 10,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: ''
    });
  };

  const handleEdit = (p: Product) => {
    setFormData({ ...p, purchaseDate: new Date().toISOString().split('T')[0], expiryDate: '' });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o produto "${name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addLog(`Produto eliminado: ${name}`);
    }
  };

  const toggleStatus = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = !p.active;
        addLog(`Estado do produto ${p.name} alterado para ${newStatus ? 'Ativo' : 'Inativo'}`);
        return { ...p, active: newStatus };
      }
      return p;
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.code.toLowerCase().includes(term) || 
      p.activePrinciple.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Módulo de Produtos</h2>
          <p className="text-slate-500">Gestão do catálogo da farmácia</p>
        </div>
        
        {!showForm && (
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input 
                type="text"
                placeholder="Procurar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition-colors"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg shadow-md transition-all font-semibold flex items-center gap-2 whitespace-nowrap"
            >
              <span>+ Novo Produto</span>
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-slide-up">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-full border-b pb-2 mb-2 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-700">{editingId ? 'Editar Produto' : 'Registo de Novo Produto'}</h3>
              <button 
                type="button" 
                onClick={() => {setShowForm(false); setEditingId(null);}}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Campos Principais */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código Interno*</label>
              <input readOnly value={formData.code} className="w-full px-3 py-2 border rounded-md bg-slate-50 font-bold text-emerald-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Comercial*</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Princípio Ativo*</label>
              <input required value={formData.activePrinciple} onChange={e => setFormData({...formData, activePrinciple: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            {/* Seleções */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria*</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Produto*</label>
              <select value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none">
                {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Preço*</label>
              <select value={formData.priceType} onChange={e => setFormData({...formData, priceType: e.target.value as any})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="livre">Livre</option>
                <option value="tabelado">Tabelado</option>
              </select>
            </div>

            {/* Preços e IVA */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IVA*</label>
              <select value={formData.hasIVA ? 'sim' : 'não'} onChange={e => setFormData({...formData, hasIVA: e.target.value === 'sim'})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="sim">Sim (23%)</option>
                <option value="não">Não (Isento)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Compra*</label>
              <input type="number" required value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço Venda*</label>
              <input type="number" required value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            {/* Campos de Stock e Datas (Novos) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor*</label>
              <input required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo*</label>
              <input type="number" required value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            {/* NOVOS CAMPOS: Data de Compra e Expiração */}
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-emerald-800 mb-1">Data de Compra*</label>
                <input 
                  type="date" 
                  required 
                  value={formData.purchaseDate} 
                  onChange={e => setFormData({...formData, purchaseDate: e.target.value})} 
                  className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-800 mb-1">Data de Expiração*</label>
                <input 
                  type="date" 
                  required 
                  value={formData.expiryDate} 
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                  className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white" 
                />
                <p className="text-[10px] text-emerald-600 mt-1 uppercase font-bold tracking-tighter">Gerará automaticamente um lote no módulo de validades</p>
              </div>
            </div>

            <div className="col-span-full flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md font-medium hover:bg-slate-300">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-md font-bold shadow-md hover:bg-emerald-700 transition-all">
                {editingId ? 'Guardar Alterações' : 'Registar Produto e Lote'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 animate-fade-in">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Código</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Produto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Categoria</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Preço (V)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.code}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="block text-[10px] text-slate-400 font-bold">{p.activePrinciple}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-600">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600">{p.sellPrice.toFixed(2)} Kz</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleStatus(p.id)} className={`w-11 h-5 rounded-full relative transition-colors ${p.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${p.active ? 'left-6' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(p)} className="text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase border px-2 py-1 rounded">EDITAR</button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="text-slate-500 hover:text-rose-600 font-black text-[10px] uppercase border px-2 py-1 rounded">ELIMINAR</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductModule;
