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

    var body: some View {
        ZStack(alignment: .top) {
        TabView {
            NavigationStack {
                PlayView()
            }
            .tabItem {
                Label("Play", systemImage: "gamecontroller.fill")
            }

            NavigationStack {
                LobbyView()
            }
            .tabItem {
                Label("Online", systemImage: "network")
            }

            NavigationStack {
                HistoryView()
            }
            .tabItem {
                Label("History", systemImage: "clock.fill")
            }

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
        }
        .tint(theme.accent)
        .preferredColorScheme(.dark)

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

#Preview {
    ContentView()
        .environmentObject(GameStore())
        .environmentObject(OnlineGameStore())
        .environmentObject(AuthStore())
        .environmentObject(MatchmakingStore())
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
