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
      badges: {
        Row: {
          category: string
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          category: string
          description: string
          icon: string
          id: string
          name: string
        }
        Update: {
          category?: string
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      deep_sky_catalog: {
        Row: {
          angular_size: string | null
          best_months: string[]
          catalog: string
          constellation: string
          created_at: string
          declination: string
          description: string
          distance: string | null
          id: string
          magnitude: number
          object_name: string
          object_type: string
          photography_tips: string | null
          right_ascension: string
          visibility_level: string
        }
        Insert: {
          angular_size?: string | null
          best_months?: string[]
          catalog: string
          constellation: string
          created_at?: string
          declination: string
          description?: string
          distance?: string | null
          id: string
          magnitude?: number
          object_name: string
          object_type: string
          photography_tips?: string | null
          right_ascension: string
          visibility_level?: string
        }
        Update: {
          angular_size?: string | null
          best_months?: string[]
          catalog?: string
          constellation?: string
          created_at?: string
          declination?: string
          description?: string
          distance?: string | null
          id?: string
          magnitude?: number
          object_name?: string
          object_type?: string
          photography_tips?: string | null
          right_ascension?: string
          visibility_level?: string
        }
        Relationships: []
      }
      observations: {
        Row: {
          alternate_matches: Json | null
          anonymized: boolean | null
          atmospheric_conditions: string | null
          brightness_estimate: number | null
          confidence: number | null
          constellation_id: string
          constellation_name: string
          created_at: string
          date: string | null
          device_type: string | null
          equipment: string | null
          id: string
          image_url: string | null
          location: string | null
          notes: string | null
          observation_success: boolean | null
          sky_dec: number | null
          sky_quality: string | null
          sky_ra: number | null
          user_id: string
        }
        Insert: {
          alternate_matches?: Json | null
          anonymized?: boolean | null
          atmospheric_conditions?: string | null
          brightness_estimate?: number | null
          confidence?: number | null
          constellation_id: string
          constellation_name: string
          created_at?: string
          date?: string | null
          device_type?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          notes?: string | null
          observation_success?: boolean | null
          sky_dec?: number | null
          sky_quality?: string | null
          sky_ra?: number | null
          user_id: string
        }
        Update: {
          alternate_matches?: Json | null
          anonymized?: boolean | null
          atmospheric_conditions?: string | null
          brightness_estimate?: number | null
          confidence?: number | null
          constellation_id?: string
          constellation_name?: string
          created_at?: string
          date?: string | null
          device_type?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          notes?: string | null
          observation_success?: boolean | null
          sky_dec?: number | null
          sky_quality?: string | null
          sky_ra?: number | null
          user_id?: string
        }
        Relationships: []
      }
      planets: {
        Row: {
          created_at: string
          description: string
          eccentricity: number
          id: string
          inclination: number
          mean_longitude_j2000: number
          orbital_period_years: number
          planet_name: string
          semi_major_axis_au: number
          typical_magnitude: number
        }
        Insert: {
          created_at?: string
          description?: string
          eccentricity?: number
          id: string
          inclination?: number
          mean_longitude_j2000?: number
          orbital_period_years: number
          planet_name: string
          semi_major_axis_au: number
          typical_magnitude?: number
        }
        Update: {
          created_at?: string
          description?: string
          eccentricity?: number
          id?: string
          inclination?: number
          mean_longitude_j2000?: number
          orbital_period_years?: number
          planet_name?: string
          semi_major_axis_au?: number
          typical_magnitude?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sky_alerts: {
        Row: {
          active: boolean | null
          alert_type: string
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          object_id: string | null
          object_name: string | null
          observation_count: number | null
          region: string | null
          severity: string
          title: string
        }
        Insert: {
          active?: boolean | null
          alert_type?: string
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          object_id?: string | null
          object_name?: string | null
          observation_count?: number | null
          region?: string | null
          severity?: string
          title: string
        }
        Update: {
          active?: boolean | null
          alert_type?: string
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          object_id?: string | null
          object_name?: string | null
          observation_count?: number | null
          region?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      sky_observations_aggregate: {
        Row: {
          avg_brightness: number | null
          avg_confidence: number | null
          created_at: string | null
          equipment_distribution: Json | null
          hour_bucket: number
          id: string
          latitude_bucket: number
          longitude_bucket: number
          object_id: string
          object_name: string
          object_type: string
          observation_count: number | null
          observation_date: string
          region_key: string
          updated_at: string | null
        }
        Insert: {
          avg_brightness?: number | null
          avg_confidence?: number | null
          created_at?: string | null
          equipment_distribution?: Json | null
          hour_bucket: number
          id?: string
          latitude_bucket: number
          longitude_bucket: number
          object_id: string
          object_name: string
          object_type: string
          observation_count?: number | null
          observation_date: string
          region_key: string
          updated_at?: string | null
        }
        Update: {
          avg_brightness?: number | null
          avg_confidence?: number | null
          created_at?: string | null
          equipment_distribution?: Json | null
          hour_bucket?: number
          id?: string
          latitude_bucket?: number
          longitude_bucket?: number
          object_id?: string
          object_name?: string
          object_type?: string
          observation_count?: number | null
          observation_date?: string
          region_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sky_quality_zones: {
        Row: {
          bortle_level: number
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          radius_km: number | null
          recommended_targets: string[]
          sky_darkness_score: number
        }
        Insert: {
          bortle_level: number
          created_at?: string
          id: string
          latitude?: number | null
          longitude?: number | null
          name: string
          radius_km?: number | null
          recommended_targets?: string[]
          sky_darkness_score?: number
        }
        Update: {
          bortle_level?: number
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          radius_km?: number | null
          recommended_targets?: string[]
          sky_darkness_score?: number
        }
        Relationships: []
      }
      star_catalog: {
        Row: {
          catalog_id: string
          color: string | null
          constellation: string
          created_at: string
          declination: number
          distance: string | null
          id: string
          luminosity: number | null
          magnitude: number
          name: string
          right_ascension: number
          spectral_type: string
        }
        Insert: {
          catalog_id: string
          color?: string | null
          constellation: string
          created_at?: string
          declination: number
          distance?: string | null
          id: string
          luminosity?: number | null
          magnitude: number
          name: string
          right_ascension: number
          spectral_type?: string
        }
        Update: {
          catalog_id?: string
          color?: string | null
          constellation?: string
          created_at?: string
          declination?: number
          distance?: string | null
          id?: string
          luminosity?: number | null
          magnitude?: number
          name?: string
          right_ascension?: number
          spectral_type?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          constellations_found: string[] | null
          created_at: string
          id: string
          last_observation_date: string | null
          streak_days: number | null
          total_observations: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          constellations_found?: string[] | null
          created_at?: string
          id?: string
          last_observation_date?: string | null
          streak_days?: number | null
          total_observations?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          constellations_found?: string[] | null
          created_at?: string
          id?: string
          last_observation_date?: string | null
          streak_days?: number | null
          total_observations?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          created_at: string
          description: string
          id: string
          target_constellation_id: string | null
          target_type: string
          title: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          target_constellation_id?: string | null
          target_type: string
          title: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          target_constellation_id?: string | null
          target_type?: string
          title?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
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
