export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          organization_id: string
          name: string
          email?: string
          phone?: string
          tags?: string[]
          notes?: string
          status?: string
          source?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email?: string
          phone?: string
          tags?: string[]
          notes?: string
          status?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string
          phone?: string
          tags?: string[]
          notes?: string
          status?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          job_id?: string
          type: 'rain_delay' | 'reminder' | 'on_my_way' | 'invoice' | 'completion'
          channel: 'email' | 'sms' | 'both'
          message: string
          status: 'pending' | 'sent' | 'failed' | 'cancelled'
          scheduled_for: string
          sent_at?: string
          error_message?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          job_id?: string
          type: 'rain_delay' | 'reminder' | 'on_my_way' | 'invoice' | 'completion'
          channel?: 'email' | 'sms' | 'both'
          message: string
          status?: 'pending' | 'sent' | 'failed' | 'cancelled'
          scheduled_for?: string
          sent_at?: string
          error_message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string
          job_id?: string
          type?: 'rain_delay' | 'reminder' | 'on_my_way' | 'invoice' | 'completion'
          channel?: 'email' | 'sms' | 'both'
          message?: string
          status?: 'pending' | 'sent' | 'failed' | 'cancelled'
          scheduled_for?: string
          sent_at?: string
          error_message?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
      [key: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}