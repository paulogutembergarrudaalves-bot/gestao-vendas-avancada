"use client";

import { useState, useEffect } from 'react';
import { Users, BarChart3, Target, Bell, Crown, Trophy, Zap, Settings, CheckCircle, X, AlertTriangle, LogIn, ChevronDown, Building2, ArrowUp, ArrowDown, Pause, Play, MoreVertical, UserPlus, Edit3, Calendar, TrendingUp, DollarSign, Award, Clock, ChevronLeft, ChevronRight, Shield, Activity, PieChart, Filter, Eye, Plus, Trash2, UserCheck, Database, History, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationSystem } from '@/components/NotificationSystem';
import { GoalManagement } from '@/components/GoalManagement';
import { getCurrentUser, mockVendorStats, mockUsers, mockMissingItems, mockCampaigns, mockSales, formatCurrency, getLevelColor, getLevelIcon } from '@/lib/data';

type ViewType = 'admin-dashboard' | 'admin-units' | 'admin-managers' | 'admin-vendors' | 'admin-logs' | 'queue' | 'ranking' | 'manager' | 'goals' | 'login';
type UserRole = 'admin' | 'gestor' | 'vendedor' | 'supervisor';

// Dados limpos - apenas estruturas vazias
const mockUnits: any[] = [];
const mockManagers: any[] = [];
const mockVendors: any[] = [];
const mockSystemLogs: any[] = [];
const mockQueue: any[] = [];

// Histórico de metas por mês
const MONTHLY_HISTORY = [
  { month: 'Janeiro', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Fevereiro', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Março', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Abril', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Maio', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Junho', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Julho', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Agosto', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Setembro', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Outubro', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Novembro', year: 2024, totalSales: 0, goal: 150000, achieved: false },
  { month: 'Dezembro', year: 2024, totalSales: 0, goal: 150000, achieved: false, current: true }
];

// Lista de filiais disponíveis
const branches = [
  { id: 'all', name: 'Todas as unidades', icon: '🏢' }
];

// Metas da loja por nível
const STORE_GOALS = {
  bronze: 50000,
  silver: 75000,
  gold: 100000,
  diamond: 150000
};

// Chaves para localStorage
const STORAGE_KEYS = {
  QUEUE_DATA: 'sync_vendas_queue_data',
  PENDING_SALES: 'sync_vendas_pending_sales',
  VENDOR_STATS: 'sync_vendas_vendor_stats',
  MANAGER_IN_QUEUE: 'sync_vendas_manager_in_queue',
  MONTHLY_SALES: 'sync_vendas_monthly_sales',
  UNITS_DATA: 'sync_vendas_units_data',
  SYSTEM_LOGS: 'sync_vendas_system_logs',
  MANAGERS_DATA: 'sync_vendas_managers_data',
  VENDORS_DATA: 'sync_vendas_vendors_data',
  USER_CREDENTIALS: 'sync_vendas_user_credentials'
};

