import { User, Store, VendorStats, Sale, Goal, MissingItem, Campaign } from './types';

// Mock data para desenvolvimento
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@loja.com',
    role: 'vendedor',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    storeId: '1',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@loja.com',
    role: 'vendedor',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    storeId: '1',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@loja.com',
    role: 'gestor',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    storeId: '1',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@loja.com',
    role: 'vendedor',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    storeId: '1',
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

export const mockStores: Store[] = [
  {
    id: '1',
    name: 'Loja Centro',
    address: 'Rua Principal, 123 - Centro',
    managerId: '3',
    isActive: true
  },
  {
    id: '2',
    name: 'Loja Shopping',
    address: 'Shopping Center, Loja 45',
    managerId: '3',
    isActive: true
  }
];

export const mockVendorStats: VendorStats[] = [
  {
    vendorId: '1',
    period: 'dezembro-2024',
    totalSales: 15,
    totalValue: 12500,
    itemCount: 45,
    workingDays: 8,
    ticketMedio: 833.33,
    pa: 3.0,
    projection: 46875,
    dailyTarget: 1250,
    currentLevel: 'gold',
    missingToDiamond: 2500
  },
  {
    vendorId: '2',
    period: 'dezembro-2024',
    totalSales: 22,
    totalValue: 18750,
    itemCount: 66,
    workingDays: 8,
    ticketMedio: 852.27,
    pa: 3.0,
    projection: 70312,
    dailyTarget: 1250,
    currentLevel: 'diamond',
    missingToDiamond: 0
  },
  {
    vendorId: '4',
    period: 'dezembro-2024',
    totalSales: 8,
    totalValue: 6200,
    itemCount: 24,
    workingDays: 8,
    ticketMedio: 775,
    pa: 3.0,
    projection: 23250,
    dailyTarget: 1250,
    currentLevel: 'bronze',
    missingToDiamond: 8800
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    vendorId: '1',
    storeId: '1',
    value: 850,
    itemCount: 3,
    status: 'pending',
    createdAt: new Date(),
    noSaleReason: undefined,
    missingItems: undefined
  },
  {
    id: '2',
    vendorId: '2',
    storeId: '1',
    value: 1200,
    itemCount: 4,
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000),
    approvedAt: new Date(Date.now() - 1800000),
    approvedBy: '3'
  },
  {
    id: '3',
    vendorId: '4',
    storeId: '1',
    value: 650,
    itemCount: 2,
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000),
    noSaleReason: undefined,
    missingItems: undefined
  }
];

export const mockMissingItems: MissingItem[] = [
  {
    id: '1',
    storeId: '1',
    itemName: 'iPhone 15 Pro Max 256GB',
    requestCount: 15,
    lastRequested: new Date(),
    priority: 1
  },
  {
    id: '2',
    storeId: '1',
    itemName: 'Samsung Galaxy S24 Ultra',
    requestCount: 12,
    lastRequested: new Date(Date.now() - 3600000),
    priority: 2
  },
  {
    id: '3',
    storeId: '1',
    itemName: 'AirPods Pro 2ª Geração',
    requestCount: 10,
    lastRequested: new Date(Date.now() - 7200000),
    priority: 3
  },
  {
    id: '4',
    storeId: '1',
    itemName: 'MacBook Air M3',
    requestCount: 8,
    lastRequested: new Date(Date.now() - 10800000),
    priority: 4
  },
  {
    id: '5',
    storeId: '1',
    itemName: 'iPad Pro 12.9"',
    requestCount: 7,
    lastRequested: new Date(Date.now() - 14400000),
    priority: 5
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    storeId: '1',
    name: 'Semana do Diamante',
    description: 'Quem vender mais de R$ 20.000 na semana ganha um bônus especial!',
    startDate: new Date('2024-12-09'),
    endDate: new Date('2024-12-15'),
    targetProduct: 'Todos os produtos',
    prize: 'R$ 500 em dinheiro',
    isActive: true,
    createdBy: '3'
  },
  {
    id: '2',
    storeId: '1',
    name: 'Desafio iPhone',
    description: 'Corrida para vender mais iPhones esta semana',
    startDate: new Date('2024-12-09'),
    endDate: new Date('2024-12-15'),
    targetProduct: 'iPhone',
    prize: 'iPhone 15 Pro',
    isActive: true,
    createdBy: '3'
  }
];

// Utilitários
export const getCurrentUser = (): User => {
  // Verifica se há um usuário salvo no localStorage
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Erro ao parsear usuário do localStorage:', error);
      }
    }
  }
  
  // Fallback para o usuário padrão (vendedor)
  return mockUsers[0]; // Retorna João Silva como usuário atual
};

export const getCurrentStore = (): Store => {
  return mockStores[0];
};

export const getLevelColor = (level: string) => {
  switch (level) {
    case 'diamond': return 'from-cyan-400 to-blue-600';
    case 'gold': return 'from-yellow-400 to-orange-500';
    case 'silver': return 'from-gray-300 to-gray-500';
    case 'bronze': return 'from-orange-400 to-red-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

export const getLevelIcon = (level: string) => {
  switch (level) {
    case 'diamond': return '💎';
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    default: return '⚪';
  }
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const calculatePA = (itemCount: number, salesCount: number): number => {
  if (salesCount === 0) return 0;
  return itemCount / salesCount;
};

export const calculateProjection = (
  currentValue: number,
  workingDays: number,
  totalWorkingDays: number
): number => {
  if (workingDays === 0) return 0;
  const dailyAverage = currentValue / workingDays;
  return dailyAverage * totalWorkingDays;
};