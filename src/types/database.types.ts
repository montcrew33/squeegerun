export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      communication_log: {
        Row: {
          content: string | null
          created_at: string | null
          customer_id: string
          direction: string | null
          id: string
          job_id: string | null
          logged_by: string | null
          organization_id: string
          subject: string | null
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          customer_id: string
          direction?: string | null
          id?: string
          job_id?: string | null
          logged_by?: string | null
          organization_id: string
          subject?: string | null
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          customer_id?: string
          direction?: string | null
          id?: string
          job_id?: string | null
          logged_by?: string | null
          organization_id?: string
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_log_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          job_id: string | null
          quantity: number | null
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          job_id?: string | null
          quantity?: number | null
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          job_id?: string | null
          quantity?: number | null
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid_cents: number | null
          created_at: string | null
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string | null
          notes: string | null
          organization_id: string
          paid_date: string | null
          status: string | null
          subtotal_cents: number
          tax_cents: number
          tax_rate: number | null
          total_cents: number
          updated_at: string | null
        }
        Insert: {
          amount_paid_cents?: number | null
          created_at?: string | null
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string | null
          notes?: string | null
          organization_id: string
          paid_date?: string | null
          status?: string | null
          subtotal_cents?: number
          tax_cents?: number
          tax_rate?: number | null
          total_cents?: number
          updated_at?: string | null
        }
        Update: {
          amount_paid_cents?: number | null
          created_at?: string | null
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string | null
          notes?: string | null
          organization_id?: string
          paid_date?: string | null
          status?: string | null
          subtotal_cents?: number
          tax_cents?: number
          tax_rate?: number | null
          total_cents?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          job_id: string
          quantity: number | null
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          job_id: string
          quantity?: number | null
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          job_id?: string
          quantity?: number | null
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_line_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          job_id: string
          new_status: string
          notes: string | null
          previous_status: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          new_status: string
          notes?: string | null
          previous_status?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_status_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          assigned_to: string | null
          completion_notes: string | null
          created_at: string | null
          customer_id: string
          id: string
          notes: string | null
          organization_id: string
          price_cents: number | null
          recurring_schedule_id: string | null
          scheduled_date: string
          scheduled_time_end: string | null
          scheduled_time_start: string | null
          service_address_id: string
          status: string | null
          updated_at: string | null
          weather_conditions: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          assigned_to?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          organization_id: string
          price_cents?: number | null
          recurring_schedule_id?: string | null
          scheduled_date: string
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          service_address_id: string
          status?: string | null
          updated_at?: string | null
          weather_conditions?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          assigned_to?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          price_cents?: number | null
          recurring_schedule_id?: string | null
          scheduled_date?: string
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          service_address_id?: string
          status?: string | null
          updated_at?: string | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_recurring_schedule_id_fkey"
            columns: ["recurring_schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_service_address_id_fkey"
            columns: ["service_address_id"]
            isOneToOne: false
            referencedRelation: "service_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          settings: Json | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method: string | null
          payment_reference: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          organization_id: string
          payment_date: string
          payment_method?: string | null
          payment_reference?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method?: string | null
          payment_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_schedules: {
        Row: {
          created_at: string | null
          customer_id: string
          estimated_duration_minutes: number | null
          frequency: string
          id: string
          is_active: boolean | null
          last_service_date: string | null
          next_service_date: string | null
          notes: string | null
          organization_id: string
          preferred_day: number | null
          preferred_time_end: string | null
          preferred_time_start: string | null
          price_cents: number
          service_address_id: string
          service_types: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          estimated_duration_minutes?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_service_date?: string | null
          next_service_date?: string | null
          notes?: string | null
          organization_id: string
          preferred_day?: number | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          price_cents: number
          service_address_id: string
          service_types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          estimated_duration_minutes?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_service_date?: string | null
          next_service_date?: string | null
          notes?: string | null
          organization_id?: string
          preferred_day?: number | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          price_cents?: number
          service_address_id?: string
          service_types?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedules_service_address_id_fkey"
            columns: ["service_address_id"]
            isOneToOne: false
            referencedRelation: "service_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      service_addresses: {
        Row: {
          access_notes: string | null
          city: string
          country: string | null
          created_at: string | null
          customer_id: string
          id: string
          is_primary: boolean | null
          label: string | null
          latitude: number | null
          longitude: number | null
          organization_id: string
          postal_code: string
          property_type: string | null
          state: string
          street_address: string
          unit: string | null
          updated_at: string | null
          window_count: number | null
        }
        Insert: {
          access_notes?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          is_primary?: boolean | null
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          organization_id: string
          postal_code: string
          property_type?: string | null
          state: string
          street_address: string
          unit?: string | null
          updated_at?: string | null
          window_count?: number | null
        }
        Update: {
          access_notes?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          is_primary?: boolean | null
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          organization_id?: string
          postal_code?: string
          property_type?: string | null
          state?: string
          street_address?: string
          unit?: string | null
          updated_at?: string | null
          window_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_addresses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
