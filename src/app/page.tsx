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
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { formatCurrency, getLevelColor, getLevelIcon } from '@/lib/data';

type ViewType = 'admin-dashboard' | 'admin-units' | 'admin-managers' | 'admin-vendors' | 'admin-logs' | 'queue' | 'ranking' | 'manager' | 'goals' | 'login';

// Lista de filiais disponíveis
const branches = [
  { id: 'all', name: 'Todas as unidades', icon: '🏢' },
  { id: 'centro', name: 'Loja Centro', icon: '🏪' },
  { id: 'shopping', name: 'Loja Shopping', icon: '🛍️' },
  { id: 'norte', name: 'Loja Norte', icon: '🏬' },
  { id: 'sul', name: 'Loja Sul', icon: '🏭' },
  { id: 'oeste', name: 'Loja Oeste', icon: '🏢' }
];

// Mock data para vendedores (será substituído por dados do Supabase)
const mockVendorStats = [
  {
    vendorId: 'vendor-1',
    totalValue: 18750,
    totalSales: 25,
    ticketMedio: 750,
    pa: 3.2,
    currentLevel: 'gold',
    monthlyGoal: 15000,
    projection: 28125,
    missingToDiamond: 6250
  },
  {
    vendorId: 'vendor-2',
    totalValue: 28750,
    totalSales: 35,
    ticketMedio: 821,
    pa: 3.8,
    currentLevel: 'diamond',
    monthlyGoal: 20000,
    projection: 43125,
    missingToDiamond: 0
  }
];

// Mock data para usuários (será substituído por dados do Supabase)
const mockUsers = [
  {
    id: 'vendor-1',
    name: 'João Silva',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'vendor-2',
    name: 'Maria Santos',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  }
];

