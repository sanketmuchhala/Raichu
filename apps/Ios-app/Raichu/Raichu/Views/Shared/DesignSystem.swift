// DesignSystem.swift
// Raichu
//
// Shared spacing, radius, elevation, motion and typography scales.
//
// These mirror the web app so the two clients read as siblings:
//   apps/web/src/app/globals.css  — radii, shadows, keyframe durations
//   apps/web/src/lib/themes.ts    — colour tokens (see ThemeConfig.swift)
//
// Colour lives in ThemeConfig (it varies per theme); everything here is
// theme-independent.

import SwiftUI

// MARK: - Spacing

enum Spacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
}

// MARK: - Corner radius

// The web uses a wide, deliberate radius scale rather than a 4/8/16 ramp —
// each value is tied to a specific component size. Named for the component so
// the mapping back to globals.css stays obvious.
enum Radius {
    static let control: CGFloat = 6      // .btn, .segmented-control
    static let card: CGFloat = 8         // .panel-card
    static let bar: CGFloat = 10         // .player-bar, .mobile-compact
    static let action: CGFloat = 11      // .game-action, .game-coach
    static let board: CGFloat = 12       // .game-board-frame
    static let mode: CGFloat = 13        // .new-game-mode
    static let dialog: CGFloat = 16      // .game-result-dialog
    static let sheet: CGFloat = 18       // .new-game-dialog
    static let pill: CGFloat = 999
}

// MARK: - Elevation

struct Elevation {
    let color: Color
    let radius: CGFloat
    let y: CGFloat

    // CSS blur radius is roughly 2x SwiftUI's shadow radius.
    static func panel(_ shadow: Color) -> Elevation { .init(color: shadow, radius: 4, y: 2) }
    static func board(_ shadow: Color) -> Elevation { .init(color: shadow, radius: 16, y: 8) }
    static func dialog(_ shadow: Color) -> Elevation { .init(color: shadow, radius: 36, y: 24) }
    static func action(_ shadow: Color) -> Elevation { .init(color: shadow, radius: 7, y: 5) }
}

extension View {
    func elevation(_ e: Elevation) -> some View {
        shadow(color: e.color, radius: e.radius, x: 0, y: e.y)
    }
}

// MARK: - Motion

// The web uses exactly two easing curves and no springs at all. Matching them
// is what makes the iOS board feel like the same product rather than a
// different one — SwiftUI's default spring reads noticeably bouncier.
enum Motion {
    /// `cubic-bezier(0.16, 1, 0.3, 1)` — expo-out. Arrivals: dialogs, piece
    /// slides, board entrance, drag settles.
    static func arrive(_ duration: Double) -> Animation {
        .timingCurve(0.16, 1, 0.3, 1, duration: duration)
    }

    /// `cubic-bezier(0.2, 0.8, 0.2, 1)` — snappy. Presses, hovers, legal-move dots.
    static func press(_ duration: Double) -> Animation {
        .timingCurve(0.2, 0.8, 0.2, 1, duration: duration)
    }

    // Durations lifted from globals.css.
    static let selectedIn: Double = 0.14
    static let legalTargetIn: Double = 0.18
    static let lastMoveIn: Double = 0.18
    static let captureFade: Double = 0.14
    static let dragLift: Double = 0.11
    static let dragSettle: Double = 0.085
    static let dragSnapBack: Double = 0.16
    static let dialogPop: Double = 0.28
    static let sheetRise: Double = 0.32
    static let dockRise: Double = 0.32
    static let boardArrive: Double = 0.42
    static let playerBarEnter: Double = 0.30

    /// Distance-aware piece slide, matching `PieceMoveOverlay.tsx`:
    /// `min(0.24, 0.135 + distance * 0.018)` where distance is in squares.
    static func slide(squares: CGFloat) -> Animation {
        arrive(min(0.24, 0.135 + Double(squares) * 0.018))
    }
}

// MARK: - Alpha

// The web composes colours as `theme.accent + '22'` (an appended hex alpha
// byte). These are the byte values it actually uses, as SwiftUI opacities, so
// `theme.accent.alpha(.a22)` reads as the same intent as the CSS.
enum Alpha: Double {
    case a10 = 0.063
    case a12 = 0.071
    case a14 = 0.078
    case a18 = 0.094
    case a1a = 0.102
    case a1f = 0.122
    case a22 = 0.133
    case a30 = 0.188
    case a40 = 0.251
    case a44 = 0.267
    case a60 = 0.376
    case add = 0.867
}

extension Color {
    func alpha(_ a: Alpha) -> Color { opacity(a.rawValue) }
}

// MARK: - Typography

// SF Pro rather than the web's Figtree: it gives Dynamic Type and VoiceOver
// sizing for free, and tracks Figtree closely at UI sizes. Every style is
// relative to a text style so it scales with the user's size setting.
enum Typography {
    static let displayTitle = Font.system(.largeTitle, design: .default, weight: .black)
    static let dialogTitle = Font.system(.title2, design: .default, weight: .bold)
    static let sectionTitle = Font.system(.headline, design: .default, weight: .semibold)
    static let body = Font.system(.subheadline, design: .default, weight: .regular)
    static let bodyStrong = Font.system(.subheadline, design: .default, weight: .semibold)
    static let label = Font.system(.footnote, design: .default, weight: .medium)
    static let labelStrong = Font.system(.footnote, design: .default, weight: .bold)
    static let caption = Font.system(.caption, design: .default, weight: .regular)
    /// The smallest supporting text — mode/difficulty card detail lines.
    static let captionSmall = Font.system(.caption2, design: .default, weight: .regular)
    static let captionStrong = Font.system(.caption, design: .default, weight: .semibold)

    /// Uppercase eyebrow/kicker text — 0.11em tracking on the web.
    static let kicker = Font.system(.caption2, design: .default, weight: .bold)

    /// Move notation, ELO figures, invite codes.
    static let mono = Font.system(.subheadline, design: .monospaced, weight: .medium)
    static let monoStrong = Font.system(.subheadline, design: .monospaced, weight: .bold)
    static let monoLarge = Font.system(.title, design: .monospaced, weight: .black)
}
