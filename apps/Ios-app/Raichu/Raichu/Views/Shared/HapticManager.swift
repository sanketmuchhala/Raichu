// HapticManager.swift
// Raichu
// Centralized haptic feedback manager.

import UIKit

final class HapticManager {
    static let shared = HapticManager()
    private init() {}

    func piecePickup() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    func validMove() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    func invalidDrop() {
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
    }

    func capture() {
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
    }

    func gameWon() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    func gameLost() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }

    func buttonTap() {
        UISelectionFeedbackGenerator().selectionChanged()
    }

    func copyCode() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
}
