import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

export interface AuthUser {
  id: string
  name: string
  role: 'admin' | 'gestor' | 'vendedor' | 'supervisor'
  photo?: string
  unitId?: string
  unitIds?: string[]
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      // Buscar usuário no Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('login', username)
        .eq('is_active', true)
        .limit(1)

      if (error) {
        console.error('Erro na consulta:', error)
        return { success: false, error: 'Erro interno do servidor' }
      }

      if (!users || users.length === 0) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      const dbUser = users[0] as User

      // Em produção, você deve verificar o hash da senha
      // Por enquanto, vamos aceitar qualquer senha para demo
      const authUser: AuthUser = {
        id: dbUser.id,
        name: dbUser.name,
        role: dbUser.role,
        photo: dbUser.photo || undefined,
        unitId: dbUser.unit_id || undefined,
        unitIds: dbUser.unit_ids || undefined
      }

      // Salvar no localStorage
      localStorage.setItem('currentUser', JSON.stringify(authUser))
      setUser(authUser)

      // Registrar log de login
      await supabase.from('system_logs').insert({
        user_id: dbUser.id,
        user_name: dbUser.name,
        user_role: dbUser.role,
        action: 'Login realizado',
        details: `Usuário ${dbUser.name} fez login no sistema`
      })

      return { success: true, user: authUser }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  const logout = async () => {
    if (user) {
      // Registrar log de logout
      await supabase.from('system_logs').insert({
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        action: 'Logout realizado',
        details: `Usuário ${user.name} fez logout do sistema`
      })
    }

    localStorage.removeItem('currentUser')
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'gestor' || user?.role === 'supervisor',
    isVendor: user?.role === 'vendedor'
  }
}