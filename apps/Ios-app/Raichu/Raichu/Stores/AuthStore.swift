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

        // Load cached profile immediately for offline display (spec 6.3)
        profile = loadCachedProfile()

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

        do {
            let result = try await supabase.auth.signIn(email: email, password: password)
            session = result
            await fetchProfile()
            // Request push notification permission on first sign-in (spec 6.4 item 1)
            NotificationManager.shared.requestPermission()
        } catch {
            self.error = Self.message(for: error)
            throw error
        }
    }

    func signUp(email: String, password: String, username: String) async throws {
        loading = true
        error = nil
        defer { loading = false }

        do {
            let result = try await supabase.auth.signUp(
                email: email,
                password: password,
                data: ["username": .string(username)]
            )
            session = result.session
            if result.session != nil {
                await fetchProfile()
                // Request push notification permission on first sign-up (spec 6.4 item 1)
                NotificationManager.shared.requestPermission()
            }
        } catch {
            self.error = Self.message(for: error)
            throw error
        }
    }

    func signInWithGoogle() async throws {
        error = nil
        do {
            // Use in-app browser so the user stays in the app during OAuth.
            try await supabase.auth.signInWithOAuth(
                provider: .google,
                redirectTo: AppConfig.oauthCallbackURL
            )
        } catch {
            self.error = Self.message(for: error)
            throw error
        }
    }

    /// Completes an OAuth sign-in from the redirect back into the app. Called
    /// from `RaichuApp`'s `onOpenURL`; without it the callback is dropped and
    /// the user never gets signed in.
    func handleOpenURL(_ url: URL) async {
        guard url.scheme == AppConfig.urlScheme else { return }
        do {
            session = try await supabase.auth.session(from: url)
            await fetchProfile()
        } catch {
            self.error = Self.message(for: error)
        }
    }

    /// Supabase surfaces most failures as opaque decoding or API errors; this
    /// keeps the user-facing copy readable without swallowing the detail.
    private static func message(for error: Error) -> String {
        let described = (error as NSError).localizedDescription
        return described.isEmpty ? "Something went wrong. Please try again." : described
    }

    func signOut() async {
        try? await supabase.auth.signOut()
        session = nil
        profile = nil
        // Clear cached profile on sign out
        UserDefaults.standard.removeObject(forKey: "cachedProfile")
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
            // Cache profile for offline display (spec 6.3)
            if let data = try? JSONEncoder().encode(p) {
                UserDefaults.standard.set(data, forKey: "cachedProfile")
            }
        } catch {
            // Profile fetch failure is non-fatal — use cached value if present
        }
    }

    // MARK: - Cache helpers

    private func loadCachedProfile() -> Profile? {
        guard let data = UserDefaults.standard.data(forKey: "cachedProfile") else { return nil }
        return try? JSONDecoder().decode(Profile.self, from: data)
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
