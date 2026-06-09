//
//  RaichuApp.swift
//  Raichu
//
//  Created by Sanket Muchhala on 5/12/26.
//

import SwiftUI

@main
struct RaichuApp: App {
    @StateObject private var gameStore = GameStore()
    @StateObject private var onlineGameStore = OnlineGameStore()
    @StateObject private var authStore = AuthStore()
    @StateObject private var matchmakingStore = MatchmakingStore()
    @StateObject private var uiStore = UIStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(gameStore)
                .environmentObject(onlineGameStore)
                .environmentObject(authStore)
                .environmentObject(matchmakingStore)
                .environmentObject(uiStore)
                .environment(\.theme, uiStore.currentTheme)
                .task { await authStore.initialize() }
        }
    }
}
