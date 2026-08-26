//
//  RaichuApp.swift
//  Raichu
//
//  Created by Sanket Muchhala on 5/12/26.
//

import SwiftUI
import UIKit

// MARK: - AppDelegate (APNs token + badge clear)

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Task { NotificationManager.shared.didRegisterForRemoteNotifications(deviceToken: deviceToken) }
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        // Silent failure — push notifications optional
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Clear badge when app comes to foreground (spec 6.4 item 5)
        Task { NotificationManager.shared.clearBadge() }
    }
}

// MARK: - App entry point

@main
struct RaichuApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

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
                // Completes the Google OAuth redirect back into the app.
                .onOpenURL { url in
                    Task { await authStore.handleOpenURL(url) }
                }
        }
    }
}
