export interface User {
  id: string;
  name: string;
  email: string;
  role: 'vendedor' | 'gestor';
  photo?: string;
  storeId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  managerId: string;
  isActive: boolean;
}

export interface QueueEntry {
  id: string;
  vendorId: string;
  position: number;
  status: 'waiting' | 'serving' | 'completed';
  enteredAt: Date;
  startedServingAt?: Date;
  completedAt?: Date;
  storeId: string;
}

export interface Sale {
  id: string;
  vendorId: string;
  storeId: string;
  value: number;
  itemCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  noSaleReason?: string;
  missingItems?: string[];
}

export interface Goal {
  id: string;
  vendorId: string;
  storeId: string;
  period: 'dezena1' | 'dezena2' | 'dezena3';
  month: number;
  year: number;
  bronzeValue: number;
  silverValue: number;
  goldValue: number;
  diamondValue: number;
  paGoal: number;
  ticketMedioGoal: number;
  workingDays: number;
}

export interface Commission {
  id: string;
  vendorId: string;
  goalId: string;
  type: 'percentage' | 'progressive' | 'fixed';
  bronzeCommission: number;
  silverCommission: number;
  goldCommission: number;
  diamondCommission: number;
}

export interface VendorStats {
  vendorId: string;
  period: string;
  totalSales: number;
  totalValue: number;
  itemCount: number;
  workingDays: number;
  ticketMedio: number;
  pa: number;
  projection: number;
  dailyTarget: number;
  currentLevel: 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';
  missingToDiamond: number;
}

export interface Campaign {
  id: string;
  storeId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetProduct: string;
  prize: string;
  isActive: boolean;
  createdBy: string;
}

export interface MissingItem {
  id: string;
  storeId: string;
  itemName: string;
  requestCount: number;
  lastRequested: Date;
  priority: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'queue_reminder' | 'goal_achievement' | 'approval_needed' | 'chat_message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  storeId: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}