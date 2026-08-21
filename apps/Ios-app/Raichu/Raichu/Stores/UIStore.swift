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
    @Published var boardFlipped: Bool = true   // white at bottom by default
    @Published var replayMode: Bool = false
    @Published var replayStep: Int = 0
    @Published var soundEnabled: Bool = true {
        didSet { UserDefaults.standard.set(soundEnabled, forKey: "raichuSound") }
    }
    @Published var hapticsEnabled: Bool = true {
        didSet { UserDefaults.standard.set(hapticsEnabled, forKey: "raichuHaptics") }
    }

    var currentTheme: ThemeConfig {
        ThemeConfig.theme(named: themeName)
    }

    init() {
        themeName = UserDefaults.standard.string(forKey: "raichuTheme") ?? "classic"
        soundEnabled = UserDefaults.standard.object(forKey: "raichuSound") as? Bool ?? true
        hapticsEnabled = UserDefaults.standard.object(forKey: "raichuHaptics") as? Bool ?? true
    }

    func setTheme(_ name: String) {
        themeName = name
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
