// SupabaseClient.swift
// Raichu
// Singleton Supabase client. The anon key must be set before shipping.

import Foundation

// MARK: - Configuration

enum AppConfig {
    static let supabaseURL = "https://jfqofulsmcjqudwnxekb.supabase.co"

    // Replace with actual anon key from Supabase Dashboard → Settings → API
    static let supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"

    #if DEBUG
    static let apiBaseURL = "http://localhost:3001/api/v1"
    #else
    static let apiBaseURL = "https://raichu.live/api/v1"
    #endif
}
