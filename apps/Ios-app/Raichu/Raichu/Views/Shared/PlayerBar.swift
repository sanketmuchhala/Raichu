// PlayerBar.swift
// Raichu
//
// The player strip above and below the board. Ported from the web's
// `.player-bar` / `.player-bar-compact` (apps/web/src/app/globals.css).
//
// `compact` is the mobile treatment: a left accent stripe instead of a full
// border, square corners, and no turn glow.

import SwiftUI

struct PlayerBar: View {
    enum Style { case compact, full }

    let name: String
    /// Shown as "{elo} ELO" when present; offline players have no rating.
    var elo: Int?
    /// Secondary line when there is no ELO — e.g. "Hard" for the bot.
    var subtitle: String?
    let isWhite: Bool
    let isCurrentTurn: Bool
    var isThinking: Bool = false
    let capturedPieces: [String]
    var style: Style = .compact

    @Environment(\.theme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var avatarSize: CGFloat { style == .compact ? 32 : 34 }

    var body: some View {
        HStack(spacing: 10) {
            Avatar(name: name, size: avatarSize, theme: theme)

            VStack(alignment: .leading, spacing: 1) {
                Text(name)
                    .font(Typography.bodyStrong)
                    .foregroundColor(theme.textPrimary)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    PieceColorDot(isWhite: isWhite, size: 7, theme: theme)
                    if secondaryText != name {
                        Text(secondaryText)
                            .font(Typography.caption)
                            .foregroundColor(theme.textSecondary)
                            .lineLimit(1)
                    }
                }
            }

            Spacer(minLength: Spacing.sm)

            if isThinking {
                ProgressView()
                    .controlSize(.small)
                    .tint(theme.accent)
            } else if isCurrentTurn {
                turnBadge
            }

            CapturedPiecesRow(pieces: capturedPieces, size: style == .compact ? 18 : 20)
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, style == .compact ? 7 : Spacing.sm)
        .frame(minHeight: style == .compact ? 54 : 58)
        .background(isCurrentTurn ? theme.accent.alpha(.a12) : theme.bgPanel)
        .overlay(alignment: .leading) {
            // Compact bars carry a 3pt accent stripe instead of a full border.
            if style == .compact {
                Rectangle()
                    .fill(isCurrentTurn ? theme.accent : Color.clear)
                    .frame(width: 3)
            }
        }
        .clipShape(RoundedRectangle(
            cornerRadius: style == .compact ? 0 : Radius.bar,
            style: .continuous
        ))
        .animation(reduceMotion ? nil : Motion.press(0.2), value: isCurrentTurn)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
    }

    private var secondaryText: String {
        if let elo { return "\(elo) ELO" }
        if let subtitle { return subtitle }
        return isWhite ? "White" : "Black"
    }

    private var turnBadge: some View {
        HStack(spacing: 5) {
            TurnDot(color: .white)
            Text("Turn")
                .font(Typography.kicker)
                .foregroundColor(.white)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(theme.accent)
        .clipShape(Capsule())
        .transition(.opacity.combined(with: .scale(scale: 0.9)))
    }

    private var accessibilityLabel: String {
        var parts = secondaryText == name ? [name] : [name, secondaryText]
        if isThinking { parts.append("thinking") }
        else if isCurrentTurn { parts.append("to move") }
        if !capturedPieces.isEmpty { parts.append("\(capturedPieces.count) captured") }
        return parts.joined(separator: ", ")
    }
}
