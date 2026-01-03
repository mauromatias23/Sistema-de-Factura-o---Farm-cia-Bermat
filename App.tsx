
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import { 
  User, Product, Batch, Customer, Invoice, SessionLog, UserRole 
} from './types.ts';
import { 
  INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_BATCHES, INITIAL_CUSTOMERS 
} from './constants.ts';

// Modules
import LoginModule from './modules/LoginModule.tsx';
import Dashboard from './modules/Dashboard.tsx';
import ProductModule from './modules/ProductModule.tsx';
import BatchModule from './modules/BatchModule.tsx';
import BillingModule from './modules/BillingModule.tsx';
import StockModule from './modules/StockModule.tsx';
import CustomerModule from './modules/CustomerModule.tsx';
import ReportModule from './modules/ReportModule.tsx';
import EmployeeModule from './modules/EmployeeModule.tsx';
import ProFormaModule from './modules/ProFormaModule.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  
  // Simulated Database
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [logs, setLogs] = useState<SessionLog[]>([]);

  const addLog = (action: string) => {
    if (!currentUser) return;
    const newLog: SessionLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveModule('dashboard');
    const newLog: SessionLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      action: 'Login efetuado',
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    addLog('Logout efetuado');
    setCurrentUser(null);
    setActiveModule('login');
  };

  const renderModule = () => {
    if (!currentUser) return <LoginModule onLogin={handleLogin} />;

    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onSelectModule={setActiveModule} userRole={currentUser.role} />;
      case 'produtos':
        return <ProductModule products={products} setProducts={setProducts} setBatches={setBatches} addLog={addLog} />;
      case 'lotes':
        return <BatchModule batches={batches} setBatches={setBatches} products={products} addLog={addLog} />;
      case 'faturacao':
        return (
          <BillingModule 
            products={products} 
            batches={batches} 
            customers={customers} 
            invoices={invoices}
            setInvoices={setInvoices}
            setBatches={setBatches}
            currentUser={currentUser}
            addLog={addLog}
          />
        );
      case 'proforma':
        return (
          <ProFormaModule 
            products={products} 
            batches={batches} 
            customers={customers} 
            currentUser={currentUser} 
            addLog={addLog} 
          />
        );
      case 'stock':
        return <StockModule products={products} batches={batches} setBatches={setBatches} addLog={addLog} />;
      case 'clientes':
        return <CustomerModule customers={customers} setCustomers={setCustomers} invoices={invoices} addLog={addLog} />;
      case 'funcionarios':
        return <EmployeeModule employees={users} setEmployees={setUsers} addLog={addLog} />;
      case 'relatorios':
        return <ReportModule invoices={invoices} products={products} batches={batches} logs={logs} />;
      default:
        return <Dashboard onSelectModule={setActiveModule} userRole={currentUser.role} />;
    }
  };

  return (
    <Layout 
      user={currentUser ? { username: currentUser.username, role: currentUser.role } : undefined}
      onLogout={handleLogout}
      onNavigateHome={() => currentUser && setActiveModule('dashboard')}
    >
      {renderModule()}
    </Layout>
  );
};

export default App;
