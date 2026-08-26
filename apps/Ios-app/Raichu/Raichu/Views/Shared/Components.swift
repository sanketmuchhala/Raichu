// Components.swift
// Raichu
//
// Shared button styles, card chrome and small primitives.
//
// Before this file every screen re-declared its own padding, corner radius and
// background inline. Mirrors the web's `.btn`, `.panel-card`,
// `.segmented-control`, `.player-avatar` and `.player-turn-dot`.

import SwiftUI

// MARK: - Buttons

enum RaichuButtonVariant {
    case primary       // accent fill, white text
    case secondary     // btnSecondaryBg fill
    case destructive   // captureIndicator text on secondary fill
    case dock          // tall icon-over-label button in the mobile action dock
}

struct RaichuButtonStyle: ButtonStyle {
    let variant: RaichuButtonVariant
    let theme: ThemeConfig
    /// Overrides the fill — used by the restart button's armed/confirm state.
    /// An overridden fill is always a strong colour, so the label goes white
    /// with it; an outer .foregroundColor cannot reach inside a ButtonStyle.
    var fillOverride: Color? = nil

    func makeBody(configuration: Configuration) -> some View {
        let pressed = configuration.isPressed

        return configuration.label
            .font(variant == .dock ? Typography.captionStrong : Typography.bodyStrong)
            .foregroundColor(foreground)
            .frame(maxWidth: .infinity)
            .frame(minHeight: variant == .dock ? 58 : 44)
            .padding(.horizontal, variant == .dock ? Spacing.xs : Spacing.lg)
            .background(fillOverride ?? background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            // The web scales presses to 0.98 at 0.82 opacity; the dock buttons
            // go a little further (0.96) because they are physically larger.
            .scaleEffect(pressed ? (variant == .dock ? 0.96 : 0.98) : 1)
            .opacity(pressed ? (variant == .dock ? 0.86 : 0.82) : 1)
            .animation(Motion.press(0.16), value: pressed)
    }

    private var radius: CGFloat {
        variant == .dock ? Radius.action : Radius.control
    }

    private var background: Color {
        switch variant {
        case .primary: return theme.accent
        case .secondary, .destructive, .dock: return theme.btnSecondaryBg
        }
    }

    private var foreground: Color {
        if fillOverride != nil { return .white }
        switch variant {
        case .primary: return .white
        case .secondary, .dock: return theme.textPrimary
        case .destructive: return theme.captureIndicator
        }
    }
}

extension View {
    func raichuButton(
        _ variant: RaichuButtonVariant,
        theme: ThemeConfig,
        fill: Color? = nil
    ) -> some View {
        buttonStyle(RaichuButtonStyle(variant: variant, theme: theme, fillOverride: fill))
    }
}

/// The icon-over-label content used inside dock buttons.
struct DockLabel: View {
    let systemImage: String
    let title: String

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        VStack(spacing: 3) {
            Image(systemName: systemImage)
                .font(.system(size: 19, weight: .semibold))
            Text(title)
                // One line at normal sizes keeps the dock compact; at
                // accessibility sizes the label wraps rather than truncating.
                .lineLimit(dynamicTypeSize.isAccessibilitySize ? 2 : 1)
                .minimumScaleFactor(0.8)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

// MARK: - Panel card

struct PanelCard: ViewModifier {
    let theme: ThemeConfig
    var radius: CGFloat = Radius.card
    var padding: CGFloat = Spacing.md

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(theme.bgPanel)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .strokeBorder(theme.border, lineWidth: 1)
            )
            .elevation(.panel(theme.shadow))
    }
}

extension View {
    func panelCard(
        theme: ThemeConfig,
        radius: CGFloat = Radius.card,
        padding: CGFloat = Spacing.md
    ) -> some View {
        modifier(PanelCard(theme: theme, radius: radius, padding: padding))
    }
}

// MARK: - Badge

struct Badge: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text.uppercased())
            .font(Typography.kicker)
            .tracking(0.6)
            .foregroundColor(color)
            // Short all-caps labels ("2 PLAYERS"). Fixed on both axes so a
            // growing sibling title cannot squeeze the pill into a clip.
            .fixedSize()
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(color.alpha(.a18))
            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
    }
}

