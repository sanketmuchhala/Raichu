// HapticManager.swift
// Raichu
// Centralized haptic feedback manager.
//
// Feedback escalates with rarity: selection (tap) < light (move) <
// medium (pickup) < heavy (capture) < notification (game over).

import UIKit

@MainActor
final class HapticManager {
    static let shared = HapticManager()
    private init() {}

    /// Mirrors `UIStore.hapticsEnabled`; kept in sync by UIStore so this stays
    /// callable from anywhere without a store reference.
    var isEnabled: Bool = true

    // Reused generators — a prepared generator has noticeably lower latency
    // than one allocated at the call site.
    private let light = UIImpactFeedbackGenerator(style: .light)
    private let medium = UIImpactFeedbackGenerator(style: .medium)
    private let heavy = UIImpactFeedbackGenerator(style: .heavy)
    private let selection = UISelectionFeedbackGenerator()
    private let notification = UINotificationFeedbackGenerator()

    /// Call before a gesture that is likely to produce feedback.
    func prepare() {
        guard isEnabled else { return }
        light.prepare()
        medium.prepare()
        heavy.prepare()
    }

    func piecePickup() {
        guard isEnabled else { return }
        medium.impactOccurred()
    }

    func validMove() {
        guard isEnabled else { return }
        light.impactOccurred()
    }

    func invalidDrop() {
        guard isEnabled else { return }
        notification.notificationOccurred(.warning)
    }

    func capture() {
        guard isEnabled else { return }
        heavy.impactOccurred()
    }

    func gameWon() {
        guard isEnabled else { return }
        notification.notificationOccurred(.success)
    }

    func gameLost() {
        guard isEnabled else { return }
        notification.notificationOccurred(.error)
    }

    func buttonTap() {
        guard isEnabled else { return }
        selection.selectionChanged()
    }

    func copyCode() {
        guard isEnabled else { return }
        light.impactOccurred()
    }
}
