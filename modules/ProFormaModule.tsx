
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Batch, Customer, Invoice, InvoiceItem, User, UserRole } from '../types';
import { IVA_RATE } from '../constants';

interface ProFormaModuleProps {
  products: Product[];
  batches: Batch[];
  customers: Customer[];
  currentUser: User;
  addLog: (action: string) => void;
}

const ProFormaModule: React.FC<ProFormaModuleProps> = ({ 
  products, batches, customers, currentUser, addLog 
}) => {
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'multicaixa' | 'transferencia'>('dinheiro');
  const [discount, setDiscount] = useState(0);
  const [lastProForma, setLastProForma] = useState<Invoice | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products.filter(p => p.active);
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.active && (
        p.name.toLowerCase().includes(query) || 
        p.code.toLowerCase().includes(query) || 
        p.activePrinciple.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, products]);

  const availableBatches = useMemo(() => {
    return batches.filter(b => {
      const isExpired = new Date(b.expiryDate) < new Date();
      return b.quantity > 0 && !isExpired;
    });
  }, [batches]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId), 
    [selectedProductId, products]
  );

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.total, 0), [cart]);
  const ivaTotal = useMemo(() => cart.reduce((acc, item) => acc + item.ivaAmount, 0), [cart]);
  const total = useMemo(() => (subtotal + ivaTotal) - discount, [subtotal, ivaTotal, discount]);

  const updateCartQuantity = (batchId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.batchId === batchId) {
          const batch = batches.find(b => b.id === batchId);
          if (!batch) return item;
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          if (newQuantity > batch.quantity) {
            alert(`Stock insuficiente no lote selecionado.`);
            return item;
          }
          const product = products.find(p => p.id === item.productId);
          const unitPrice = product?.sellPrice || 0;
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * unitPrice,
            ivaAmount: newQuantity * (product?.hasIVA ? unitPrice * IVA_RATE : 0)
          };
        }
        return item;
      });
    });
  };

  const addToCart = (productId: string, batchId: string) => {
    const product = products.find(p => p.id === productId);
    const batch = batches.find(b => b.id === batchId);
    if (!product || !batch) return;
    
    const cartItem = cart.find(i => i.batchId === batchId);
    if ((cartItem?.quantity || 0) + 1 > batch.quantity) {
      alert("Stock insuficiente.");
      return;
    }

    if (cartItem) {
      updateCartQuantity(batchId, 1);
    } else {
      setCart([...cart, {
        productId,
        batchId,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellPrice,
        ivaAmount: product.hasIVA ? product.sellPrice * IVA_RATE : 0,
        total: product.sellPrice
      }]);
    }
  };

  const handlePrint = () => {
    if (lastProForma) {
      addLog(`Impressão de Orçamento/Pró-Forma iniciada: ${lastProForma.sequential}`);
      window.print();
    }
  };

  const generateProForma = () => {
    if (cart.length === 0) return;
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      sequential: `PF${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
      date: new Date().toISOString(),
      customerId: selectedCustomer || undefined,
      operatorId: currentUser.id,
      items: cart,
      subtotal,
      ivaTotal,
      total,
      paymentMethod,
      status: 'proforma',
      discount
    };
    setLastProForma(newInvoice);
    addLog(`Factura Pró-Forma ${newInvoice.sequential} gerada para ${selectedCustomer || 'Consumidor Final'}`);
  };

  const handleCancelProForma = () => {
    if (!window.confirm("Tem a certeza que deseja cancelar este orçamento?")) return;
    if (!lastProForma) return;
    
    setLastProForma({ ...lastProForma, status: 'cancelled' });
    addLog(`Orçamento Pró-Forma ${lastProForma.sequential} CANCELADO.`);
    alert(`Orçamento cancelado.`);
  };

  if (lastProForma) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-2xl border invoice-container animate-fade-in relative overflow-hidden">
        {lastProForma.status === 'cancelled' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-10">
            <span className="text-8xl font-black text-red-600 border-8 border-red-600 p-4 -rotate-45 uppercase">Anulado</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Farmácia Bermat</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase mt-1">NIF: 5417371734 | Contacto: 934103649</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Factura Pró-Forma</h1>
              <p className="text-sm font-bold text-cyan-600 mt-1">Este documento não tem validade fiscal (Orçamento)</p>
              <p className="text-xs font-mono text-slate-400 mt-1">Ref: {lastProForma.sequential} {lastProForma.status === 'cancelled' ? '(ANULADO)' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Data de Emissão</p>
            <p className="font-bold">{new Date(lastProForma.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente / Solicitante</p>
              <p className="font-bold text-slate-800">{customers.find(c => c.id === lastProForma.customerId)?.name || 'Cliente Ocasional'}</p>
              <p className="text-xs text-slate-500">NIF: {customers.find(c => c.id === lastProForma.customerId)?.nif || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Previsão de Pagamento</p>
              <p className="font-bold text-cyan-700 uppercase">{lastProForma.paymentMethod}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operador</p>
            <p className="font-bold text-slate-800 uppercase">{currentUser.username}</p>
            <p className="text-xs text-slate-500">Farmácia Bermat - Gestão Pró-Forma</p>
          </div>
        </div>

        <table className="w-full mb-10 text-xs">
          <thead className="border-b-2 border-slate-900">
            <tr>
              <th className="text-left py-4 uppercase font-black text-slate-500">Item / Lote</th>
              <th className="text-center py-4 uppercase font-black text-slate-500">Qtd</th>
              <th className="text-right py-4 uppercase font-black text-slate-500">Unitário</th>
              <th className="text-right py-4 uppercase font-black text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lastProForma.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4">
                  <p className="font-bold text-slate-800">{item.productName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Lote: {item.batchId.split('-').pop()}</p>
                </td>
                <td className="text-center py-4 font-medium">{item.quantity}</td>
                <td className="text-right py-4">{item.unitPrice.toFixed(2)} Kz</td>
                <td className="text-right py-4 font-black">{item.total.toFixed(2)} Kz</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 text-right border-t-2 border-slate-900 pt-6">
          <div className="flex justify-between text-sm text-slate-500 font-bold ml-auto max-w-[200px]">
            <span>Subtotal:</span>
            <span>{lastProForma.subtotal.toFixed(2)} Kz</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 font-bold ml-auto max-w-[200px]">
            <span>IVA (23%):</span>
            <span>{lastProForma.ivaTotal.toFixed(2)} Kz</span>
          </div>
          {lastProForma.discount > 0 && (
            <div className="flex justify-between text-sm text-rose-600 font-black ml-auto max-w-[200px]">
              <span>Desconto:</span>
              <span>-{lastProForma.discount.toFixed(2)} Kz</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-4 ml-auto max-w-[350px]">
            <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter mr-4">Total Estimado:</span>
            <span className="text-3xl font-black text-slate-900 whitespace-nowrap">{lastProForma.total.toFixed(2)} Kz</span>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase border-t pt-4">
          Orçamento válido por 15 dias úteis.<br/>
          Software de Gestão Farmacêutica Bermat
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
          <button 
            onClick={handlePrint}
            className="col-span-1 bg-slate-900 text-white py-3 rounded-xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs"
          >
            IMPRIMIR
          </button>
          {lastProForma.status !== 'cancelled' && (
            <button 
              onClick={handleCancelProForma}
              className="col-span-1 bg-rose-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-rose-700 transition-all text-xs"
            >
              ANULAR
            </button>
          )}
          <button 
            onClick={() => {
              setLastProForma(null);
              setCart([]);
              setSelectedProductId('');
              setSearchQuery('');
            }} 
            className={`${lastProForma.status === 'cancelled' ? 'col-span-3' : 'col-span-2'} bg-cyan-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-cyan-700 transition-all text-xs`}
          >
            NOVA PRÓ-FORMA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200" ref={searchRef}>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Procurar Produto para Orçamento</label>
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Digite o nome, código ou princípio ativo..."
              className="w-full h-14 pl-4 pr-12 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all bg-slate-50 font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {isSearchOpen && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-80 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setSearchQuery(p.name);
                        setIsSearchOpen(false);
                      }}
                      className="p-4 hover:bg-cyan-50 cursor-pointer border-b last:border-0 border-slate-100 transition-colors flex justify-between items-center group"
                    >
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-cyan-700">{p.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{p.activePrinciple} • Código: {p.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-cyan-600">{p.sellPrice.toFixed(2)} Kz</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 italic">Nenhum produto encontrado.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedProduct ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-cyan-500 animate-slide-up">
            <div className="flex justify-between items-start border-b-2 border-slate-50 pb-6 mb-6">
              <div>
                <span className="bg-cyan-100 text-cyan-700 text-xs font-black px-3 py-1 rounded-full uppercase mb-2 inline-block">
                  {selectedProduct.category}
                </span>
                <h2 className="text-3xl font-black text-slate-800">{selectedProduct.name}</h2>
                <p className="text-slate-500 font-medium mt-1">{selectedProduct.activePrinciple}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 font-bold uppercase">Preço Unitário</p>
                <p className="text-4xl font-black text-cyan-600">{selectedProduct.sellPrice.toFixed(2)} <span className="text-xl">Kz</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-500 uppercase tracking-wider">Lotes Disponíveis para Orçamentar</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableBatches.filter(b => b.productId === selectedProduct.id).map(b => (
                  <button
                    key={b.id}
                    onClick={() => addToCart(selectedProduct.id, b.id)}
                    className="flex justify-between items-center p-4 bg-slate-50 hover:bg-cyan-600 hover:text-white rounded-xl border-2 border-slate-100 hover:border-cyan-600 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-mono font-bold text-sm">Lote: {b.batchNumber}</p>
                      <p className="text-[10px] uppercase font-bold opacity-60">Validade: {new Date(b.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white text-slate-800 px-3 py-1 rounded-lg font-black group-hover:bg-white/20 group-hover:text-white">
                      {b.quantity} un
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 h-64 flex flex-col items-center justify-center text-slate-400">
            <p className="font-bold text-lg">Selecione um produto para iniciar o orçamento</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-full sticky top-8">
        <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2">
           <div className="bg-cyan-600 p-2 rounded-lg text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
           </div>
          Lista Pró-Forma
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
          {cart.length === 0 && <p className="text-slate-300 italic text-center py-20 font-bold uppercase text-xs">Carrinho Vazio</p>}
          {cart.map(item => (
            <div key={item.batchId} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 shadow-sm animate-slide-up">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800 leading-tight">{item.productName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Lote Ref: {item.batchId.split('-').pop()}</p>
                </div>
                <button onClick={() => setCart(cart.filter(i => i.batchId !== item.batchId))} className="text-slate-300 hover:text-rose-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg p-1">
                  <button onClick={() => updateCartQuantity(item.batchId, -1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 font-black">-</button>
                  <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.batchId, 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 font-black">+</button>
                </div>
                <div className="text-right">
                  <p className="font-black text-cyan-700 text-base">{item.total.toFixed(2)} Kz</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-6 border-t-2 border-slate-100">
           <div>
            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Cliente Destinatário</label>
            <select 
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
              className="w-full h-10 p-2 border-2 border-slate-100 rounded-lg text-sm bg-slate-50 font-bold outline-none focus:border-cyan-500"
            >
              <option value="">Cliente Ocasional</option>
              {customers.filter(c => c.id !== 'c1').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Previsão de Pagamento</label>
            <div className="grid grid-cols-3 gap-2">
              {(['dinheiro', 'multicaixa', 'transferencia'] as const).map(m => (
                <button 
                  key={m} 
                  onClick={() => setPaymentMethod(m)} 
                  className={`py-2 text-[10px] rounded-lg border-2 font-black uppercase transition-all ${paymentMethod === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm font-bold text-slate-500">
              <span>Subtotal Orçado</span>
              <span>{subtotal.toFixed(2)} Kz</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-500">
              <span>IVA Estimado (23%)</span>
              <span>{ivaTotal.toFixed(2)} Kz</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t-2 border-slate-100">
              <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Total Estimado</span>
              <span className="text-2xl font-black text-slate-900">{total.toFixed(2)} Kz</span>
            </div>
          </div>
          <button 
            onClick={generateProForma}
            disabled={cart.length === 0}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest"
          >
            Gerar Pró-Forma
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProFormaModule;