export default function SalesManagementApp() {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showTopPerformerModal, setShowTopPerformerModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2024);

  // Estados persistentes - agora vazios
  const [queueData, setQueueData] = useState<any[]>([]);
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [vendorStats, setVendorStats] = useState<any[]>([]);
  const [managerInQueue, setManagerInQueue] = useState(false);
  const [monthlySales, setMonthlySales] = useState(0);
  const [unitsData, setUnitsData] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [managersData, setManagersData] = useState<any[]>([]);
  const [vendorsData, setVendorsData] = useState<any[]>([]);
  const [userCredentials, setUserCredentials] = useState<any[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        // Limpar localStorage para começar do zero
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Inicializar com dados vazios
        setQueueData([]);
        setPendingSales([]);
        setVendorStats([]);
        setManagerInQueue(false);
        setMonthlySales(0);
        setUnitsData([]);
        setSystemLogs([]);
        setManagersData([]);
        setVendorsData([]);
        setUserCredentials([]);
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
      }
    };

    loadPersistedData();
  }, []);

  // Salvar dados no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUEUE_DATA, JSON.stringify(queueData));
  }, [queueData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PENDING_SALES, JSON.stringify(pendingSales));
  }, [pendingSales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDOR_STATS, JSON.stringify(vendorStats));
  }, [vendorStats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MANAGER_IN_QUEUE, JSON.stringify(managerInQueue));
  }, [managerInQueue]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_SALES, JSON.stringify(monthlySales));
  }, [monthlySales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNITS_DATA, JSON.stringify(unitsData));
  }, [unitsData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_LOGS, JSON.stringify(systemLogs));
  }, [systemLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MANAGERS_DATA, JSON.stringify(managersData));
  }, [managersData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS_DATA, JSON.stringify(vendorsData));
  }, [vendorsData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(userCredentials));
  }, [userCredentials]);

  // Carregar dados do usuário apenas no cliente
  useEffect(() => {
    // Limpar usuário atual para forçar login
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoading(false);
    setCurrentView('login');
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Função para adicionar log ao sistema
  const addSystemLog = (action: string, details: string, unitId?: string) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'Usuário Desconhecido',
      userRole: currentUser?.role || 'unknown',
      action,
      details,
      unitId: unitId || null,
      unitName: unitId ? unitsData.find(u => u.id === unitId)?.name || null : null
    };
    
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Calcular dados da loja
  const calculateStoreData = () => {
    const totalVendorGoals = vendorStats.reduce((sum, vendor) => sum + (vendor.monthlyGoal || 15000), 0);
    const currentSales = monthlySales;
    const missingToDiamond = Math.max(0, STORE_GOALS.diamond - currentSales);
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const remainingDays = Math.max(1, daysInMonth - currentDay);
    const dailyNeeded = missingToDiamond / remainingDays;
    
    // Projeção baseada no desempenho atual
    const dailyAverage = currentSales / currentDay;
    const projection = dailyAverage * daysInMonth;
    
    // Determinar nível atual
    let currentLevel = 'bronze';
    if (currentSales >= STORE_GOALS.diamond) currentLevel = 'diamond';
    else if (currentSales >= STORE_GOALS.gold) currentLevel = 'gold';
    else if (currentSales >= STORE_GOALS.silver) currentLevel = 'silver';
    
    return {
      totalVendorGoals,
      currentSales,
      missingToDiamond,
      dailyNeeded,
      projection,
      currentLevel,
      goals: STORE_GOALS
    };
  };

  // Função para obter unidades permitidas para o usuário atual
  const getAvailableBranches = () => {
    if (!currentUser) return branches;
    
    if (currentUser.role === 'admin') {
      return branches;
    } else if (currentUser.role === 'gestor' || currentUser.role === 'supervisor') {
      const userUnits = currentUser.unitIds || [];
      const availableUnits = branches.filter(branch => 
        branch.id === 'all' || userUnits.includes(branch.id)
      );
      return availableUnits.length > 1 ? availableUnits : availableUnits.filter(b => b.id !== 'all');
    } else {
      const userUnit = currentUser.unitId;
      return branches.filter(branch => branch.id === userUnit);
    }
  };

  // Mostrar loading enquanto carrega os dados do usuário
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'gestor' || currentUser?.role === 'supervisor';
  const availableBranches = getAvailableBranches();
  const currentBranch = availableBranches.find(b => b.id === selectedBranch) || availableBranches[0];

  // Se estiver na tela de login, mostrar apenas o componente de login
  if (currentView === 'login') {
    return <LoginView 
      theme={theme} 
      onLogin={(credentials) => {
        // Verificar credenciais do admin
        if (credentials.username === 'paulogutemberg' && credentials.password === '123Mudar@') {
          const adminUser = {
            id: 'admin-1',
            name: 'Paulo Gutemberg',
            role: 'admin',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          };
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          setCurrentUser(adminUser);
          setCurrentView('admin-dashboard');
          return;
        }

        // Verificar credenciais de gerentes
        const manager = managersData.find(m => m.login === credentials.username && m.password === credentials.password);
        if (manager) {
          const managerUser = {
            id: manager.id,
            name: manager.name,
            role: manager.role === 'supervisor' ? 'supervisor' : 'gestor',
            photo: manager.photo,
            unitIds: manager.unitIds
          };
          localStorage.setItem('currentUser', JSON.stringify(managerUser));
          setCurrentUser(managerUser);
          setCurrentView('queue');
          return;
        }

        // Verificar credenciais de vendedores
        const vendor = vendorsData.find(v => v.login === credentials.username && v.password === credentials.password);
        if (vendor) {
          const vendorUser = {
            id: vendor.id,
            name: vendor.name,
            role: 'vendedor',
            photo: vendor.photo,
            unitId: vendor.unitId
          };
          localStorage.setItem('currentUser', JSON.stringify(vendorUser));
          setCurrentUser(vendorUser);
          setCurrentView('queue');
          return;
        }

        // Credenciais inválidas
        alert('Credenciais inválidas. Verifique seu usuário e senha.');
      }} 
      onBack={() => setCurrentView(isAdmin ? 'admin-dashboard' : 'queue')}
    />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-slate-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown className="h-8 w-8 text-yellow-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  SYNC VENDAS
                </h1>
              </div>
              
              {/* Seletor de Filiais - apenas para não-admins com unidades disponíveis */}
              {!isAdmin && availableBranches.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground hidden sm:flex cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    >
                      <Building2 className="h-3 w-3" />
                      {currentBranch?.icon} {currentBranch?.name}
                      <ChevronDown className="h-3 w-3" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {availableBranches.map((branch) => (
                      <DropdownMenuItem
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch.id)}
                        className={`flex items-center gap-2 cursor-pointer ${
                          selectedBranch === branch.id ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <span className="text-base">{branch.icon}</span>
                        <span className="flex-1">{branch.name}</span>
                        {selectedBranch === branch.id && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Informação da Unidade para Vendedores (não clicável) */}
              {!isAdmin && currentUser?.role === 'vendedor' && currentUser?.unitId && (
                <Badge 
                  variant="outline" 
                  className="items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 text-foreground opacity-70"
                >
                  <Building2 className="h-3 w-3" />
                  {(() => {
                    const vendorUnit = unitsData.find(u => u.id === currentUser.unitId);
                    return vendorUnit ? `${vendorUnit.icon} ${vendorUnit.name}` : 'Unidade não encontrada';
                  })()}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationSystem theme={theme} />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hidden sm:flex"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.photo} />
                  <AvatarFallback>
                    {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium">{currentUser?.name || 'Usuário'}</p>
                    {currentUser?.role === 'supervisor' && (
                      <Shield className="h-4 w-4 text-purple-500" title="Supervisor" />
                    )}
                  </div>
                  <p className="text-xs opacity-70 capitalize">
                    {currentUser?.role === 'supervisor' ? 'Supervisor' : currentUser?.role || 'vendedor'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('currentUser');
                    setCurrentUser(null);
                    setCurrentView('login');
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  title="Sair"
                >
                  <LogIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`border-b ${
        theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {isAdmin ? (
              // Menu do Admin
              <>
                <Button
                  variant={currentView === 'admin-dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('admin-dashboard')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard Geral
                </Button>
                
                <Button
                  variant={currentView === 'admin-units' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('admin-units')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Building2 className="h-4 w-4" />
                  Unidades
                </Button>
                
                <Button
                  variant={currentView === 'admin-managers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('admin-managers')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <UserCheck className="h-4 w-4" />
                  Gerentes
                </Button>
                
                <Button
                  variant={currentView === 'admin-vendors' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('admin-vendors')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Users className="h-4 w-4" />
                  Vendedores
                </Button>
                
                <Button
                  variant={currentView === 'admin-logs' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('admin-logs')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <History className="h-4 w-4" />
                  Logs do Sistema
                </Button>
              </>
            ) : (
              // Menu do Gestor/Vendedor
              <>
                <Button
                  variant={currentView === 'queue' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('queue')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Users className="h-4 w-4" />
                  Fila de Atendimento
                </Button>
                
                <Button
                  variant={currentView === 'ranking' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('ranking')}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Trophy className="h-4 w-4" />
                  Ranking
                </Button>
                
                {isManager && (
                  <>
                    <Button
                      variant={currentView === 'manager' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentView('manager')}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Painel Gestor
                    </Button>
                    
                    <Button
                      variant={currentView === 'goals' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentView('goals')}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Settings className="h-4 w-4" />
                      Metas
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Views do Admin */}
        {isAdmin && currentView === 'admin-dashboard' && (
          <AdminDashboardView 
            theme={theme} 
            unitsData={unitsData}
            vendorStats={vendorStats}
            systemLogs={systemLogs}
          />
        )}
        {isAdmin && currentView === 'admin-units' && (
          <AdminUnitsView 
            theme={theme} 
            unitsData={unitsData}
            setUnitsData={setUnitsData}
            addSystemLog={addSystemLog}
          />
        )}
        {isAdmin && currentView === 'admin-managers' && (
          <AdminManagersView 
            theme={theme} 
            unitsData={unitsData}
            setUnitsData={setUnitsData}
            managersData={managersData}
            setManagersData={setManagersData}
            addSystemLog={addSystemLog}
          />
        )}
        {isAdmin && currentView === 'admin-vendors' && (
          <AdminVendorsView 
            theme={theme} 
            unitsData={unitsData}
            vendorsData={vendorsData}
            setVendorsData={setVendorsData}
            addSystemLog={addSystemLog}
          />
        )}
        {isAdmin && currentView === 'admin-logs' && (
          <AdminLogsView 
            theme={theme} 
            systemLogs={systemLogs}
            unitsData={unitsData}
          />
        )}

        {/* Views do Gestor/Vendedor */}
        {currentView === 'queue' && (
          <QueueView 
            theme={theme} 
            selectedBranch={selectedBranch} 
            isManager={isManager}
            queueData={queueData}
            setQueueData={setQueueData}
            managerInQueue={managerInQueue}
            setManagerInQueue={setManagerInQueue}
            addSystemLog={addSystemLog}
          />
        )}
        {currentView === 'ranking' && (
          <RankingView 
            theme={theme} 
            selectedBranch={selectedBranch} 
            onShowTopPerformer={() => setShowTopPerformerModal(true)}
            vendorStats={vendorStats}
          />
        )}
        {currentView === 'manager' && isManager && (
          <ManagerView 
            theme={theme} 
            selectedBranch={selectedBranch}
            pendingSales={pendingSales}
            setPendingSales={setPendingSales}
            vendorStats={vendorStats}
            setVendorStats={setVendorStats}
            monthlySales={monthlySales}
            setMonthlySales={setMonthlySales}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            storeData={calculateStoreData()}
            addSystemLog={addSystemLog}
          />
        )}
        {currentView === 'goals' && isManager && <GoalManagement theme={theme} />}
      </main>
    </div>
  );
}

// Componente de Login Simplificado
function LoginView({ theme, onLogin, onBack }: { 
  theme: 'dark' | 'light'; 
  onLogin: (credentials: { username: string; password: string }) => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username && password) {
      onLogin({ username, password });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      <Card className={`w-full max-w-md mx-4 ${
        theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              SYNC VENDAS
            </h1>
          </div>
          <CardTitle className="text-xl">Fazer Login</CardTitle>
          <p className="text-sm opacity-70">Digite suas credenciais para acessar</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Formulário de Login */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Usuário</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite seu usuário"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={!username || !password}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          </div>

          {/* Informações do Admin */}
          <div className={`p-4 rounded-lg text-sm ${
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
          }`}>
            <p className="font-medium mb-2">🔑 Acesso Administrativo:</p>
            <p className="text-xs opacity-70">
              • <strong>Usuário:</strong> paulogutemberg<br/>
              • <strong>Senha:</strong> 123Mudar@<br/>
              • Sistema limpo - crie suas unidades, gerentes e vendedores
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componentes vazios para as views do admin
function AdminDashboardView({ theme }: { theme: 'dark' | 'light'; unitsData: any[]; vendorStats: any[]; systemLogs: any[]; }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-sm opacity-70">Sistema limpo - comece criando suas unidades</p>
        </div>
      </div>

      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardContent className="p-8 text-center">
          <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Sistema Resetado</h3>
          <p className="text-gray-500 mb-4">
            Todos os dados de demonstração foram removidos. 
            Comece criando suas unidades, gerentes e vendedores.
          </p>
          <p className="text-sm text-blue-500">
            Use as abas acima para gerenciar: Unidades → Gerentes → Vendedores
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminUnitsView({ theme, unitsData, setUnitsData, addSystemLog }: {
  theme: 'dark' | 'light';
  unitsData: any[];
  setUnitsData: (data: any) => void;
  addSystemLog: (action: string, details: string, unitId?: string) => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitIcon, setNewUnitIcon] = useState('🏪');

  const createUnit = () => {
    if (!newUnitName.trim()) return;
    
    const newUnit = {
      id: `unit-${Date.now()}`,
      name: newUnitName,
      icon: newUnitIcon,
      managerId: null,
      managerName: null,
      vendorsCount: 0,
      monthlyGoal: 100000,
      currentSales: 0,
      conversionRate: 0,
      status: 'active'
    };
    
    setUnitsData([...unitsData, newUnit]);
    addSystemLog('Criou nova unidade', `Unidade: ${newUnitName}`, newUnit.id);
    
    setNewUnitName('');
    setNewUnitIcon('🏪');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl shadow-2xl max-w-md w-full ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-xl font-bold mb-4">Criar Nova Unidade</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Unidade</label>
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Ex: Loja Centro"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Ícone</label>
                <div className="flex gap-2">
                  {['🏪', '🛍️', '🏬', '🏭', '🏢', '🏦'].map(icon => (
                    <Button
                      key={icon}
                      variant={newUnitIcon === icon ? 'default' : 'outline'}
                      onClick={() => setNewUnitIcon(icon)}
                      className="text-2xl p-2"
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={createUnit} className="flex-1" disabled={!newUnitName.trim()}>
                Criar Unidade
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Unidades</h1>
            <p className="text-sm opacity-70">Criar e gerenciar unidades</p>
          </div>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Button>
      </div>

      {/* Lista de Unidades */}
      {unitsData.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-8 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma Unidade Criada</h3>
            <p className="text-gray-500 mb-4">
              Comece criando sua primeira unidade para organizar o sistema.
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Unidade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {unitsData.map((unit) => (
            <Card key={unit.id} className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{unit.icon}</span>
                    <div>
                      <CardTitle>{unit.name}</CardTitle>
                      <p className="text-sm opacity-70">
                        {unit.managerName ? `Gestor: ${unit.managerName}` : 'Sem gestor designado'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Ativa</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-70">Vendedores</p>
                    <p className="font-bold text-purple-500">{unit.vendorsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Meta Mensal</p>
                    <p className="font-bold">{formatCurrency(unit.monthlyGoal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminManagersView({ theme, unitsData, managersData, setManagersData, addSystemLog }: {
  theme: 'dark' | 'light';
  unitsData: any[];
  setUnitsData?: (data: any) => void;
  managersData: any[];
  setManagersData: (data: any) => void;
  addSystemLog: (action: string, details: string, unitId?: string) => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerLogin, setNewManagerLogin] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');

  const createManager = () => {
    if (!newManagerName.trim() || !newManagerLogin.trim() || !newManagerPassword.trim()) return;
    
    const newManager = {
      id: `manager-${Date.now()}`,
      name: newManagerName,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      unitIds: [],
      role: 'gerente',
      login: newManagerLogin,
      password: newManagerPassword,
      isActive: true
    };
    
    setManagersData([...managersData, newManager]);
    addSystemLog('Criou novo gerente', `Gerente: ${newManagerName} (${newManagerLogin})`);
    
    setNewManagerName('');
    setNewManagerLogin('');
    setNewManagerPassword('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl shadow-2xl max-w-md w-full ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-xl font-bold mb-4">Criar Novo Gerente</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <Input
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Login de Acesso</label>
                <Input
                  value={newManagerLogin}
                  onChange={(e) => setNewManagerLogin(e.target.value)}
                  placeholder="Ex: joao.silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <Input
                  type="password"
                  value={newManagerPassword}
                  onChange={(e) => setNewManagerPassword(e.target.value)}
                  placeholder="Digite a senha"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={createManager} 
                className="flex-1" 
                disabled={!newManagerName.trim() || !newManagerLogin.trim() || !newManagerPassword.trim()}
              >
                Criar Gerente
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Gerentes</h1>
            <p className="text-sm opacity-70">Criar e gerenciar gerentes e supervisores</p>
          </div>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-green-500 to-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          Novo Gerente
        </Button>
      </div>

      {/* Lista de Gerentes */}
      {managersData.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-8 text-center">
            <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum Gerente Criado</h3>
            <p className="text-gray-500 mb-4">
              Crie gerentes para administrar suas unidades.
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-green-500 to-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Gerente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {managersData.map((manager) => (
            <Card key={manager.id} className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={manager.photo} />
                    <AvatarFallback>{manager.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{manager.name}</h3>
                    <p className="text-sm opacity-70">Login: {manager.login}</p>
                    <Badge variant="default" className="mt-2">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminVendorsView({ theme, unitsData, vendorsData, setVendorsData, addSystemLog }: {
  theme: 'dark' | 'light';
  unitsData: any[];
  vendorsData: any[];
  setVendorsData: (data: any) => void;
  addSystemLog: (action: string, details: string, unitId?: string) => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorLogin, setNewVendorLogin] = useState('');
  const [newVendorPassword, setNewVendorPassword] = useState('');
  const [newVendorUnit, setNewVendorUnit] = useState('');

  const createVendor = () => {
    if (!newVendorName.trim() || !newVendorLogin.trim() || !newVendorPassword.trim() || !newVendorUnit) return;
    
    const newVendor = {
      id: `vendor-${Date.now()}`,
      name: newVendorName,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      unitId: newVendorUnit,
      login: newVendorLogin,
      password: newVendorPassword,
      isActive: true,
      level: 'bronze'
    };
    
    setVendorsData([...vendorsData, newVendor]);
    
    const unit = unitsData.find(u => u.id === newVendorUnit);
    addSystemLog('Criou novo vendedor', `Vendedor: ${newVendorName} (${newVendorLogin}) - ${unit?.name}`, newVendorUnit);
    
    setNewVendorName('');
    setNewVendorLogin('');
    setNewVendorPassword('');
    setNewVendorUnit('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl shadow-2xl max-w-md w-full ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-xl font-bold mb-4">Criar Novo Vendedor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <Input
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Login de Acesso</label>
                <Input
                  value={newVendorLogin}
                  onChange={(e) => setNewVendorLogin(e.target.value)}
                  placeholder="Ex: maria.silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <Input
                  type="password"
                  value={newVendorPassword}
                  onChange={(e) => setNewVendorPassword(e.target.value)}
                  placeholder="Digite a senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Unidade</label>
                <Select value={newVendorUnit} onValueChange={setNewVendorUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsData.filter(u => u.status === 'active').map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.icon} {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={createVendor} 
                className="flex-1" 
                disabled={!newVendorName.trim() || !newVendorLogin.trim() || !newVendorPassword.trim() || !newVendorUnit}
              >
                Criar Vendedor
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Vendedores</h1>
            <p className="text-sm opacity-70">Criar e gerenciar vendedores</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="bg-gradient-to-r from-blue-500 to-purple-600"
          disabled={unitsData.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Vendedor
        </Button>
      </div>

      {/* Verificar se há unidades */}
      {unitsData.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Crie Unidades Primeiro</h3>
            <p className="text-gray-500 mb-4">
              Para criar vendedores, você precisa ter pelo menos uma unidade ativa.
            </p>
            <p className="text-sm text-blue-500">
              Vá para a aba "Unidades" e crie sua primeira unidade.
            </p>
          </CardContent>
        </Card>
      ) : vendorsData.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum Vendedor Criado</h3>
            <p className="text-gray-500 mb-4">
              Crie vendedores para suas unidades.
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Vendedor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {unitsData.map(unit => {
            const unitVendors = vendorsData.filter(v => v.unitId === unit.id);
            
            if (unitVendors.length === 0) return null;
            
            return (
              <Card key={unit.id} className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{unit.icon}</span>
                    {unit.name}
                    <Badge variant="outline">{unitVendors.length} vendedores</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unitVendors.map(vendor => (
                      <div key={vendor.id} className="p-4 rounded-lg border bg-gray-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={vendor.photo} />
                            <AvatarFallback>{vendor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold">{vendor.name}</h4>
                            <p className="text-xs opacity-70">Login: {vendor.login}</p>
                            <Badge variant="default" className="text-xs mt-1">Ativo</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminLogsView({ theme, systemLogs }: {
  theme: 'dark' | 'light';
  systemLogs: any[];
  unitsData: any[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold">Logs do Sistema</h1>
          <p className="text-sm opacity-70">Histórico de todas as ações realizadas</p>
        </div>
      </div>

      {systemLogs.length === 0 ? (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-8 text-center">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum Log Registrado</h3>
            <p className="text-gray-500">
              As ações do sistema aparecerão aqui conforme você usar o sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardHeader>
            <CardTitle>Histórico de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{log.userName}</span> {log.action.toLowerCase()}
                    </p>
                    <p className="text-xs opacity-70">{log.details}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {log.timestamp.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componentes vazios para as outras views
function QueueView({ theme }: { 
  theme: 'dark' | 'light'; 
  selectedBranch: string; 
  isManager: boolean;
  queueData: any[];
  setQueueData: (data: any) => void;
  managerInQueue: boolean;
  setManagerInQueue: (value: boolean) => void;
  addSystemLog: (action: string, details: string, unitId?: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardContent className="p-8 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Sistema Limpo</h3>
          <p className="text-gray-500">
            Configure primeiro as unidades e vendedores no painel administrativo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RankingView({ theme }: { 
  theme: 'dark' | 'light'; 
  selectedBranch: string;
  onShowTopPerformer: () => void;
  vendorStats: any[];
}) {
  return (
    <div className="space-y-6">
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ranking Vazio</h3>
          <p className="text-gray-500">
            O ranking aparecerá quando houver vendedores e vendas registradas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ManagerView({ theme }: { 
  theme: 'dark' | 'light'; 
  selectedBranch: string;
  pendingSales: any[];
  setPendingSales: (data: any) => void;
  vendorStats: any[];
  setVendorStats: (data: any) => void;
  monthlySales: number;
  setMonthlySales: (value: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  storeData: any;
  addSystemLog: (action: string, details: string, unitId?: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Painel Gestor</h3>
          <p className="text-gray-500">
            Configure primeiro as unidades e vendedores para usar o painel gestor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}