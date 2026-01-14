// Re-export all database types
export * from './database.types'

// Custom app types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  customer_id: string
  scheduled_date: string
  status: string
  service_type: string
  price: number
  notes?: string
  created_at: string
}

export interface Invoice {
  id: string
  customer_id: string
  job_id: string
  amount: number
  status: string
  due_date: string
  paid_at?: string
  created_at: string
}