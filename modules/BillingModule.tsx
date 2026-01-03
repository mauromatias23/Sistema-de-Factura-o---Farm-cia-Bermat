
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Batch, Customer, Invoice, InvoiceItem, User, UserRole } from '../types';
import { IVA_RATE } from '../constants';

interface BillingModuleProps {
  products: Product[];
  batches: Batch[];
  customers: Customer[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  currentUser: User;
  addLog: (action: string) => void;
}

const BillingModule: React.FC<BillingModuleProps> = ({ 
  products, batches, customers, invoices, setInvoices, setBatches, currentUser, addLog 
}) => {
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'multicaixa' | 'transferencia'>('dinheiro');
  const [discount, setDiscount] = useState(0);
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);

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
            alert(`Stock insuficiente.`);
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
    if (!product.active) {
      alert("Bloqueio: Venda de produto inativo não permitida.");
      return;
    }
    const cartItem = cart.find(i => i.batchId === batchId);
    if ((cartItem?.quantity || 0) + 1 > batch.quantity) {
      alert("Stock insuficiente.");
      return;
    }
    const unitPrice = product.sellPrice;
    const ivaAmount = product.hasIVA ? unitPrice * IVA_RATE : 0;
    if (cartItem) {
      updateCartQuantity(batchId, 1);
    } else {
      setCart([...cart, { productId, batchId, productName: product.name, quantity: 1, unitPrice, ivaAmount, total: unitPrice }]);
    }
  };

  const removeFromCart = (batchId: string) => {
    setCart(cart.filter(i => i.batchId !== batchId));
  };

  const finalizeSale = () => {
    if (cart.length === 0) return;
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      sequential: `F${(invoices.length + 1).toString().padStart(6, '0')}`,
      date: new Date().toISOString(),
      customerId: selectedCustomer || undefined,
      operatorId: currentUser.id,
      items: cart,
      subtotal,
      ivaTotal,
      total,
      paymentMethod,
      status: 'active',
      discount
    };
    setBatches(prev => prev.map(b => {
      const item = cart.find(i => i.batchId === b.id);
      if (item) return { ...b, quantity: b.quantity - item.quantity };
      return b;
    }));
    setInvoices(prev => [...prev, newInvoice]);
    setLastInvoice(newInvoice);
    addLog(`Fatura ${newInvoice.sequential} emitida por ${currentUser.username}`);
    setCart([]);
    setSelectedCustomer('');
    setSelectedProductId('');
    setSearchQuery('');
    setDiscount(0);
  };

  const handleCancelInvoice = (id: string) => {
    if (!window.confirm("Tem a certeza que deseja cancelar esta fatura? O stock será estornado.")) return;
    
    const invoiceToCancel = invoices.find(inv => inv.id === id) || lastInvoice;
    if (!invoiceToCancel || invoiceToCancel.status === 'cancelled') return;

    // Estornar Stock
    setBatches(prev => prev.map(b => {
      const item = invoiceToCancel.items.find(i => i.batchId === b.id);
      if (item) return { ...b, quantity: b.quantity + item.quantity };
      return b;
    }));

    // Atualizar Status da Fatura
    const updatedStatus: 'cancelled' = 'cancelled';
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: updatedStatus } : inv));
    
    if (lastInvoice?.id === id) {
      setLastInvoice({ ...lastInvoice, status: updatedStatus });
    }

    addLog(`Fatura ${invoiceToCancel.sequential} CANCELADA por ${currentUser.username}. Stock reposto.`);
    alert(`Fatura ${invoiceToCancel.sequential} cancelada com sucesso.`);
  };

  if (lastInvoice) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border invoice-container animate-fade-in relative overflow-hidden">
        {lastInvoice.status === 'cancelled' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-10">
            <span className="text-8xl font-black text-red-600 border-8 border-red-600 p-4 -rotate-45 uppercase">Cancelada</span>
          </div>
        )}
        
        <div className="text-center mb-8 border-b pb-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Farmácia Bermat</h2>
          <div className="text-xs font-bold text-slate-500 mt-1 flex flex-col gap-0.5">
            <span>NIF: 5417371734</span>
            <span>Contacto: 934103649</span>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-700">Recibo de Venda</h3>
            <p className={`${lastInvoice.status === 'cancelled' ? 'text-red-500' : 'text-emerald-600'} font-mono font-bold tracking-widest`}>
              {lastInvoice.sequential} {lastInvoice.status === 'cancelled' ? '(CANCELADA)' : ''}
            </p>
          </div>
        </div>
        
        <div className="space-y-4 text-sm mb-6">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Data e Hora:</span>
            <span className="font-bold">{new Date(lastInvoice.date).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Operador:</span>
            <span className="font-bold uppercase">{currentUser.username}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Cliente:</span>
            <span className="font-bold">{customers.find(c => c.id === lastInvoice.customerId)?.name || 'Consumidor Final'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Forma de Pagamento:</span>
            <span className="font-bold uppercase text-indigo-600">{lastInvoice.paymentMethod}</span>
          </div>
        </div>

        <table className="w-full text-xs mb-8">
          <thead className="border-b-2 border-slate-900">
            <tr>
              <th className="text-left py-3 uppercase text-slate-500 tracking-wider">Item</th>
              <th className="text-center py-3 uppercase text-slate-500 tracking-wider">Qtd</th>
              <th className="text-right py-3 uppercase text-slate-500 tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lastInvoice.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 font-medium text-slate-800">{item.productName}</td>
                <td className="text-center py-3 font-bold">{item.quantity}</td>
                <td className="text-right py-3 font-black text-slate-900">{item.total.toFixed(2)} Kz</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 text-right border-t-2 border-slate-900 pt-6">
          <div className="flex justify-between text-sm text-slate-500 font-bold ml-auto max-w-[200px]">
            <span>SUBTOTAL:</span>
            <span>{lastInvoice.subtotal.toFixed(2)} Kz</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 font-bold ml-auto max-w-[200px]">
            <span>IVA (23%):</span>
            <span>{lastInvoice.ivaTotal.toFixed(2)} Kz</span>
          </div>
          {lastInvoice.discount > 0 && (
            <div className="flex justify-between text-sm text-rose-600 font-black ml-auto max-w-[200px]">
              <span>DESCONTO:</span>
              <span>-{lastInvoice.discount.toFixed(2)} Kz</span>
            </div>
          )}
          <div className="flex justify-between text-3xl text-slate-900 font-black ml-auto max-w-[280px] pt-2">
            <span className="tracking-tighter uppercase">Total:</span>
            <span>{lastInvoice.total.toFixed(2)} Kz</span>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t pt-4">
          Obrigado pela sua preferência!<br/>
          Software de Gestão Farmacêutica Bermat
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
          <button 
            onClick={() => window.print()} 
            className="col-span-1 bg-slate-900 text-white py-3 rounded-xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs"
          >
            IMPRIMIR
          </button>
          {lastInvoice.status !== 'cancelled' && (
            <button 
              onClick={() => handleCancelInvoice(lastInvoice.id)} 
              className="col-span-1 bg-rose-600 text-white py-3 rounded-xl font-black shadow-xl hover:bg-rose-700 transition-all text-xs"
            >
              CANCELAR
            </button>
          )}
          <button 
            onClick={() => setLastInvoice(null)} 
            className={`${lastInvoice.status === 'cancelled' ? 'col-span-3' : 'col-span-2'} bg-emerald-600 text-white py-3 rounded-xl font-black shadow-xl hover:bg-emerald-700 transition-all text-xs`}
          >
            NOVA VENDA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200" ref={searchRef}>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Selecionar Produto para Venda</label>
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Digite o nome, código ou princípio ativo..."
              className="w-full h-14 pl-4 pr-12 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-slate-50 font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {isSearchOpen && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-80 overflow-y-auto animate-slide-up">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => { setSelectedProductId(p.id); setSearchQuery(p.name); setIsSearchOpen(false); }}
                      className="p-4 hover:bg-emerald-50 cursor-pointer border-b last:border-0 border-slate-100 flex justify-between items-center group"
                    >
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-emerald-700">{p.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{p.activePrinciple} • Código: {p.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-600">{p.sellPrice.toFixed(2)} Kz</p>
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
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-emerald-500 animate-fade-in">
            <div className="flex justify-between items-start border-b-2 border-slate-50 pb-6 mb-6">
              <div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full uppercase mb-2 inline-block">
                  {selectedProduct.category}
                </span>
                <h2 className="text-3xl font-black text-slate-800">{selectedProduct.name}</h2>
                <p className="text-slate-500 font-medium mt-1">{selectedProduct.activePrinciple}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 font-bold uppercase">Preço Unitário</p>
                <p className="text-4xl font-black text-emerald-600">{selectedProduct.sellPrice.toFixed(2)} <span className="text-xl">Kz</span></p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-500 uppercase tracking-wider">Lotes Disponíveis em Stock</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableBatches.filter(b => b.productId === selectedProduct.id).map(b => (
                  <button
                    key={b.id}
                    onClick={() => addToCart(selectedProduct.id, b.id)}
                    className="flex justify-between items-center p-4 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-xl border-2 border-slate-100 hover:border-emerald-600 transition-all group"
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
            <p className="font-bold text-lg">Selecione um produto para venda</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-full sticky top-8">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-tighter">
           <div className="bg-emerald-600 p-2 rounded-lg text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0m-3.35 12.35l-2.73-7.15c-.43-1.12-1.42-1.85-2.6-1.85h-4.64c-1.18 0-2.17.73-2.6 1.85l-2.73 7.15c-.43 1.12.3 2.35 1.5 2.35h12.3c1.2 0 1.93-1.23 1.5-2.35z" />
              </svg>
           </div>
          Lista de Itens
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
          {cart.length === 0 && <p className="text-center py-20 text-slate-300 font-bold italic uppercase text-xs">Carrinho Vazio</p>}
          {cart.map(item => (
            <div key={item.batchId} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 shadow-sm animate-slide-up">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-2">
                  <p className="text-sm font-black text-slate-800 leading-tight">{item.productName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Lote: {item.batchId.split('-').pop()}</p>
                </div>
                <button onClick={() => removeFromCart(item.batchId)} className="text-slate-300 hover:text-rose-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg p-1">
                  <button onClick={() => updateCartQuantity(item.batchId, -1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 font-black">-</button>
                  <span className="w-10 text-center text-sm font-black text-slate-800">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.batchId, 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 font-black">+</button>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-700 text-base">{item.total.toFixed(2)} Kz</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 pt-6 border-t-2 border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Identificação do Cliente</label>
            <select 
              value={selectedCustomer} 
              onChange={e => setSelectedCustomer(e.target.value)} 
              className="w-full h-10 p-2 border-2 border-slate-100 rounded-lg text-sm bg-slate-50 font-bold outline-none focus:border-emerald-500"
            >
              <option value="">Cliente Ocasional</option>
              {customers.filter(c => c.id !== 'c1').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Método de Pagamento</label>
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
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} Kz</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-500">
              <span>IVA (23%)</span>
              <span>{ivaTotal.toFixed(2)} Kz</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-4 border-t-2 border-slate-100">
              <span className="tracking-tighter uppercase">Total</span>
              <span>{total.toFixed(2)} Kz</span>
            </div>
          </div>
          <button 
            onClick={finalizeSale} 
            disabled={cart.length === 0} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingModule;
