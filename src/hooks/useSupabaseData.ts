import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Unit, Sale, QueueEntry, SystemLog } from '@/lib/supabase'

export function useSupabaseData() {
  const [units, setUnits] = useState<Unit[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([])
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Carregar unidades
      const { data: unitsData } = await supabase
        .from('units')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (unitsData) setUnits(unitsData)

      // Carregar vendas pendentes
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (salesData) setSales(salesData)

      // Carregar fila
      const { data: queueData } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true })
      
      if (queueData) setQueueEntries(queueData)

      // Carregar logs recentes
      const { data: logsData } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (logsData) setSystemLogs(logsData)

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para adicionar venda
  const addSale = async (vendorId: string, unitId: string, value: number, itemCount: number) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          vendor_id: vendorId,
          unit_id: unitId,
          value,
          item_count: itemCount,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar estado local
      setSales(prev => [data, ...prev])
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao adicionar venda:', error)
      return { success: false, error }
    }
  }

  // Função para aprovar venda
  const approveSale = async (saleId: string, newValue?: number, newItemCount?: number) => {
    try {
      const updateData: any = { status: 'approved' }
      if (newValue !== undefined) updateData.value = newValue
      if (newItemCount !== undefined) updateData.item_count = newItemCount

      const { error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', saleId)

      if (error) throw error

      // Remover da lista local de pendentes
      setSales(prev => prev.filter(sale => sale.id !== saleId))
      return { success: true }
    } catch (error) {
      console.error('Erro ao aprovar venda:', error)
      return { success: false, error }
    }
  }

  // Função para rejeitar venda
  const rejectSale = async (saleId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: 'rejected' })
        .eq('id', saleId)

      if (error) throw error

      // Remover da lista local de pendentes
      setSales(prev => prev.filter(sale => sale.id !== saleId))
      return { success: true }
    } catch (error) {
      console.error('Erro ao rejeitar venda:', error)
      return { success: false, error }
    }
  }

  // Função para adicionar entrada na fila
  const addToQueue = async (vendorId: string, unitId: string) => {
    try {
      // Buscar próxima posição
      const { data: maxPosition } = await supabase
        .from('queue_entries')
        .select('position')
        .eq('unit_id', unitId)
        .eq('is_active', true)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = maxPosition && maxPosition.length > 0 ? maxPosition[0].position + 1 : 1

      const { data, error } = await supabase
        .from('queue_entries')
        .insert({
          vendor_id: vendorId,
          unit_id: unitId,
          position: nextPosition,
          status: 'waiting'
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar estado local
      setQueueEntries(prev => [...prev, data].sort((a, b) => a.position - b.position))
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao entrar na fila:', error)
      return { success: false, error }
    }
  }

  // Função para remover da fila
  const removeFromQueue = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ is_active: false })
        .eq('id', entryId)

      if (error) throw error

      // Remover do estado local
      setQueueEntries(prev => prev.filter(entry => entry.id !== entryId))
      return { success: true }
    } catch (error) {
      console.error('Erro ao sair da fila:', error)
      return { success: false, error }
    }
  }

  // Função para adicionar log
  const addSystemLog = async (userId: string, userName: string, userRole: string, action: string, details: string, unitId?: string, unitName?: string) => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert({
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          action,
          details,
          unit_id: unitId,
          unit_name: unitName
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar estado local
      setSystemLogs(prev => [data, ...prev.slice(0, 49)]) // Manter apenas os 50 mais recentes
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao adicionar log:', error)
      return { success: false, error }
    }
  }

  return {
    units,
    sales,
    queueEntries,
    systemLogs,
    loading,
    addSale,
    approveSale,
    rejectSale,
    addToQueue,
    removeFromQueue,
    addSystemLog,
    refreshData: loadAllData
  }
}