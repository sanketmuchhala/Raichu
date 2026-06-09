// AuthView.swift
// Raichu
// Sign In / Sign Up with email+password. Google OAuth hook included.

import SwiftUI

struct AuthView: View {
    @EnvironmentObject var authStore: AuthStore
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
                        Text("Raichu")
                            .font(.system(size: 32, weight: .black))
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
                            }
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
                            // Guest mode — no auth, offline play only
                        }
                        .font(.subheadline)
                        .foregroundColor(theme.textSecondary)
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
        !email.isEmpty && password.count >= 6 &&
        (tab == 0 || (username.count >= 3 && username.count <= 20))
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
                // authStore.error is already set inside the store
            }
        }
    }
}

#Preview {
    NavigationStack { AuthView() }
        .environmentObject(AuthStore())
        .environment(\.theme, ThemeConfig.classic)
}