export default function SalesManagementApp() {
  const { user, loading: authLoading, login, logout, isAdmin, isManager } = useAuth();
  const { units, sales, queueEntries, systemLogs, loading: dataLoading, addSale, approveSale, rejectSale, addSystemLog } = useSupabaseData();
  
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showTopPerformerModal, setShowTopPerformerModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2024);

  // Estados para formulários
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Definir view inicial baseada no usuário
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('queue');
        if (user.unitId) {
          setSelectedBranch(user.unitId);
        }
      }
    } else if (!authLoading && !user) {
      setCurrentView('login');
    }
  }, [user, authLoading]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const result = await login(loginUsername, loginPassword);
    
    if (result.success) {
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError(result.error || 'Erro no login');
    }
    
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('login');
  };

  // Função para obter unidades permitidas para o usuário atual
  const getAvailableBranches = () => {
    if (!user) return branches;
    
    if (user.role === 'admin') {
      return branches; // Admin vê todas
    } else if (user.role === 'gestor' || user.role === 'supervisor') {
      // Gestor/Supervisor vê apenas suas unidades atribuídas
      const userUnits = user.unitIds || (user.unitId ? [user.unitId] : []);
      const availableUnits = branches.filter(branch => 
        branch.id === 'all' || userUnits.includes(branch.id)
      );
      return availableUnits.length > 1 ? availableUnits : availableUnits.filter(b => b.id !== 'all');
    } else {
      // Vendedor vê apenas sua unidade
      const userUnit = user.unitId;
      return branches.filter(branch => branch.id === userUnit);
    }
  };

  // Mostrar loading enquanto carrega
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const availableBranches = getAvailableBranches();
  const currentBranch = availableBranches.find(b => b.id === selectedBranch) || availableBranches[0];

  // Se estiver na tela de login, mostrar apenas o componente de login
  if (currentView === 'login' || !user) {
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
            <p className="text-sm opacity-70">Entre com suas credenciais</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Usuário</label>
                <Input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                {loginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Informações de Demo */}
            <div className={`p-4 rounded-lg text-sm mt-4 ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
            }`}>
              <p className="font-medium mb-2">💡 Credenciais de Demo:</p>
              <p className="text-xs opacity-70">
                • <strong>Admin:</strong> admin / admin<br/>
                • <strong>Gestor:</strong> carlos.oliveira / senha123<br/>
                • <strong>Vendedor:</strong> joao.silva / senha123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
            </div>
            
            <div className="flex items-center gap-2">
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
                  <AvatarImage src={user?.photo} />
                  <AvatarFallback>
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                    {user?.role === 'supervisor' && (
                      <Shield className="h-4 w-4 text-purple-500" title="Supervisor" />
                    )}
                  </div>
                  <p className="text-xs opacity-70 capitalize">
                    {user?.role === 'supervisor' ? 'Supervisor' : user?.role || 'vendedor'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
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
                  <Button
                    variant={currentView === 'manager' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('manager')}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Painel Gestor
                  </Button>
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
            units={units}
            systemLogs={systemLogs}
          />
        )}
        {isAdmin && currentView === 'admin-units' && (
          <AdminUnitsView 
            theme={theme} 
            units={units}
          />
        )}
        {isAdmin && currentView === 'admin-logs' && (
          <AdminLogsView 
            theme={theme} 
            systemLogs={systemLogs}
            units={units}
          />
        )}

        {/* Views do Gestor/Vendedor */}
        {currentView === 'queue' && (
          <QueueView 
            theme={theme} 
            selectedBranch={selectedBranch} 
            isManager={isManager}
            user={user}
            queueEntries={queueEntries}
            addSale={addSale}
            addSystemLog={addSystemLog}
          />
        )}
        {currentView === 'ranking' && (
          <RankingView 
            theme={theme} 
            selectedBranch={selectedBranch} 
            onShowTopPerformer={() => setShowTopPerformerModal(true)}
            vendorStats={mockVendorStats}
          />
        )}
        {currentView === 'manager' && isManager && (
          <ManagerView 
            theme={theme} 
            selectedBranch={selectedBranch}
            sales={sales}
            approveSale={approveSale}
            rejectSale={rejectSale}
            addSystemLog={addSystemLog}
            user={user}
          />
        )}
      </main>

      {/* Modal do Vendedor do Dia */}
      {showTopPerformerModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTopPerformerModal(false);
            }
          }}
        >
          <div className={`p-6 text-center rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Crown className="h-12 w-12 text-yellow-500 animate-pulse" />
              <Avatar className="h-20 w-20 border-4 border-yellow-500/50">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
            </div>
            
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🏅 Vendedor do Dia!
            </h2>
            
            <p className="text-lg mb-4">
              <strong>Parabéns! Você é o vendedor destaque de hoje!</strong>
            </p>
            
            <div className="space-y-2 mb-6">
              <p className="text-xl font-semibold">Maria Santos</p>
              <p className="text-lg text-green-500 font-bold">
                {formatCurrency(28750)}
              </p>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                💎 Meta Diamante Atingida
              </Badge>
            </div>
            
            <div className="text-sm opacity-70 mb-6">
              Continue assim e mantenha-se no topo! 🚀
            </div>
            
            <Button 
              onClick={() => setShowTopPerformerModal(false)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente do Dashboard do Admin
function AdminDashboardView({ theme, units, systemLogs }: {
  theme: 'dark' | 'light';
  units: any[];
  systemLogs: any[];
}) {
  const totalSales = units.reduce((sum, unit) => sum + (unit.current_sales || 0), 0);
  const totalGoal = units.reduce((sum, unit) => sum + (unit.monthly_goal || 0), 0);
  const avgConversion = units.length > 0 ? units.reduce((sum, unit) => sum + (unit.conversion_rate || 0), 0) / units.length : 0;
  const totalVendors = units.reduce((sum, unit) => sum + (unit.vendors_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-sm opacity-70">Visão geral de todas as unidades e performance</p>
        </div>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Vendas Totais</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalSales)}</div>
            <p className="text-xs opacity-70">{totalGoal > 0 ? ((totalSales / totalGoal) * 100).toFixed(1) : 0}% da meta</p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Unidades Ativas</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{units.filter(u => u.status === 'active').length}</div>
            <p className="text-xs opacity-70">de {units.length} unidades</p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Total Vendedores</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">{totalVendors}</div>
            <p className="text-xs opacity-70">em todas as unidades</p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Conversão Média</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{avgConversion.toFixed(1)}%</div>
            <p className="text-xs opacity-70">taxa de conversão</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Unidade */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Performance por Unidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {units.map((unit) => (
              <div key={unit.id} className="p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{unit.icon}</span>
                    <div>
                      <h3 className="font-semibold">{unit.name}</h3>
                      <p className="text-sm opacity-70">
                        {unit.manager_name ? `Gestor: ${unit.manager_name}` : 'Sem gestor designado'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={unit.status === 'active' ? 'default' : 'secondary'}>
                    {unit.status === 'active' ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm opacity-70">Vendas</p>
                    <p className="font-bold text-green-500">{formatCurrency(unit.current_sales || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Meta</p>
                    <p className="font-bold">{formatCurrency(unit.monthly_goal || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Conversão</p>
                    <p className="font-bold text-blue-500">{unit.conversion_rate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Vendedores</p>
                    <p className="font-bold text-purple-500">{unit.vendors_count || 0}</p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((unit.current_sales || 0) / (unit.monthly_goal || 1)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {(((unit.current_sales || 0) / (unit.monthly_goal || 1)) * 100).toFixed(1)}% da meta atingida
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Atividade Recente do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{log.user_name}</span> {log.action.toLowerCase()}
                  </p>
                  <p className="text-xs opacity-70">{log.details}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(log.created_at).toLocaleString('pt-BR')} 
                    {log.unit_name && ` • ${log.unit_name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Gerenciamento de Unidades
function AdminUnitsView({ theme, units }: {
  theme: 'dark' | 'light';
  units: any[];
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Unidades</h1>
            <p className="text-sm opacity-70">Visualizar e gerenciar unidades</p>
          </div>
        </div>
      </div>

      {/* Lista de Unidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {units.map((unit) => (
          <Card key={unit.id} className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} ${
            unit.status === 'inactive' ? 'opacity-60' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{unit.icon}</span>
                  <div>
                    <CardTitle>{unit.name}</CardTitle>
                    <p className="text-sm opacity-70">
                      {unit.manager_name ? `Gestor: ${unit.manager_name}` : 'Sem gestor designado'}
                    </p>
                  </div>
                </div>
                
                <Badge variant={unit.status === 'active' ? 'default' : 'secondary'}>
                  {unit.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm opacity-70">Vendas Atuais</p>
                  <p className="font-bold text-green-500">{formatCurrency(unit.current_sales || 0)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Meta Mensal</p>
                  <p className="font-bold">{formatCurrency(unit.monthly_goal || 0)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Taxa Conversão</p>
                  <p className="font-bold text-blue-500">{unit.conversion_rate || 0}%</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Vendedores</p>
                  <p className="font-bold text-purple-500">{unit.vendors_count || 0}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Meta</span>
                  <span>{(((unit.current_sales || 0) / (unit.monthly_goal || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((unit.current_sales || 0) / (unit.monthly_goal || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Componente de Logs do Sistema
function AdminLogsView({ theme, systemLogs, units }: {
  theme: 'dark' | 'light';
  systemLogs: any[];
  units: any[];
}) {
  const getActionIcon = (action: string) => {
    if (action.includes('Aprovou')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (action.includes('Rejeitou')) return <X className="h-4 w-4 text-red-500" />;
    if (action.includes('Login')) return <LogIn className="h-4 w-4 text-blue-500" />;
    if (action.includes('Logout')) return <LogIn className="h-4 w-4 text-gray-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <History className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold">Logs do Sistema</h1>
          <p className="text-sm opacity-70">Histórico completo de todas as ações realizadas</p>
        </div>
      </div>

      {/* Lista de Logs */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico de Atividades</span>
            <Badge variant="outline">{systemLogs.length} registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{log.user_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {log.user_role === 'admin' ? 'Admin' : log.user_role === 'gestor' ? 'Gestor' : 'Vendedor'}
                    </Badge>
                    {log.unit_name && (
                      <Badge variant="secondary" className="text-xs">
                        {log.unit_name}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm">
                    <span className="font-medium">{log.action}</span>
                  </p>
                  
                  <p className="text-sm opacity-70 mt-1">{log.details}</p>
                  
                  <p className="text-xs opacity-50 mt-2">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            
            {systemLogs.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum log encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente da Fila de Atendimento
function QueueView({ 
  theme, 
  selectedBranch, 
  isManager,
  user,
  queueEntries,
  addSale,
  addSystemLog
}: { 
  theme: 'dark' | 'light'; 
  selectedBranch: string; 
  isManager: boolean;
  user: any;
  queueEntries: any[];
  addSale: any;
  addSystemLog: any;
}) {
  const [saleValue, setSaleValue] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [showSaleForm, setShowSaleForm] = useState(false);

  const handleSubmitSale = async () => {
    if (!saleValue || !itemCount || !user) return;

    const result = await addSale(user.id, user.unitId || selectedBranch, parseFloat(saleValue), parseInt(itemCount));
    
    if (result.success) {
      await addSystemLog(user.id, user.name, user.role, 'Registrou venda', `Venda de ${formatCurrency(parseFloat(saleValue))} com ${itemCount} itens`);
      setSaleValue('');
      setItemCount('');
      setShowSaleForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Fila Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-500">{queueEntries.length}</div>
            <p className="text-sm opacity-70">pessoas na fila</p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Meta Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-3xl font-bold text-green-500">{formatCurrency(5000)}</div>
            <p className="text-sm opacity-70">para meta diamante</p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Vendas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-3xl font-bold text-yellow-500">{formatCurrency(8400)}</div>
            <p className="text-sm opacity-70">12 vendas realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Venda */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Registrar Venda
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showSaleForm ? (
            <Button 
              onClick={() => setShowSaleForm(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Valor da Venda</label>
                  <Input
                    type="number"
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                    placeholder="R$ 0,00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Quantidade de Itens</label>
                  <Input
                    type="number"
                    value={itemCount}
                    onChange={(e) => setItemCount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitSale}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={!saleValue || !itemCount}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrar Venda
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowSaleForm(false);
                    setSaleValue('');
                    setItemCount('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fila de Atendimento */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Fila de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queueEntries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum vendedor na fila</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {entry.position}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Vendedor {index + 1}</p>
                    <p className="text-sm opacity-70">
                      Status: {entry.status === 'waiting' ? 'Aguardando' : entry.status === 'serving' ? 'Atendendo' : 'Suspenso'}
                    </p>
                  </div>
                  <Badge variant={entry.status === 'serving' ? 'default' : 'secondary'}>
                    {entry.status === 'waiting' ? 'Aguardando' : entry.status === 'serving' ? 'Atendendo' : 'Suspenso'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente do Ranking
function RankingView({ 
  theme, 
  selectedBranch, 
  onShowTopPerformer,
  vendorStats
}: { 
  theme: 'dark' | 'light'; 
  selectedBranch: string;
  onShowTopPerformer: () => void;
  vendorStats: any[];
}) {
  const stats = vendorStats.sort((a, b) => b.totalValue - a.totalValue);
  
  return (
    <div className="space-y-6">
      {/* Top Performer Badge */}
      <Card 
        className={`${theme === 'dark' ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/30' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'} cursor-pointer hover:scale-[1.02] transition-transform`}
        onClick={onShowTopPerformer}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Crown className="h-12 w-12 text-yellow-500" />
            <Avatar className="h-16 w-16 border-4 border-yellow-500/50">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Vendedor do Dia</h2>
              <p className="text-lg">Maria Santos - {formatCurrency(28750)}</p>
              <Badge className="mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                💎 Meta Diamante Atingida
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Ranking de Vendas - Dezembro 2024</h3>
        
        {stats.map((stat, index) => {
          const user = mockUsers.find(u => u.id === stat.vendorId);
          if (!user) return null;
          
          return (
            <Card key={stat.vendorId} className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} transition-all hover:scale-[1.02]`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-600' :
                    'bg-gradient-to-r from-gray-400 to-gray-600'
                  } text-white`}>
                    {index + 1}
                  </div>

                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.photo} />
                    <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm opacity-70">Vendedor</p>
                      <p className="font-semibold">{user.name}</p>
                      <Badge variant="outline" className="text-xs mt-1 capitalize">
                        {stat.currentLevel}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Total Vendas</p>
                      <p className="font-bold text-green-500">{formatCurrency(stat.totalValue)}</p>
                      <p className="text-xs opacity-70">{stat.totalSales} vendas</p>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Ticket Médio</p>
                      <p className="font-semibold">{formatCurrency(stat.ticketMedio)}</p>
                      <p className="text-xs opacity-70">PA: {stat.pa.toFixed(1)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm opacity-70">Projeção Mensal</p>
                      <p className="font-semibold">{formatCurrency(stat.projection)}</p>
                      <p className="text-xs opacity-70">
                        {stat.currentLevel === 'diamond' ? '✅ Meta atingida' : `Falta ${formatCurrency(stat.missingToDiamond)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Componente do Painel do Gestor
function ManagerView({ 
  theme, 
  selectedBranch,
  sales,
  approveSale,
  rejectSale,
  addSystemLog,
  user
}: { 
  theme: 'dark' | 'light'; 
  selectedBranch: string;
  sales: any[];
  approveSale: any;
  rejectSale: any;
  addSystemLog: any;
  user: any;
}) {
  const handleApproveSale = async (saleId: string) => {
    const result = await approveSale(saleId);
    if (result.success && user) {
      await addSystemLog(user.id, user.name, user.role, 'Aprovou venda', `Venda aprovada pelo gestor`);
    }
  };

  const handleRejectSale = async (saleId: string) => {
    const result = await rejectSale(saleId);
    if (result.success && user) {
      await addSystemLog(user.id, user.name, user.role, 'Rejeitou venda', `Venda rejeitada pelo gestor`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">Painel do Gestor</h1>
          <p className="text-sm opacity-70">Aprovar vendas e gerenciar equipe</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{formatCurrency(37450)}</div>
            <p className="text-sm opacity-70">Vendas do Dia</p>
          </CardContent>
        </Card>
        
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">45</div>
            <p className="text-sm opacity-70">Vendas Realizadas</p>
          </CardContent>
        </Card>
        
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(832)}</div>
            <p className="text-sm opacity-70">Ticket Médio</p>
          </CardContent>
        </Card>
        
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-500">3.0</div>
            <p className="text-sm opacity-70">PA Médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-orange-500" />
            Vendas Pendentes de Aprovação
            <Badge variant="destructive">{sales.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>V</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Vendedor</p>
                      <p className="text-sm opacity-70">
                        {formatCurrency(sale.value)} • {sale.item_count} itens
                      </p>
                      <p className="text-xs opacity-50">
                        {new Date(sale.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveSale(sale.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleRejectSale(sale.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}