export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          completed_rides: number
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed_at: string | null
          phone: string | null
          rating: number
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          completed_rides?: number
          created_at?: string
          full_name?: string | null
          id: string
          onboarding_completed_at?: string | null
          phone?: string | null
          rating?: number
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          completed_rides?: number
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          phone?: string | null
          rating?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          reviewed_user_id: string
          reviewer_id: string
          ride_id: string
          score: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          reviewed_user_id: string
          reviewer_id: string
          ride_id: string
          score: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          reviewed_user_id?: string
          reviewer_id?: string
          ride_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_reviewed_user_id_fkey"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          id: string
          passenger_id: string
          ride_id: string
          seats_reserved: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          passenger_id: string
          ride_id: string
          seats_reserved?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          passenger_id?: string
          ride_id?: string
          seats_reserved?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          available_seats: number
          created_at: string
          departure_time: string
          destination: string
          destination_address: string | null
          destination_lat: number | null
          destination_lng: number | null
          destination_location: unknown
          destination_place_name: string | null
          driver_id: string
          estimated_arrival_time: string | null
          id: string
          meeting_point: string | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          notes: string | null
          origin: string
          origin_address: string | null
          origin_lat: number | null
          origin_lng: number | null
          origin_location: unknown
          origin_place_name: string | null
          price_cordobas: number
          route_distance_meters: number | null
          route_duration_seconds: number | null
          route_polyline: string | null
          status: string
          vehicle_id: string | null
        }
        Insert: {
          available_seats?: number
          created_at?: string
          departure_time: string
          destination: string
          destination_address?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_location?: unknown
          destination_place_name?: string | null
          driver_id: string
          estimated_arrival_time?: string | null
          id?: string
          meeting_point?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          notes?: string | null
          origin: string
          origin_address?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_location?: unknown
          origin_place_name?: string | null
          price_cordobas?: number
          route_distance_meters?: number | null
          route_duration_seconds?: number | null
          route_polyline?: string | null
          status?: string
          vehicle_id?: string | null
        }
        Update: {
          available_seats?: number
          created_at?: string
          departure_time?: string
          destination?: string
          destination_address?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          destination_location?: unknown
          destination_place_name?: string | null
          driver_id?: string
          estimated_arrival_time?: string | null
          id?: string
          meeting_point?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          notes?: string | null
          origin?: string
          origin_address?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          origin_location?: unknown
          origin_place_name?: string | null
          price_cordobas?: number
          route_distance_meters?: number | null
          route_duration_seconds?: number | null
          route_polyline?: string | null
          status?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          id: string
          make: string
          model: string
          owner_id: string
          photo_url: string | null
          plate: string | null
          seats: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          make: string
          model: string
          owner_id: string
          photo_url?: string | null
          plate?: string | null
          seats?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          make?: string
          model?: string
          owner_id?: string
          photo_url?: string | null
          plate?: string | null
          seats?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_reservation: {
        Args: { p_reservation_id: string }
        Returns: boolean
      }
      reserve_seat: {
        Args: { p_ride_id: string; p_seats?: number }
        Returns: string
      }
      search_rides_nearby:
        | {
            Args: {
              p_destination_lat: number
              p_destination_lng: number
              p_origin_lat: number
              p_origin_lng: number
              p_radius_meters?: number
            }
            Returns: {
              available_seats: number
              created_at: string
              departure_time: string
              destination: string
              destination_address: string | null
              destination_lat: number | null
              destination_lng: number | null
              destination_location: unknown
              destination_place_name: string | null
              driver_id: string
              estimated_arrival_time: string | null
              id: string
              meeting_point: string | null
              meeting_point_lat: number | null
              meeting_point_lng: number | null
              notes: string | null
              origin: string
              origin_address: string | null
              origin_lat: number | null
              origin_lng: number | null
              origin_location: unknown
              origin_place_name: string | null
              price_cordobas: number
              route_distance_meters: number | null
              route_duration_seconds: number | null
              route_polyline: string | null
              status: string
              vehicle_id: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "rides"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: {
              radius_meters?: number
              search_dest_lat?: number
              search_dest_lng?: number
              search_origin_lat?: number
              search_origin_lng?: number
            }
            Returns: {
              available_seats: number
              created_at: string
              departure_time: string
              destination: string
              destination_address: string | null
              destination_lat: number | null
              destination_lng: number | null
              destination_location: unknown
              destination_place_name: string | null
              driver_id: string
              estimated_arrival_time: string | null
              id: string
              meeting_point: string | null
              meeting_point_lat: number | null
              meeting_point_lng: number | null
              notes: string | null
              origin: string
              origin_address: string | null
              origin_lat: number | null
              origin_lng: number | null
              origin_location: unknown
              origin_place_name: string | null
              price_cordobas: number
              route_distance_meters: number | null
              route_duration_seconds: number | null
              route_polyline: string | null
              status: string
              vehicle_id: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "rides"
              isOneToOne: false
              isSetofReturn: true
            }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
