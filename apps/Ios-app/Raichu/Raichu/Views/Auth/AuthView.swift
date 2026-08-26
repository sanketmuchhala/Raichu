// AuthView.swift
// Raichu
// Sign In / Sign Up with email+password. Google OAuth hook included.

import SwiftUI

struct AuthView: View {
    @EnvironmentObject var authStore: AuthStore
    @EnvironmentObject var uiStore: UIStore
    @Environment(\.theme) var theme

    @State private var tab = 0   // 0 = Sign In, 1 = Sign Up
    @State private var email = ""
    @State private var password = ""
    @State private var username = ""
    @State private var showPassword = false

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 28) {
                    // Logo
                    VStack(spacing: 8) {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 48))
                            .foregroundColor(theme.accent)
                            // Decorative: the wordmark below carries the name.
                            // Without this VoiceOver reads "crown dot fill".
                            .accessibilityHidden(true)
                        Text("Raichu")
                            .font(Typography.displayTitle)
                            .foregroundColor(theme.textPrimary)
                    }
                    .padding(.top, 32)

                    // Tab Picker
                    Picker("", selection: $tab) {
                        Text("Sign In").tag(0)
                        Text("Sign Up").tag(1)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)

                    // Form
                    VStack(spacing: 14) {
                        if tab == 1 {
                            inputField(placeholder: "Username (3–20 chars)", text: $username)
                        }
                        inputField(placeholder: "Email", text: $email)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)

                        // Password field with show/hide
                        HStack {
                            Group {
                                if showPassword {
                                    TextField("Password", text: $password)
                                } else {
                                    SecureField("Password", text: $password)
                                }
                            }
                            .foregroundColor(theme.textPrimary)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)

                            Button(action: { showPassword.toggle() }) {
                                Image(systemName: showPassword ? "eye.slash" : "eye")
                                    .foregroundColor(theme.textSecondary)
                                    .frame(width: 44, height: 44)   // 44pt HIG minimum
                                    .contentShape(Rectangle())
                            }
                            .accessibilityLabel(showPassword ? "Hide password" : "Show password")
                        }
                        .padding(14)
                        .background(theme.bgPanel)
                        .cornerRadius(10)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(theme.border))
                        .padding(.horizontal)
                    }

                    // Error
                    if let error = authStore.error {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(theme.captureIndicator)
                            .padding(.horizontal)
                    }

                    // Primary CTA
                    Button(action: { handleAction() }) {
                        Group {
                            if authStore.loading {
                                ProgressView().tint(.white)
                            } else {
                                Text(tab == 0 ? "Sign In" : "Create Account")
                                    .font(.headline)
                                    .foregroundColor(.white)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(isFormValid ? theme.accent : theme.accent.opacity(0.4))
                        .cornerRadius(12)
                    }
                    .disabled(!isFormValid || authStore.loading)
                    .padding(.horizontal)

                    // Google OAuth
                    Button(action: {
                        Task { try? await authStore.signInWithGoogle() }
                    }) {
                        HStack(spacing: 10) {
                            Image(systemName: "g.circle.fill")
                                .font(.title3)
                            Text("Continue with Google")
                                .font(.subheadline.bold())
                        }
                        .foregroundColor(theme.textPrimary)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(theme.btnSecondaryBg)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.border))
                    }
                    .padding(.horizontal)

                    // Guest option
                    if tab == 0 {
                        Button("Continue as Guest") {
                            // Offline play needs no account, so send the user
                            // to the board rather than leaving the button inert.
                            HapticManager.shared.buttonTap()
                            uiStore.selectedTab = UIStore.Tab.play
                        }
                        .font(.subheadline)
                        .foregroundColor(theme.textSecondary)
                        .frame(maxWidth: .infinity, minHeight: 44)   // 44pt HIG minimum
                        .contentShape(Rectangle())
                    }

                    Spacer(minLength: 32)
                }
            }
        }
        .navigationTitle("")
        .navigationBarHidden(true)
    }

    // MARK: - Helpers

    private func inputField(placeholder: String, text: Binding<String>) -> some View {
        TextField(placeholder, text: text)
            .foregroundColor(theme.textPrimary)
            .autocorrectionDisabled()
            .padding(14)
            .background(theme.bgPanel)
            .cornerRadius(10)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(theme.border))
            .padding(.horizontal)
    }

    private var isFormValid: Bool {
        guard !email.isEmpty, password.count >= 6 else { return false }
        if tab == 1 {
            // Username: 3–20 chars, alphanumeric + underscores only
            let validUsername = NSPredicate(format: "SELF MATCHES %@", "^[a-zA-Z0-9_]{3,20}$")
            return validUsername.evaluate(with: username)
        }
        return true
    }

    private func handleAction() {
        HapticManager.shared.buttonTap()
        Task {
            do {
                if tab == 0 {
                    try await authStore.signIn(email: email, password: password)
                } else {
                    try await authStore.signUp(email: email, password: password, username: username)
                }
            } catch {
                // The store sets `error` for us; this is a backstop for any
                // failure path that does not.
                if authStore.error == nil {
                    authStore.error = error.localizedDescription
                }
            }
        }
    }
}

#Preview {
    NavigationStack { AuthView() }
        .environmentObject(AuthStore())
        .environment(\.theme, ThemeConfig.classic)
}
