"use client";

import { useState } from 'react';
import { Settings, Users, Target, DollarSign, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockUsers, formatCurrency } from '@/lib/data';
import { Goal, Commission } from '@/lib/types';

interface GoalManagementProps {
  theme: 'dark' | 'light';
}

const mockGoals: Goal[] = [
  {
    id: '1',
    vendorId: '1',
    storeId: '1',
    period: 'dezena1',
    month: 12,
    year: 2024,
    bronzeValue: 5000,
    silverValue: 8000,
    goldValue: 12000,
    diamondValue: 15000,
    paGoal: 3.0,
    ticketMedioGoal: 800,
    workingDays: 10
  },
  {
    id: '2',
    vendorId: '2',
    storeId: '1',
    period: 'dezena1',
    month: 12,
    year: 2024,
    bronzeValue: 6000,
    silverValue: 10000,
    goldValue: 15000,
    diamondValue: 20000,
    paGoal: 3.2,
    ticketMedioGoal: 850,
    workingDays: 10
  }
];

const mockCommissions: Commission[] = [
  {
    id: '1',
    vendorId: '1',
    goalId: '1',
    type: 'progressive',
    bronzeCommission: 0.5,
    silverCommission: 0.75,
    goldCommission: 1.0,
    diamondCommission: 1.5
  },
  {
    id: '2',
    vendorId: '2',
    goalId: '2',
    type: 'fixed',
    bronzeCommission: 200,
    silverCommission: 350,
    goldCommission: 500,
    diamondCommission: 800
  }
];

// Função utilitária para labels de período
const getPeriodLabel = (period: Goal['period']) => {
  switch (period) {
    case 'dezena1': return '1ª Dezena (1-10)';
    case 'dezena2': return '2ª Dezena (11-20)';
    case 'dezena3': return '3ª Dezena (21-31)';
    default: return period;
  }
};

