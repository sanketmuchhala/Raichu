// SettingsView.swift
// Raichu
// App preferences: theme, orientation, sound, haptics, notifications.

import SwiftUI
import UserNotifications

struct SettingsView: View {
    @EnvironmentObject var uiStore: UIStore
    @Environment(\.theme) var theme
    @State private var notificationStatus: UNAuthorizationStatus = .notDetermined

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            List {
                // Theme
                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Board Theme")
                            .font(.subheadline)
                            .foregroundColor(theme.textSecondary)
                        Picker("Theme", selection: $uiStore.themeName) {
                            Text("Classic").tag("classic")
                            Text("Slate").tag("slate")
                            Text("Walnut").tag("walnut")
                        }
                        .pickerStyle(.segmented)
                    }
                }
                .listRowBackground(theme.bgPanel)

                // Board Orientation
                Section {
                    Toggle(isOn: $uiStore.boardFlipped) {
                        VStack(alignment: .leading) {
                            Text("White at Bottom")
                                .foregroundColor(theme.textPrimary)
                            Text("Classic chess orientation")
                                .font(.caption)
                                .foregroundColor(theme.textSecondary)
                        }
                    }
                    .tint(theme.accent)
                }
                .listRowBackground(theme.bgPanel)

                // Sound & Haptics
                Section {
                    Toggle(isOn: $uiStore.soundEnabled) {
                        Label("Sound Effects", systemImage: "speaker.wave.2.fill")
                            .foregroundColor(theme.textPrimary)
                    }
                    .tint(theme.accent)

                    Toggle(isOn: $uiStore.hapticsEnabled) {
                        Label("Haptic Feedback", systemImage: "hand.tap.fill")
                            .foregroundColor(theme.textPrimary)
                    }
                    .tint(theme.accent)
                }
                .listRowBackground(theme.bgPanel)

                // Notifications
                Section {
                    Button(action: {
                        NotificationManager.shared.requestPermission()
                        // Re-check status after a short delay for UI update
                        Task {
                            try? await Task.sleep(nanoseconds: 500_000_000)
                            await checkNotificationStatus()
                        }
                    }) {
                        HStack {
                            Label(notificationButtonLabel, systemImage: "bell.badge.fill")
                                .foregroundColor(notificationStatus == .authorized ? theme.textSecondary : theme.accent)
                            Spacer()
                            if notificationStatus == .authorized {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(theme.accent)
                            }
                        }
                    }
                    .disabled(notificationStatus == .authorized)
                }
                .listRowBackground(theme.bgPanel)

                // About
                Section {
                    HStack {
                        Text("App Version")
                            .foregroundColor(theme.textPrimary)
                        Spacer()
                        Text(appVersion)
                            .foregroundColor(theme.textSecondary)
                    }

                    Link(destination: URL(string: "https://raichu.live")!) {
                        Label("raichu.live", systemImage: "globe")
                            .foregroundColor(theme.accent)
                    }
                }
                .listRowBackground(theme.bgPanel)
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(theme.bgPrimary)
        }
        .navigationTitle("Settings")
        .toolbarBackground(theme.bgPanel, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .task { await checkNotificationStatus() }
    }

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    private var notificationButtonLabel: String {
        switch notificationStatus {
        case .authorized:    return "Push Notifications Enabled"
        case .denied:        return "Notifications Denied — Open Settings"
        default:             return "Enable Push Notifications"
        }
    }

    private func checkNotificationStatus() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        notificationStatus = settings.authorizationStatus
    }
}

extension SettingsView {
    // Trigger status check on appear
    func onAppearModifier() -> some View {
        self.task { await checkNotificationStatus() }
    }
}

#Preview {
    NavigationStack { SettingsView() }
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
