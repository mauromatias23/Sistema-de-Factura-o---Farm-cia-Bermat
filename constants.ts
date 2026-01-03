
import { Product, Batch, Customer, User, UserRole } from './types';

export const INITIAL_USERS: User[] = [
  // Fixed: Added missing 'status' property to conform to the User interface
  { id: '1', username: 'admin', role: UserRole.ADMIN, lastLogin: new Date().toISOString(), status: 'ativo' },
  // Fixed: Added missing 'status' property to conform to the User interface
  { id: '2', username: 'farmaceutico1', role: UserRole.OPERATOR, lastLogin: new Date().toISOString(), status: 'ativo' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    code: '001',
    name: 'Paracetamol 500mg',
    activePrinciple: 'Paracetamol',
    category: 'Analgésicos',
    productType: 'Medicamento',
    priceType: 'tabelado',
    buyPrice: 100,
    sellPrice: 150,
    maxPrice: 160,
    hasIVA: true,
    supplier: 'PharmaDist',
    active: true,
    minStock: 20
  },
  {
    id: 'p2',
    code: '002',
    name: 'Ibuprofeno 400mg',
    activePrinciple: 'Ibuprofeno',
    category: 'Anti-inflamatórios',
    productType: 'Medicamento',
    priceType: 'livre',
    buyPrice: 200,
    sellPrice: 350,
    hasIVA: true,
    supplier: 'GlobalMeds',
    active: true,
    minStock: 15
  },
  {
    id: 'p3',
    code: '003',
    name: 'Máscara Cirúrgica',
    activePrinciple: 'N/A',
    category: 'Equipamentos descartáveis',
    productType: 'Equipamento',
    priceType: 'livre',
    buyPrice: 20,
    sellPrice: 50,
    hasIVA: true,
    supplier: 'HygieneCo',
    active: false,
    minStock: 100
  }
];

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'b1',
    productId: 'p1',
    batchNumber: 'LOT2023-01',
    expiryDate: '2025-12-31',
    quantity: 50,
    entryDate: '2023-01-15'
  },
  {
    id: 'b2',
    productId: 'p2',
    batchNumber: 'LOT2023-05',
    expiryDate: '2024-06-01', // Próximo de vencer
    quantity: 10,
    entryDate: '2023-05-20'
  },
  {
    id: 'b3',
    productId: 'p1',
    batchNumber: 'LOT2024-02',
    expiryDate: '2023-10-10', // Vencido
    quantity: 5,
    entryDate: '2024-02-10'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Cliente Ocasional', type: 'ocasional', history: [] },
  { id: 'c2', name: 'Hospital Central', type: 'institucional', nif: '500123456', history: [] }
];

export const IVA_RATE = 0.23;
