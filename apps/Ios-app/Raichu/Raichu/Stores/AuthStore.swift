// AuthStore.swift
// Raichu
// Authentication state: session, profile, sign in/up/out.

import SwiftUI
import Combine
import Supabase

@MainActor
final class AuthStore: ObservableObject {
    @Published var session: Session? = nil
    @Published var profile: Profile? = nil
    @Published var initialized: Bool = false
    @Published var loading: Bool = false
    @Published var error: String? = nil

    var isAuthenticated: Bool { session != nil }
    var userId: String? { session?.user.id.uuidString }
    var accessToken: String? { session?.accessToken }

    func initialize() async {
        // Restore existing session from Keychain (supabase-swift handles storage)
        session = try? await supabase.auth.session

        if session != nil {
            await fetchProfile()
        }

        // Listen for future auth state changes
        Task {
            for await (_, newSession) in supabase.auth.authStateChanges {
                self.session = newSession
                if newSession != nil {
                    await self.fetchProfile()
                } else {
                    self.profile = nil
                }
            }
        }

        initialized = true
    }

    func signIn(email: String, password: String) async throws {
        loading = true
        error = nil
        defer { loading = false }

        let result = try await supabase.auth.signIn(email: email, password: password)
        session = result
        await fetchProfile()
    }

    func signUp(email: String, password: String, username: String) async throws {
        loading = true
        error = nil
        defer { loading = false }

        let result = try await supabase.auth.signUp(
            email: email,
            password: password,
            data: ["username": .string(username)]
        )
        session = result.session
        if result.session != nil {
            await fetchProfile()
        }
    }

    func signInWithGoogle() async throws {
        // Opens Safari for OAuth — supabase-swift handles the redirect
        try await supabase.auth.signInWithOAuth(provider: .google)
    }

    func signOut() async {
        try? await supabase.auth.signOut()
        session = nil
        profile = nil
    }

    func fetchProfile() async {
        guard let userId else { return }

        do {
            let p: Profile = try await supabase
                .from("profiles")
                .select()
                .eq("id", value: userId)
                .single()
                .execute()
                .value
            profile = p
        } catch {
            // Profile fetch failure is non-fatal — user can still play offline
        }
    }

    func updateProfile(displayName: String? = nil, avatarUrl: String? = nil) async throws {
        guard let userId else { return }

        var updates: [String: AnyJSON] = [:]
        if let displayName { updates["display_name"] = .string(displayName) }
        if let avatarUrl { updates["avatar_url"] = .string(avatarUrl) }
        guard !updates.isEmpty else { return }

        try await supabase
            .from("profiles")
            .update(updates)
            .eq("id", value: userId)
            .execute()

        await fetchProfile()
    }
}
