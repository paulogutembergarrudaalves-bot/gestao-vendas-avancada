import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'gestor' | 'vendedor' | 'supervisor'
  photo?: string
  login: string
  password_hash: string
  unit_id?: string
  unit_ids?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  name: string
  icon: string
  manager_id?: string
  manager_name?: string
  vendors_count: number
  monthly_goal: number
  current_sales: number
  conversion_rate: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  vendor_id: string
  unit_id: string
  value: number
  item_count: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface QueueEntry {
  id: string
  vendor_id: string
  unit_id: string
  position: number
  status: 'waiting' | 'serving' | 'suspended'
  start_time?: string
  customer_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SystemLog {
  id: string
  user_id: string
  user_name: string
  user_role: string
  action: string
  details: string
  unit_id?: string
  unit_name?: string
  created_at: string
}