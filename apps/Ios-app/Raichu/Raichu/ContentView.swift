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

    var body: some View {
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
