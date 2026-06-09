//
//  ContentView.swift
//  Raichu
//
//  Created by Sanket Muchhala on 5/12/26.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authStore: AuthStore
    @EnvironmentObject var uiStore: UIStore
    @Environment(\.theme) var theme
    @StateObject private var network = NetworkMonitor.shared
    @ObservedObject private var notifications = NotificationManager.shared

    // Deep link state (spec 6.4 item 4)
    @State private var selectedTab: Int = 0
    @State private var deepLinkGameId: IdentifiableString? = nil

    var body: some View {
        ZStack(alignment: .top) {
        TabView(selection: $selectedTab) {
            NavigationStack {
                PlayView()
            }
            .tabItem {
                Label("Play", systemImage: "gamecontroller.fill")
            }
            .tag(0)

            NavigationStack {
                LobbyView()
            }
            .tabItem {
                Label("Online", systemImage: "network")
            }
            .tag(1)

            NavigationStack {
                HistoryView()
            }
            .tabItem {
                Label("History", systemImage: "clock.fill")
            }
            .tag(2)

            NavigationStack {
                if authStore.isAuthenticated {
                    ProfileView()
                } else {
                    AuthView()
                }
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
            .tag(3)
        }
        .tint(theme.accent)
        .preferredColorScheme(.dark)
        // Handle deep links from push notifications (spec 6.4 item 3)
        .onChange(of: notifications.pendingDeepLink) { _, link in
            guard let link else { return }
            switch link {
            case .game(let id):
                deepLinkGameId = IdentifiableString(id)
                selectedTab = 1   // switch to Online tab
            case .history:
                selectedTab = 2   // switch to History tab
            }
            notifications.pendingDeepLink = nil
        }
        // Present deep-linked game as a sheet (avoids nav stack complexity)
        .sheet(item: $deepLinkGameId) { wrapper in
            NavigationStack {
                OnlineGameView(gameId: wrapper.value)
            }
            // Sheets don't inherit environment objects — re-inject (spec 6.4 item 4)
            .environmentObject(authStore)
            .environmentObject(uiStore)
            .environment(\.theme, uiStore.currentTheme)
        }

        // Offline banner — floats above tab bar content (spec 6.3)
        if !network.isConnected {
            VStack {
                HStack(spacing: 8) {
                    Image(systemName: "wifi.slash")
                        .font(.caption.bold())
                    Text("You're offline — online features disabled")
                        .font(.caption.bold())
                }
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color(hex: "DC3232"))
                .cornerRadius(8)
                .shadow(radius: 4)
                .padding(.top, 8)
                Spacer()
            }
            .transition(.move(edge: .top).combined(with: .opacity))
            .animation(.easeInOut(duration: 0.3), value: network.isConnected)
            .zIndex(999)
            .allowsHitTesting(false)
        }
        } // end ZStack
    }
}

// MARK: - Identifiable string wrapper for .sheet(item:)

struct IdentifiableString: Identifiable {
    let id = UUID()
    let value: String
    init(_ value: String) { self.value = value }
}

#Preview {
    ContentView()
        .environmentObject(GameStore())
        .environmentObject(OnlineGameStore())
        .environmentObject(AuthStore())
        .environmentObject(MatchmakingStore())
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
