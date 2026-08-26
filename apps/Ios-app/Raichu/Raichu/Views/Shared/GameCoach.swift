// GameCoach.swift
// Raichu
//
// Contextual onboarding strip shown for the first two half-moves.
// Ported from apps/web/src/components/game/GameCoach.tsx.

import SwiftUI

struct GameCoach: View {
    let moveCount: Int
    let isThinking: Bool
    /// `false` while the opponent (bot or the other local player) is to move.
    let isYourTurn: Bool
    let selectedLegalMoves: [Move]?
    let isLocalPvP: Bool
    let botName: String
    var onDismiss: () -> Void

    @Environment(\.theme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var appeared = false

    private struct Message {
        let icon: String
        let title: String
        let body: String
    }

    private var message: Message {
        if isThinking || !isYourTurn {
            if isLocalPvP {
                return Message(
                    icon: "arrow.left.arrow.right",
                    title: "Pass the board to Black",
                    body: "Tap or drag a black piece to continue."
                )
            }
            return Message(
                icon: "ellipsis",
                title: "\(botName) is thinking",
                body: "Scan the highlighted last move and plan your reply."
            )
        }

        if let moves = selectedLegalMoves, !moves.isEmpty {
            let captures = moves.filter { $0.captured != nil }.count
            return Message(
                icon: "scope",
                title: "Choose a highlighted square",
                body: "\(moves.count) legal moves · \(captures) capture options"
            )
        }

        return Message(
            icon: "hand.tap",
            title: moveCount == 0 ? "White moves first" : "Your move",
            body: "Tap a piece to reveal its moves, or drag it directly."
        )
    }

    var body: some View {
        let m = message

        return HStack(spacing: 10) {
            Image(systemName: m.icon)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(theme.accent)
                .frame(width: 34, height: 34)
                .background(theme.accent.alpha(.a22))
                .clipShape(RoundedRectangle(cornerRadius: Radius.bar, style: .continuous))

            VStack(alignment: .leading, spacing: 1) {
                Text(m.title)
                    .font(Typography.labelStrong)
                    .foregroundColor(theme.textPrimary)
                    .lineLimit(dynamicTypeSize.isAccessibilitySize ? 2 : 1)
                    .fixedSize(horizontal: false, vertical: true)
                Text(m.body)
                    .font(Typography.caption)
                    .foregroundColor(theme.textSecondary)
                    // Unbounded at accessibility sizes: the audit flagged this
                    // tip as clipped, and a truncated instruction is useless.
                    .lineLimit(dynamicTypeSize.isAccessibilitySize ? nil : 2)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: Spacing.sm)

            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(theme.textSecondary)
                    // 44pt HIG minimum. The glyph stays 11pt; only the hit
                    // region grows, and the strip is already taller than 44.
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .accessibilityLabel("Dismiss tip")
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 9)
        .frame(minHeight: 62)
        .background(theme.accent.alpha(.a12))
        .clipShape(RoundedRectangle(cornerRadius: Radius.action, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.action, style: .continuous)
                .strokeBorder(theme.accent.alpha(.a40), lineWidth: 1)
        )
        .opacity(appeared || reduceMotion ? 1 : 0)
        .offset(y: appeared || reduceMotion ? 0 : 8)
        .task {
            await Task.yield()
            withAnimation(Motion.arrive(0.28)) { appeared = true }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(m.title). \(m.body)")
        .accessibilityAddTraits(.updatesFrequently)
    }
}
