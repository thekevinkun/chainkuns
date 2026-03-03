export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      events: {
        Row: {
          banner_image_url: string | null;
          contract_address: string | null;
          created_at: string | null;
          description: string | null;
          event_date: string;
          id: string;
          organizer_id: string | null;
          royalty_percent: number;
          status: string | null;
          ticket_price_eth: number;
          title: string;
          total_supply: number;
          venue: string | null;
        };
        Insert: {
          banner_image_url?: string | null;
          contract_address?: string | null;
          created_at?: string | null;
          description?: string | null;
          event_date: string;
          id?: string;
          organizer_id?: string | null;
          royalty_percent: number;
          status?: string | null;
          ticket_price_eth: number;
          title: string;
          total_supply: number;
          venue?: string | null;
        };
        Update: {
          banner_image_url?: string | null;
          contract_address?: string | null;
          created_at?: string | null;
          description?: string | null;
          event_date?: string;
          id?: string;
          organizer_id?: string | null;
          royalty_percent?: number;
          status?: string | null;
          ticket_price_eth?: number;
          title?: string;
          total_supply?: number;
          venue?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "organizer_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          created_at: string | null;
          id: string;
          list_tx_hash: string | null;
          price_eth: number;
          seller_wallet: string;
          status: string | null;
          ticket_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          list_tx_hash?: string | null;
          price_eth: number;
          seller_wallet: string;
          status?: string | null;
          ticket_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          list_tx_hash?: string | null;
          price_eth?: number;
          seller_wallet?: string;
          status?: string | null;
          ticket_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "listings_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      organizer_profiles: {
        Row: {
          bio: string | null;
          created_at: string | null;
          display_name: string;
          id: string;
          status: "pending" | "approved" | "rejected";
          logo_url: string | null;
          user_id: string | null;
        };
        Insert: {
          bio?: string | null;
          created_at?: string | null;
          display_name: string;
          id?: string;
          status?: "pending" | "approved" | "rejected";
          logo_url?: string | null;
          user_id?: string | null;
        };
        Update: {
          bio?: string | null;
          created_at?: string | null;
          display_name?: string;
          id?: string;
          status?: "pending" | "approved" | "rejected";
          logo_url?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organizer_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          created_at: string | null;
          event_id: string | null;
          id: string;
          idempotency_key: string | null;
          is_used: boolean | null;
          mint_tx_hash: string | null;
          owner_wallet: string;
          token_id: number;
        };
        Insert: {
          created_at?: string | null;
          event_id?: string | null;
          id?: string;
          idempotency_key?: string | null;
          is_used?: boolean | null;
          mint_tx_hash?: string | null;
          owner_wallet: string;
          token_id: number;
        };
        Update: {
          created_at?: string | null;
          event_id?: string | null;
          id?: string;
          idempotency_key?: string | null;
          is_used?: boolean | null;
          mint_tx_hash?: string | null;
          owner_wallet?: string;
          token_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          id: string;
          wallet_address: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          wallet_address: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          wallet_address?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