// MARK: - Segmented control

struct SegmentedOption<Value: Hashable>: Identifiable {
    let value: Value
    let label: String
    var id: Value { value }
}

struct RaichuSegmentedControl<Value: Hashable>: View {
    let options: [SegmentedOption<Value>]
    @Binding var selection: Value
    let theme: ThemeConfig

    var body: some View {
        HStack(spacing: 2) {
            ForEach(options) { option in
                Button {
                    HapticManager.shared.buttonTap()
                    withAnimation(Motion.press(0.16)) { selection = option.value }
                } label: {
                    Text(option.label)
                        .font(Typography.captionStrong)
                        .foregroundColor(selection == option.value ? .white : theme.textSecondary)
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: 32)
                        .background(
                            RoundedRectangle(cornerRadius: 4, style: .continuous)
                                .fill(selection == option.value ? theme.accent : .clear)
                        )
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(selection == option.value ? [.isSelected] : [])
            }
        }
        .padding(3)
        .background(theme.bgSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
    }
}

// MARK: - Avatar

struct Avatar: View {
    let name: String
    let size: CGFloat
    let theme: ThemeConfig
    var shape: AvatarShape = .rounded

    enum AvatarShape { case rounded, circle }

    private var initial: String {
        String(name.trimmingCharacters(in: .whitespaces).prefix(1)).uppercased()
    }

    var body: some View {
        Text(initial.isEmpty ? "?" : initial)
            .font(.system(size: size * 0.42, weight: .heavy))
            .foregroundColor(theme.accent)
            .frame(width: size, height: size)
            .background(theme.accent.alpha(.a22))
            .clipShape(RoundedRectangle(
                cornerRadius: shape == .circle ? size / 2 : size * 0.26,
                style: .continuous
            ))
            .overlay(
                RoundedRectangle(
                    cornerRadius: shape == .circle ? size / 2 : size * 0.26,
                    style: .continuous
                )
                .strokeBorder(theme.border, lineWidth: 1)
            )
            .accessibilityHidden(true)
    }
}

// MARK: - Turn dot

/// The pulsing dot on an active player's bar. Web: `.player-turn-dot`,
/// `turn-dot-pulse 1.4s` scaling between 0.86 and 1.14.
struct TurnDot: View {
    let color: Color
    var active: Bool = true

    @State private var pulsing = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var animates: Bool { active && !reduceMotion }

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 6, height: 6)
            .overlay(Circle().stroke(Color.white.opacity(0.16), lineWidth: 3))
            // Rest at 1.0 when the pulse never starts. Keying the static state
            // on `pulsing` alone left the dot stuck at 0.86 — permanently 14%
            // undersized — whenever Reduce Motion was on or the dot was idle.
            .scaleEffect(animates ? (pulsing ? 1.14 : 0.86) : 1)
            .onAppear {
                guard animates else { return }
                withAnimation(.easeInOut(duration: 0.7).repeatForever(autoreverses: true)) {
                    pulsing = true
                }
            }
            .accessibilityHidden(true)
    }
}

// MARK: - Player colour swatch

/// The white/black indicator dot used in game info rows and player bars.
struct PieceColorDot: View {
    let isWhite: Bool
    let size: CGFloat
    let theme: ThemeConfig

    var body: some View {
        Circle()
            .fill(isWhite ? Color(hex: "f0f0f0") : Color(hex: "333333"))
            .frame(width: size, height: size)
            .overlay(
                Circle().strokeBorder(
                    isWhite ? Color(hex: "d4d4d4") : Color(hex: "4a4a4a"),
                    lineWidth: 1.5
                )
            )
            .accessibilityHidden(true)
    }
}
