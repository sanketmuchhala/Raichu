// AuthStore.swift
// Raichu
// Authentication state: session, profile, sign in/up/out.
// NOTE: Supabase SDK integration points are stubbed until the package is added.

import SwiftUI
import Combine

// Minimal user session type (replace with Supabase Session when SDK is added)
struct UserSession {
    let userId: String
    let email: String
    let accessToken: String
}

@MainActor
final class AuthStore: ObservableObject {
    @Published var session: UserSession? = nil
    @Published var profile: Profile? = nil
    @Published var initialized: Bool = false
    @Published var loading: Bool = false
    @Published var error: String? = nil

    var isAuthenticated: Bool { session != nil }
    var userId: String? { session?.userId }
    var accessToken: String? { session?.accessToken }

    func initialize() async {
        // TODO: Check existing Supabase session from Keychain
        // let existingSession = try? await supabase.auth.session
        // if let s = existingSession { ... }
        initialized = true
    }

    func signIn(email: String, password: String) async throws {
        loading = true
        error = nil
        defer { loading = false }

        // TODO: Implement with Supabase SDK
        // let session = try await supabase.auth.signIn(email: email, password: password)
        // self.session = UserSession(userId: session.user.id.uuidString, ...)
        throw APIClientError.serverError("Supabase SDK not yet integrated. Add supabase-swift package.")
    }

    func signUp(email: String, password: String, username: String) async throws {
        loading = true
        error = nil
        defer { loading = false }

        // TODO: Implement with Supabase SDK
        // let result = try await supabase.auth.signUp(email: email, password: password,
        //     data: ["username": .string(username)])
        throw APIClientError.serverError("Supabase SDK not yet integrated. Add supabase-swift package.")
    }

    func signInWithGoogle() async throws {
        // TODO: Implement with Supabase OAuth
        // try await supabase.auth.signInWithOAuth(provider: .google)
        throw APIClientError.serverError("Google OAuth not yet configured.")
    }

    func signOut() async {
        // TODO: await supabase.auth.signOut()
        session = nil
        profile = nil
    }

    func fetchProfile() async {
        guard let userId else { return }

        // TODO: Fetch from Supabase
        // let p: Profile = try await supabase.from("profiles").select().eq("id", value: userId).single().execute().value
        // self.profile = p
        _ = userId
    }

    func updateProfile(displayName: String? = nil, avatarUrl: String? = nil) async throws {
        // TODO: Supabase update
    }
}
