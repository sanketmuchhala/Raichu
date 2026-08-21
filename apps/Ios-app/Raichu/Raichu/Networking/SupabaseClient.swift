// SupabaseClient.swift
// Raichu
// Singleton Supabase client. The anon key must be set before shipping.

import Foundation
import Supabase

// MARK: - Configuration

enum AppConfig {
    static let supabaseURL = "https://jfqofulsmcjqudwnxekb.supabase.co"

    // Read from Xcode scheme environment variable SUPABASE_ANON_KEY
    static let supabaseAnonKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? "YOUR_SUPABASE_ANON_KEY"

    #if DEBUG
    static let apiBaseURL = "http://localhost:3001/api/v1"
    #else
    static let apiBaseURL = "https://raichu.live/api/v1"
    #endif
}

// MARK: - Supabase singleton

let supabase = SupabaseClient(
    supabaseURL: URL(string: AppConfig.supabaseURL)!,
    supabaseKey: AppConfig.supabaseAnonKey,
    options: SupabaseClientOptions(
        auth: SupabaseClientOptions.AuthOptions(
            // Opt in to new behavior: emit locally stored session without network refresh
            // Silences the deprecation warning from supabase-swift
            emitLocalSessionAsInitialSession: true
        )
    )
)