export function GoalManagement({ theme }: GoalManagementProps) {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [commissions, setCommissions] = useState<Commission[]>(mockCommissions);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);

  const vendors = mockUsers.filter(user => user.role === 'vendedor');

  const getVendorGoals = (vendorId: string) => {
    return goals.filter(goal => goal.vendorId === vendorId);
  };

  const getVendorCommission = (vendorId: string) => {
    return commissions.find(comm => comm.vendorId === vendorId);
  };

  const getCommissionDisplay = (commission: Commission, level: keyof Pick<Commission, 'bronzeCommission' | 'silverCommission' | 'goldCommission' | 'diamondCommission'>) => {
    const value = commission[level];
    if (commission.type === 'percentage' || commission.type === 'progressive') {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Metas e Comissões</h2>
          <p className="text-sm opacity-70">Configure metas e comissões para cada vendedor</p>
        </div>
        
        <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className={`max-w-2xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <CreateGoalForm theme={theme} onClose={() => setIsCreateGoalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendor Selection */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um vendedor para configurar" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={vendor.photo} />
                      <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {vendor.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Vendor Details */}
      {selectedVendor && (
        <VendorGoalDetails 
          vendorId={selectedVendor} 
          goals={getVendorGoals(selectedVendor)}
          commission={getVendorCommission(selectedVendor)}
          theme={theme}
        />
      )}

      {/* All Vendors Overview */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle>Visão Geral - Todos os Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendors.map((vendor) => {
              const vendorGoals = getVendorGoals(vendor.id);
              const vendorCommission = getVendorCommission(vendor.id);
              
              return (
                <div key={vendor.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={vendor.photo} />
                      <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{vendor.name}</p>
                      <p className="text-sm opacity-70">{vendorGoals.length} metas configuradas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {vendorCommission && (
                      <Badge variant="outline" className="capitalize">
                        {vendorCommission.type === 'progressive' ? 'Progressiva' : 
                         vendorCommission.type === 'percentage' ? 'Percentual' : 'Valor Fixo'}
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedVendor(vendor.id)}
                    >
                      Configurar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VendorGoalDetails({ 
  vendorId, 
  goals, 
  commission, 
  theme 
}: { 
  vendorId: string; 
  goals: Goal[]; 
  commission?: Commission; 
  theme: 'dark' | 'light';
}) {
  const vendor = mockUsers.find(u => u.id === vendorId);
  if (!vendor) return null;

  const getPeriodLabel = (period: Goal['period']) => {
    switch (period) {
      case 'dezena1': return '1ª Dezena (1-10)';
      case 'dezena2': return '2ª Dezena (11-20)';
      case 'dezena3': return '3ª Dezena (21-31)';
      default: return period;
    }
  };

  const getCommissionDisplay = (commission: Commission, level: keyof Pick<Commission, 'bronzeCommission' | 'silverCommission' | 'goldCommission' | 'diamondCommission'>) => {
    const value = commission[level];
    if (commission.type === 'percentage' || commission.type === 'progressive') {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  return (
    <div className="space-y-4">
      {/* Vendor Header */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={vendor.photo} />
              <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{vendor.name}</h3>
              <p className="text-sm opacity-70">Configurações de Meta e Comissão</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="commission">Comissões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="goals" className="space-y-4">
          {goals.length === 0 ? (
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhuma meta configurada</p>
                <p className="text-sm opacity-70 mb-4">Configure as metas para este vendedor</p>
                <Button>Criar Primeira Meta</Button>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id} className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {getPeriodLabel(goal.period)} - {goal.month}/{goal.year}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="text-lg font-bold text-orange-500">{formatCurrency(goal.bronzeValue)}</div>
                      <div className="text-sm opacity-70">🥉 Bronze</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                      <div className="text-lg font-bold text-gray-400">{formatCurrency(goal.silverValue)}</div>
                      <div className="text-sm opacity-70">🥈 Prata</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="text-lg font-bold text-yellow-500">{formatCurrency(goal.goldValue)}</div>
                      <div className="text-sm opacity-70">🥇 Ouro</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="text-lg font-bold text-cyan-500">{formatCurrency(goal.diamondValue)}</div>
                      <div className="text-sm opacity-70">💎 Diamante</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{goal.paGoal}</div>
                      <div className="text-sm opacity-70">Meta PA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{formatCurrency(goal.ticketMedioGoal)}</div>
                      <div className="text-sm opacity-70">Ticket Médio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{goal.workingDays}</div>
                      <div className="text-sm opacity-70">Dias Úteis</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="commission">
          {commission ? (
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configuração de Comissões
                  <Badge variant="outline" className="ml-2 capitalize">
                    {commission.type === 'progressive' ? 'Progressiva' : 
                     commission.type === 'percentage' ? 'Percentual' : 'Valor Fixo'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-lg font-bold text-orange-500">
                      {getCommissionDisplay(commission, 'bronzeCommission')}
                    </div>
                    <div className="text-sm opacity-70">🥉 Bronze</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                    <div className="text-lg font-bold text-gray-400">
                      {getCommissionDisplay(commission, 'silverCommission')}
                    </div>
                    <div className="text-sm opacity-70">🥈 Prata</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="text-lg font-bold text-yellow-500">
                      {getCommissionDisplay(commission, 'goldCommission')}
                    </div>
                    <div className="text-sm opacity-70">🥇 Ouro</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <div className="text-lg font-bold text-cyan-500">
                      {getCommissionDisplay(commission, 'diamondCommission')}
                    </div>
                    <div className="text-sm opacity-70">💎 Diamante</div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Comissões
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhuma comissão configurada</p>
                <p className="text-sm opacity-70 mb-4">Configure as comissões para este vendedor</p>
                <Button>Configurar Comissões</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateGoalForm({ theme, onClose }: { theme: 'dark' | 'light'; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendor">Vendedor</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o vendedor" />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.filter(u => u.role === 'vendedor').map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="period">Período</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dezena1">1ª Dezena (1-10)</SelectItem>
              <SelectItem value="dezena2">2ª Dezena (11-20)</SelectItem>
              <SelectItem value="dezena3">3ª Dezena (21-31)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bronze">Meta Bronze (R$)</Label>
          <Input id="bronze" type="number" placeholder="5000" />
        </div>
        <div>
          <Label htmlFor="silver">Meta Prata (R$)</Label>
          <Input id="silver" type="number" placeholder="8000" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gold">Meta Ouro (R$)</Label>
          <Input id="gold" type="number" placeholder="12000" />
        </div>
        <div>
          <Label htmlFor="diamond">Meta Diamante (R$)</Label>
          <Input id="diamond" type="number" placeholder="15000" />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pa">Meta PA</Label>
          <Input id="pa" type="number" step="0.1" placeholder="3.0" />
        </div>
        <div>
          <Label htmlFor="ticket">Ticket Médio (R$)</Label>
          <Input id="ticket" type="number" placeholder="800" />
        </div>
        <div>
          <Label htmlFor="days">Dias Úteis</Label>
          <Input id="days" type="number" placeholder="10" />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onClose}>
          Criar Meta
        </Button>
      </div>
    </div>
  );
}