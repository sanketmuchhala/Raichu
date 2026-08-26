// UIStore.swift
// Raichu
// UI preferences: theme, board orientation, replay mode.

import SwiftUI
import Combine

@MainActor
final class UIStore: ObservableObject {
    @Published var themeName: String = "classic" {
        didSet {
            UserDefaults.standard.set(themeName, forKey: "raichuTheme")
        }
    }
    @Published var boardFlipped: Bool = true {  // white at bottom by default
        didSet {
            UserDefaults.standard.set(boardFlipped, forKey: "raichuBoardFlipped")
        }
    }
    /// Selected root tab. Lives here so screens like AuthView can navigate
    /// without threading a binding through the view tree.
    @Published var selectedTab: Int = Tab.play
    @Published var replayMode: Bool = false
    @Published var replayStep: Int = 0
    @Published var hapticsEnabled: Bool = true {
        didSet {
            UserDefaults.standard.set(hapticsEnabled, forKey: "raichuHaptics")
            HapticManager.shared.isEnabled = hapticsEnabled
        }
    }

    var currentTheme: ThemeConfig {
        ThemeConfig.theme(named: themeName)
    }

    init() {
        // `object(forKey:) as? Bool` rather than `bool(forKey:)`: the latter
        // returns false for an unset key, which would invert both defaults.
        themeName = UserDefaults.standard.string(forKey: "raichuTheme") ?? "classic"
        boardFlipped = UserDefaults.standard.object(forKey: "raichuBoardFlipped") as? Bool ?? true
        hapticsEnabled = UserDefaults.standard.object(forKey: "raichuHaptics") as? Bool ?? true
        HapticManager.shared.isEnabled = hapticsEnabled
    }

    func setTheme(_ name: String) {
        themeName = name
    }

    enum Tab {
        static let play = 0
        static let online = 1
        static let history = 2
        static let profile = 3
    }

    func flipBoard() {
        boardFlipped.toggle()
    }

    func enterReplay(step: Int = 0) {
        replayMode = true
        replayStep = step
    }

    func exitReplay() {
        replayMode = false
        replayStep = 0
    }

    func setReplayStep(_ step: Int) {
        replayStep = step
    }
}
