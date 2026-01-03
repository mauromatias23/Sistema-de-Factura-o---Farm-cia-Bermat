
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  lastLogin: string;
  fullName?: string;
  nif?: string;
  phone?: string;
  status: 'ativo' | 'inativo';
}

export type ProductCategory = 
  | 'Analgésicos' 
  | 'Antibióticos' 
  | 'Anti-inflamatórios' 
  | 'Antipiréticos' 
  | 'Antimaláricos' 
  | 'Antidiabéticos' 
  | 'Antihipertensivos' 
  | 'Equipamentos descartáveis' 
  | 'Cosmético' 
  | 'Suplemento' 
  | 'Equipamento médico' 
  | 'Vitaminas' 
  | 'Minerais' 
  | 'Outros';

export interface Product {
  id: string;
  code: string;
  name: string;
  activePrinciple: string;
  category: ProductCategory;
  productType: string;
  priceType: 'livre' | 'tabelado';
  buyPrice: number;
  sellPrice: number;
  maxPrice?: number;
  hasIVA: boolean;
  supplier: string;
  active: boolean;
  minStock: number;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  entryDate: string;
}

export interface Customer {
  id: string;
  name: string;
  type: 'ocasional' | 'institucional';
  nif?: string;
  history: string[]; // Invoice IDs
}

export interface InvoiceItem {
  productId: string;
  batchId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  ivaAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  sequential: string;
  date: string;
  customerId?: string;
  operatorId: string;
  items: InvoiceItem[];
  subtotal: number;
  ivaTotal: number;
  total: number;
  paymentMethod: 'dinheiro' | 'multicaixa' | 'transferencia';
  status: 'active' | 'cancelled' | 'proforma';
  discount: number;
}

export interface SessionLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  timestamp: string;
}
