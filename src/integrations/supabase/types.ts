export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          base_ifs_version: string | null
          customer_id: string
          customer_name: string | null
          primary_industry: string | null
          release_version: string | null
        }
        Insert: {
          base_ifs_version?: string | null
          customer_id: string
          customer_name?: string | null
          primary_industry?: string | null
          release_version?: string | null
        }
        Update: {
          base_ifs_version?: string | null
          customer_id?: string
          customer_name?: string | null
          primary_industry?: string | null
          release_version?: string | null
        }
        Relationships: []
      }
      file_embeddings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string
          embedding: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chunk_index?: number
          chunk_text: string
          created_at?: string
          embedding?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          embedding?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ifs_customers: {
        Row: {
          created_at: string
          current_ml_usecases: string[] | null
          customer_name: string
          id: string
          industry: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_ml_usecases?: string[] | null
          customer_name: string
          id?: string
          industry: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_ml_usecases?: string[] | null
          customer_name?: string
          id?: string
          industry?: string
          updated_at?: string
        }
        Relationships: []
      }
      ifs_module_mappings: {
        Row: {
          base_ifs_version: string | null
          created_at: string
          description: string | null
          id: string
          min_version: string | null
          ml_capabilities: string[] | null
          module_code: string
          module_name: string
          primary_industry: string | null
          release_version: string | null
          updated_at: string
        }
        Insert: {
          base_ifs_version?: string | null
          created_at?: string
          description?: string | null
          id?: string
          min_version?: string | null
          ml_capabilities?: string[] | null
          module_code: string
          module_name: string
          primary_industry?: string | null
          release_version?: string | null
          updated_at?: string
        }
        Update: {
          base_ifs_version?: string | null
          created_at?: string
          description?: string | null
          id?: string
          min_version?: string | null
          ml_capabilities?: string[] | null
          module_code?: string
          module_name?: string
          primary_industry?: string | null
          release_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          industry_id: number
          industry_name: string | null
        }
        Insert: {
          industry_id?: never
          industry_name?: string | null
        }
        Update: {
          industry_id?: never
          industry_name?: string | null
        }
        Relationships: []
      }
      industry_use_cases: {
        Row: {
          industry_id: number
          position: number
          use_case_id: number
        }
        Insert: {
          industry_id: number
          position: number
          use_case_id: number
        }
        Update: {
          industry_id?: number
          position?: number
          use_case_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "industry_use_cases_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["industry_id"]
          },
          {
            foreignKeyName: "industry_use_cases_use_case_id_fkey"
            columns: ["use_case_id"]
            isOneToOne: false
            referencedRelation: "use_cases"
            referencedColumns: ["use_case_id"]
          },
        ]
      }
      use_cases: {
        Row: {
          base_ifs_version: string | null
          description: string | null
          functional_area: string | null
          prerequisite: string | null
          release_version: string | null
          relevance: string | null
          required_processes: string | null
          short_description: string | null
          use_case_id: number
          use_case_name: string | null
        }
        Insert: {
          base_ifs_version?: string | null
          description?: string | null
          functional_area?: string | null
          prerequisite?: string | null
          release_version?: string | null
          relevance?: string | null
          required_processes?: string | null
          short_description?: string | null
          use_case_id?: never
          use_case_name?: string | null
        }
        Update: {
          base_ifs_version?: string | null
          description?: string | null
          functional_area?: string | null
          prerequisite?: string | null
          release_version?: string | null
          relevance?: string | null
          required_processes?: string | null
          short_description?: string | null
          use_case_id?: never
          use_case_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      embed_and_vectorize_file: {
        Args: { file_data: string }
        Returns: undefined
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      search_embeddings: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_user_id?: string
        }
        Returns: {
          id: string
          file_name: string
          chunk_text: string
          similarity: number
          metadata: Json
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
