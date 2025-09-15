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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bas_accounts: {
        Row: {
          account_number: number
          default_type: string
          description: string
        }
        Insert: {
          account_number: number
          default_type: string
          description: string
        }
        Update: {
          account_number?: number
          default_type?: string
          description?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          organisation_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organisation_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organisation_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      company_accounts: {
        Row: {
          account_number: number
          active: boolean | null
          balance: number | null
          company_id: string
          created_at: string | null
          custom_description: string | null
          id: string
          updated_at: string | null
          vat_code: number | null
        }
        Insert: {
          account_number: number
          active?: boolean | null
          balance?: number | null
          company_id: string
          created_at?: string | null
          custom_description?: string | null
          id?: string
          updated_at?: string | null
          vat_code?: number | null
        }
        Update: {
          account_number?: number
          active?: boolean | null
          balance?: number | null
          company_id?: string
          created_at?: string | null
          custom_description?: string | null
          id?: string
          updated_at?: string | null
          vat_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_accounts_account_number_fkey"
            columns: ["account_number"]
            isOneToOne: false
            referencedRelation: "bas_accounts"
            referencedColumns: ["account_number"]
          },
          {
            foreignKeyName: "company_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_years: {
        Row: {
          account_chart_type: string | null
          accounting_method: string | null
          company_id: string
          fortnox_id: number
          from_date: string
          id: string
          inserted_at: string | null
          is_active: boolean
          to_date: string
          updated_at: string | null
        }
        Insert: {
          account_chart_type?: string | null
          accounting_method?: string | null
          company_id: string
          fortnox_id: number
          from_date: string
          id?: string
          inserted_at?: string | null
          is_active: boolean
          to_date: string
          updated_at?: string | null
        }
        Update: {
          account_chart_type?: string | null
          accounting_method?: string | null
          company_id?: string
          fortnox_id?: number
          from_date?: string
          id?: string
          inserted_at?: string | null
          is_active?: boolean
          to_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_years_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fortnox_integrations: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          has_synced: boolean | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          has_synced?: boolean | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          has_synced?: boolean | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fortnox_voucher_transactions: {
        Row: {
          account: number
          cost_center: string | null
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string | null
          id: string
          project: string | null
          quantity: number | null
          removed: boolean | null
          transaction_information: string | null
          voucher_id: string
        }
        Insert: {
          account: number
          cost_center?: string | null
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          id: string
          project?: string | null
          quantity?: number | null
          removed?: boolean | null
          transaction_information?: string | null
          voucher_id: string
        }
        Update: {
          account?: number
          cost_center?: string | null
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          id?: string
          project?: string | null
          quantity?: number | null
          removed?: boolean | null
          transaction_information?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fortnox_voucher_transactions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "fortnox_vouchers"
            referencedColumns: ["voucher_id"]
          },
        ]
      }
      fortnox_vouchers: {
        Row: {
          approval_state: number | null
          comments: string | null
          company_id: string | null
          cost_center: string | null
          created_at: string | null
          description: string | null
          project: string | null
          reference_number: string | null
          reference_type: string | null
          transaction_date: string
          updated_at: string | null
          voucher_id: string
          voucher_number: number
          voucher_series: string
          year: number
        }
        Insert: {
          approval_state?: number | null
          comments?: string | null
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          description?: string | null
          project?: string | null
          reference_number?: string | null
          reference_type?: string | null
          transaction_date: string
          updated_at?: string | null
          voucher_id: string
          voucher_number: number
          voucher_series: string
          year: number
        }
        Update: {
          approval_state?: number | null
          comments?: string | null
          company_id?: string | null
          cost_center?: string | null
          created_at?: string | null
          description?: string | null
          project?: string | null
          reference_number?: string | null
          reference_type?: string | null
          transaction_date?: string
          updated_at?: string | null
          voucher_id?: string
          voucher_number?: number
          voucher_series?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fortnox_vouchers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_admin: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_admin?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_in: number | null
          id: string
          refresh_token: string | null
          scope: string | null
          state: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_in?: number | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          state: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_in?: number | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          state?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_temp_oauth_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_company_kpi: {
        Args: { p_company_id: string } | { p_org_number: string }
        Returns: Json
      }
      get_company_kpi_by_orgnr: {
        Args: { p_org_number: string }
        Returns: Json
      }
      get_company_revenue: {
        Args: { p_company_id: string }
        Returns: Json
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
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
