// SettingsView.swift
// Raichu
// App preferences: theme, orientation, sound, haptics, notifications.

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var uiStore: UIStore
    @Environment(\.theme) var theme

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
                        requestNotificationPermission()
                    }) {
                        Label("Enable Push Notifications", systemImage: "bell.badge.fill")
                            .foregroundColor(theme.accent)
                    }
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
    }

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in }
    }
}

#Preview {
    NavigationStack { SettingsView() }
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
