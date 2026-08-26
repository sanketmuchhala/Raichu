// SupabaseClient.swift
// Raichu
// Singleton Supabase client. The anon key must be set before shipping.

import Foundation
import Supabase

// MARK: - Configuration

enum AppConfig {
    /// Must match CFBundleURLSchemes in Info.plist. Supabase's redirect
    /// allowlist is configured for this exact value.
    static let urlScheme = "com.raichugame.ios"
    static let oauthCallbackURL = URL(string: "\(urlScheme)://login-callback")

    static let supabaseURL = "https://jfqofulsmcjqudwnxekb.supabase.co"

    /// Parsed once. The literal above is a compile-time constant, so a failure
    /// here is a build-time typo rather than anything a user can hit — but the
    /// project bans force-unwraps, and a bad URL should be loud, not a crash
    /// on a random line.
    static let supabaseURLValue: URL = {
        guard let url = URL(string: supabaseURL) else {
            preconditionFailure("AppConfig.supabaseURL is not a valid URL: \(supabaseURL)")
        }
        return url
    }()

    /// `false` when SUPABASE_ANON_KEY is missing from the scheme environment,
    /// in which case every auth and Realtime call will fail at runtime.
    static var isConfigured: Bool { supabaseAnonKey != anonKeyPlaceholder }

    static let anonKeyPlaceholder = "YOUR_SUPABASE_ANON_KEY"

    // Read from Xcode scheme environment variable SUPABASE_ANON_KEY
    static let supabaseAnonKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? anonKeyPlaceholder

    #if DEBUG
    static let apiBaseURL = "http://localhost:3001/api/v1"
    #else
    static let apiBaseURL = "https://raichu.live/api/v1"
    #endif
}

// MARK: - Supabase singleton

let supabase = SupabaseClient(
    supabaseURL: AppConfig.supabaseURLValue,
    supabaseKey: AppConfig.supabaseAnonKey,
    options: SupabaseClientOptions(
        auth: SupabaseClientOptions.AuthOptions(
            // Opt in to new behavior: emit locally stored session without network refresh
            // Silences the deprecation warning from supabase-swift
            emitLocalSessionAsInitialSession: true
        )
    )
)
