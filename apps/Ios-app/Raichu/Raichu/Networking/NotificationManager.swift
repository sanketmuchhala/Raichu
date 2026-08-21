// NotificationManager.swift
// Raichu
// Push notification registration, APNs token handling, and deep-link routing.

import UIKit
import UserNotifications
import Combine

// MARK: - Registration request (for future backend endpoint)

struct NotificationRegisterRequest: Encodable {
    let token: String
    let platform: String = "ios"
}

// MARK: - Notification types sent by the server

enum PushNotificationType: String {
    case yourTurn  = "YOUR_TURN"
    case matchFound = "MATCH_FOUND"
    case gameEnded  = "GAME_ENDED"
}

// MARK: - Deep link destination

enum DeepLink: Equatable {
    case game(id: String)   // YOUR_TURN, MATCH_FOUND
    case history            // GAME_ENDED
}

// MARK: - NotificationManager

@MainActor
final class NotificationManager: NSObject, ObservableObject {
    static let shared = NotificationManager()

    /// Published deep link — ContentView observes this to navigate
    @Published var pendingDeepLink: DeepLink? = nil

    private override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }

    // MARK: - Permission request

    /// Called after first sign-in (spec 6.4 item 1)
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .badge, .sound]
        ) { granted, _ in
            guard granted else { return }
            Task { @MainActor in
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
    }

    // MARK: - APNs token registration

    /// Called from AppDelegate.application(_:didRegisterForRemoteNotificationsWithDeviceToken:)
    func didRegisterForRemoteNotifications(deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        // POST /api/v1/notifications/register — endpoint not yet implemented on backend (spec 6.4 note)
        // Structure is defined in NotificationRegisterRequest above for future wiring.
        Task {
            _ = try? await APIClient.shared.fetch(
                path: "/api/v1/notifications/register",
                method: "POST",
                body: NotificationRegisterRequest(token: token)
            ) as EmptyResponse
        }
    }

    // MARK: - Badge management

    /// Clear badge when app comes to foreground (spec 6.4 item 5)
    func clearBadge() {
        UNUserNotificationCenter.current().setBadgeCount(0) { _ in }
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension NotificationManager: UNUserNotificationCenterDelegate {
    // Notification arrived while app is in foreground — show as banner
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }

    // User tapped a notification — route to deep link (spec 6.4 item 3)
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        let typeStr = userInfo["type"] as? String ?? ""
        let gameId  = userInfo["gameId"] as? String

        Task { @MainActor in
            switch PushNotificationType(rawValue: typeStr) {
            case .yourTurn, .matchFound:
                if let id = gameId { pendingDeepLink = .game(id: id) }
            case .gameEnded:
                pendingDeepLink = .history
            case nil:
                break
            }
        }
        completionHandler()
    }
}

// MARK: - Helpers

/// Minimal decodable for fire-and-forget POST responses
private struct EmptyResponse: Decodable {}
