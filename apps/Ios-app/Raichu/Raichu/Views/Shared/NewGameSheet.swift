// NewGameSheet.swift
// Raichu
//
// Game setup sheet. Ported from apps/web/src/components/panels/NewGameDialog.tsx
// (commit 3aeebce), which replaced a bare picker list with mode cards, a
// difficulty/colour pair and a live summary line.

import SwiftUI

struct NewGameSheet: View {
    @Binding var isPresented: Bool
    /// Called for the "online" mode, which routes to the lobby instead of
    /// starting a local game.
    var onGoOnline: (() -> Void)?

    @EnvironmentObject private var gameStore: GameStore
    @Environment(\.theme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var mode: String = "bot"
    @State private var difficulty: String = "easy"
    @State private var color: String = "white"

    private struct ModeOption {
        let value: String
        let icon: String
        let title: String
        let detail: String
        let badge: String
    }

    private var modes: [ModeOption] {
        [
            .init(value: "bot", icon: "cpu", title: "Play \(BotIdentity.name)",
                  detail: "A focused solo game with adjustable strength.", badge: "Instant"),
            .init(value: "pvp", icon: "person.2.fill", title: "Local game",
                  detail: "Pass this device between two players.", badge: "2 players"),
            .init(value: "online", icon: "globe", title: "Play online",
                  detail: "Head to the lobby and challenge a real player.", badge: "Live"),
        ]
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    modeGrid
                    if mode == "bot" { botSettings }
                    summary
                }
                .padding(.horizontal, Spacing.lg)
                .padding(.bottom, Spacing.lg)
            }
            .scrollBounceBehavior(.basedOnSize)
            footer
        }
        .background(theme.bgPanel)
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .presentationBackground(theme.bgPanel)
    }

    // MARK: - Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Fresh board")
                .font(Typography.kicker)
                .tracking(1.2)
                .foregroundColor(theme.accent)
            Text("Choose your game")
                .font(Typography.dialogTitle)
                .foregroundColor(theme.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Pick a mode now. You can change everything again later.")
                .font(Typography.caption)
                .foregroundColor(theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.lg)
        .padding(.bottom, Spacing.md)
    }

    // MARK: - Modes

    private var modeGrid: some View {
        VStack(spacing: Spacing.sm) {
            ForEach(modes, id: \.value) { option in
                Button {
                    HapticManager.shared.buttonTap()
                    withAnimation(reduceMotion ? nil : Motion.press(0.18)) { mode = option.value }
                } label: {
                    modeCard(option)
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(mode == option.value ? [.isSelected] : [])
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Game mode")
    }

    private func modeCard(_ option: ModeOption) -> some View {
        let selected = mode == option.value

        return HStack(spacing: Spacing.md) {
            Image(systemName: option.icon)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(selected ? .white : theme.textSecondary)
                .frame(width: 38, height: 38)
                .background(selected ? theme.accent : theme.bgPrimary)
                .clipShape(RoundedRectangle(cornerRadius: Radius.bar, style: .continuous))

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: Spacing.sm) {
                    Text(option.title)
                        .font(Typography.bodyStrong)
                        .foregroundColor(theme.textPrimary)
                    Badge(text: option.badge, color: theme.accent)
                }
                Text(option.detail)
                    .font(Typography.caption)
                    .foregroundColor(theme.textSecondary)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)

            Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 17))
                .foregroundColor(selected ? theme.accent : theme.border)
        }
        .padding(Spacing.md)
        .frame(minHeight: 76)
        .background(selected ? theme.accent.alpha(.a14) : theme.bgSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Radius.mode, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.mode, style: .continuous)
                .strokeBorder(selected ? theme.accent : theme.border, lineWidth: selected ? 1.5 : 1)
        )
    }

    // MARK: - Bot settings

    private var botSettings: some View {
        VStack(alignment: .leading, spacing: Spacing.lg) {
            Divider().overlay(theme.border)

            fieldset("Difficulty", help: "How much time the computer spends calculating.") {
                HStack(spacing: Spacing.sm) {
                    choice("Easy", "Learn the board", value: "easy", binding: $difficulty)
                    choice("Medium", "Balanced play", value: "medium", binding: $difficulty)
                    choice("Hard", "Think carefully", value: "hard", binding: $difficulty)
                }
            }

            fieldset("Play as", help: "White always makes the opening move.") {
                HStack(spacing: Spacing.sm) {
                    colorChoice("White", "You move first", piece: "@", value: "white")
                    colorChoice("Black", "\(BotIdentity.name) moves first", piece: "$", value: "black")
                }
            }
        }
    }

    private func fieldset<Content: View>(
        _ title: String,
        help: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Typography.bodyStrong)
                    .foregroundColor(theme.textPrimary)
                Text(help)
                    .font(Typography.caption)
                    .foregroundColor(theme.textSecondary)
            }
            content()
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(title)
    }

    private func choice(
        _ title: String,
        _ detail: String,
        value: String,
        binding: Binding<String>
    ) -> some View {
        let selected = binding.wrappedValue == value

        return Button {
            HapticManager.shared.buttonTap()
            withAnimation(reduceMotion ? nil : Motion.press(0.16)) { binding.wrappedValue = value }
        } label: {
            VStack(spacing: 2) {
                Text(title)
                    .font(Typography.captionStrong)
                    .foregroundColor(theme.textPrimary)
                Text(detail)
                    .font(Typography.captionSmall)
                    .foregroundColor(theme.textSecondary)
                    .multilineTextAlignment(.center)
                    // No line limit: the card's 64pt is a minimum, so the text
                    // grows the card instead of being clipped at large sizes.
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity)
            .frame(minHeight: 64)
            .padding(.horizontal, 4)
            .background(selected ? theme.accent.alpha(.a14) : theme.bgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: Radius.bar, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.bar, style: .continuous)
                    .strokeBorder(selected ? theme.accent : theme.border, lineWidth: selected ? 1.5 : 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(title). \(detail)")
        .accessibilityAddTraits(selected ? [.isSelected] : [])
    }

    private func colorChoice(
        _ title: String,
        _ detail: String,
        piece: String,
        value: String
    ) -> some View {
        let selected = color == value

        return Button {
            HapticManager.shared.buttonTap()
            withAnimation(reduceMotion ? nil : Motion.press(0.16)) { color = value }
        } label: {
            HStack(spacing: Spacing.sm) {
                PieceImage(piece: piece, size: 38)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(Typography.captionStrong)
                        .foregroundColor(theme.textPrimary)
                    Text(detail)
                        .font(Typography.captionSmall)
                        .foregroundColor(theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, Spacing.sm)
            .frame(maxWidth: .infinity)
            .frame(minHeight: 64)
            .background(selected ? theme.accent.alpha(.a14) : theme.bgSecondary)
            .clipShape(RoundedRectangle(cornerRadius: Radius.bar, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.bar, style: .continuous)
                    .strokeBorder(selected ? theme.accent : theme.border, lineWidth: selected ? 1.5 : 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Play as \(title). \(detail)")
        .accessibilityAddTraits(selected ? [.isSelected] : [])
    }

    // MARK: - Summary

    private var summary: some View {
        HStack(spacing: Spacing.sm) {
            Circle()
                .fill(theme.accent)
                .frame(width: 7, height: 7)
                .overlay(Circle().stroke(theme.accent.alpha(.a30), lineWidth: 4))
            Text(summaryText)
                .font(Typography.caption)
                .foregroundColor(theme.textPrimary)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, Spacing.md)
        .frame(minHeight: 38)
        .background(theme.accent.alpha(.a12))
        .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
        .accessibilityElement(children: .combine)
    }

    private var summaryText: String {
        switch mode {
        case "pvp":
            return "Pass and play on this device · White moves first"
        case "online":
            return "Continue to the lobby to find or join a match"
        default:
            let who = color == "white" ? "You move first" : "\(BotIdentity.name) moves first"
            return "\(who) · \(difficulty.capitalized) difficulty"
        }
    }

    // MARK: - Footer

    private var footer: some View {
        HStack(spacing: Spacing.md) {
            Button("Cancel") { isPresented = false }
                .raichuButton(.secondary, theme: theme)
                .frame(maxWidth: 120)

            Button(action: start) {
                HStack(spacing: 6) {
                    Text(startLabel)
                    Image(systemName: "arrow.right")
                        .font(.system(size: 12, weight: .bold))
                }
            }
            .raichuButton(.primary, theme: theme)
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.top, Spacing.md)
        .padding(.bottom, Spacing.sm)
        .background(theme.bgPanel)
        .overlay(alignment: .top) { Divider().overlay(theme.border) }
    }

    private var startLabel: String {
        switch mode {
        case "pvp": return "Start local game"
        case "online": return "Continue to lobby"
        default: return "Play \(BotIdentity.name)"
        }
    }

    private func start() {
        HapticManager.shared.buttonTap()
        isPresented = false

        if mode == "online" {
            onGoOnline?()
            return
        }
        gameStore.newGame(mode: mode, difficulty: difficulty, playerColor: color)
    }
}
