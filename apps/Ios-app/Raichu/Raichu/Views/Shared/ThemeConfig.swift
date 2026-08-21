// ThemeConfig.swift
// Raichu
// Theme definitions for Classic, Slate, and Walnut board themes.

import SwiftUI

// MARK: - Color(hex:) extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Theme Config Struct

struct ThemeConfig {
    let name: String
    let boardLight: Color
    let boardDark: Color
    let selected: Color
    let legalMove: Color
    let captureIndicator: Color
    let lastMove: Color
    let bgPrimary: Color
    let bgSecondary: Color
    let bgPanel: Color
    let textPrimary: Color
    let textSecondary: Color
    let accent: Color
    let accentHover: Color
    let border: Color
    let shadow: Color
    let btnSecondaryBg: Color
    let btnSecondaryHover: Color
}

// MARK: - Theme Definitions

extension ThemeConfig {
    static let classic = ThemeConfig(
        name: "classic",
        boardLight:        Color(hex: "F0D9B5"),
        boardDark:         Color(hex: "B58863"),
        selected:          Color.yellow.opacity(0.4),
        legalMove:         Color.black.opacity(0.2),
        captureIndicator:  Color(hex: "DC3232").opacity(0.45),
        lastMove:          Color.yellow.opacity(0.2),
        bgPrimary:         Color(hex: "1a1a1a"),
        bgSecondary:       Color(hex: "111111"),
        bgPanel:           Color(hex: "242424"),
        textPrimary:       Color(hex: "f0ece8"),
        textSecondary:     Color(hex: "7a7a7a"),
        accent:            Color(hex: "769656"),
        accentHover:       Color(hex: "638048"),
        border:            Color(hex: "333333"),
        shadow:            Color.black.opacity(0.4),
        btnSecondaryBg:    Color(hex: "2e2e2e"),
        btnSecondaryHover: Color(hex: "383838")
    )

    static let slate = ThemeConfig(
        name: "slate",
        boardLight:        Color(hex: "DEE3E6"),
        boardDark:         Color(hex: "8CA2AD"),
        selected:          Color(hex: "64B4FF").opacity(0.4),
        legalMove:         Color.black.opacity(0.2),
        captureIndicator:  Color(hex: "EF4444").opacity(0.4),
        lastMove:          Color(hex: "64B4FF").opacity(0.2),
        bgPrimary:         Color(hex: "0f172a"),
        bgSecondary:       Color(hex: "0b1120"),
        bgPanel:           Color(hex: "1e293b"),
        textPrimary:       Color(hex: "f1f5f9"),
        textSecondary:     Color(hex: "94a3b8"),
        accent:            Color(hex: "3b82f6"),
        accentHover:       Color(hex: "2563eb"),
        border:            Color(hex: "334155"),
        shadow:            Color.black.opacity(0.3),
        btnSecondaryBg:    Color(hex: "334155"),
        btnSecondaryHover: Color(hex: "475569")
    )

    static let walnut = ThemeConfig(
        name: "walnut",
        boardLight:        Color(hex: "EDE0C8"),
        boardDark:         Color(hex: "A67B5B"),
        selected:          Color(hex: "FFC832").opacity(0.4),
        legalMove:         Color.black.opacity(0.2),
        captureIndicator:  Color(hex: "DC2626").opacity(0.4),
        lastMove:          Color(hex: "FFC832").opacity(0.2),
        bgPrimary:         Color(hex: "1c1410"),
        bgSecondary:       Color(hex: "14100c"),
        bgPanel:           Color(hex: "2a1f18"),
        textPrimary:       Color(hex: "efebe9"),
        textSecondary:     Color(hex: "a1887f"),
        accent:            Color(hex: "e07040"),
        accentHover:       Color(hex: "c05a30"),
        border:            Color(hex: "3e2e23"),
        shadow:            Color.black.opacity(0.3),
        btnSecondaryBg:    Color(hex: "3e2e23"),
        btnSecondaryHover: Color(hex: "5d4037")
    )

    static func theme(named name: String) -> ThemeConfig {
        switch name {
        case "slate": return .slate
        case "walnut": return .walnut
        default: return .classic
        }
    }
}

// MARK: - Environment Key

private struct ThemeConfigKey: EnvironmentKey {
    static let defaultValue: ThemeConfig = .classic
}

extension EnvironmentValues {
    var theme: ThemeConfig {
        get { self[ThemeConfigKey.self] }
        set { self[ThemeConfigKey.self] = newValue }
    }
}
