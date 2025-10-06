"use client";

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, MessageCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notification } from '@/lib/types';

interface NotificationSystemProps {
  theme: 'dark' | 'light';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'goal_achievement',
    title: 'Meta Bronze Atingida! 🥉',
    message: 'Parabéns! Você atingiu a meta bronze desta dezena.',
    isRead: false,
    createdAt: new Date(Date.now() - 300000) // 5 minutos atrás
  },
  {
    id: '2',
    userId: '1',
    type: 'queue_reminder',
    title: 'Lembrete da Fila',
    message: 'Há 15 minutos sem atividade. Entre na fila para atender clientes!',
    isRead: false,
    createdAt: new Date(Date.now() - 900000) // 15 minutos atrás
  },
  {
    id: '3',
    userId: '1',
    type: 'chat_message',
    title: 'Nova mensagem do gestor',
    message: 'Carlos Oliveira: "Ótimo trabalho hoje pessoal!"',
    isRead: true,
    createdAt: new Date(Date.now() - 1800000) // 30 minutos atrás
  }
];

export function NotificationSystem({ theme }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBadgeOfDay, setShowBadgeOfDay] = useState(true);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'goal_achievement':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'queue_reminder':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'chat_message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'approval_needed':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className={`absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border shadow-lg z-50 ${
            theme === 'dark' 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold">Notificações</h3>
              {unreadCount > 0 && (
                <p className="text-sm opacity-70">{unreadCount} não lidas</p>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm opacity-70">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                      !notification.isRead ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs opacity-70 mt-1">{notification.message}</p>
                            <p className="text-xs opacity-50 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNotification(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Badge of the Day Popup */}
      {showBadgeOfDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`max-w-md w-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-yellow-500/30' 
              : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
          }`}>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl">
                  🏅
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Vendedor do Dia!</h2>
              <p className="text-lg mb-4">
                Parabéns! Você é o vendedor destaque de hoje com {' '}
                <span className="font-bold text-green-500">R$ 18.750</span> em vendas!
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Maria Santos</p>
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    💎 Meta Diamante
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowBadgeOfDay(false)}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}