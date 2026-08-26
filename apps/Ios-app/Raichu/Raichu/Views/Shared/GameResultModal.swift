// GameResultModal.swift
// Raichu
//
// End-of-game dialog, shared by the offline and online screens.
// Ported from apps/web/src/components/game/GameResultModal.tsx.

import SwiftUI

struct GameResultOutcome {
    enum Kind { case won, lost, draw }

    let kind: Kind
    let title: String
    /// e.g. "Threefold repetition", "Opponent resigned".
    var detail: String?
    var whiteName: String = "White"
    var blackName: String = "Black"
    var whiteScore: Int = 0
    var blackScore: Int = 0
    var moveCount: Int = 0
    var eloDelta: Int?

    var color: Color {
        switch kind {
        case .won: return Color(hex: "22c55e")
        case .lost: return Color(hex: "ef4444")
        case .draw: return Color(hex: "f59e0b")
        }
    }
}

struct GameResultModal: View {
    let outcome: GameResultOutcome
    var primaryTitle: String = "Play Again"
    var onPrimary: () -> Void
    var onSecondary: (() -> Void)?
    var secondaryTitle: String = "New Game"
    var onReplay: (() -> Void)?
    var onClose: () -> Void

    @Environment(\.theme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    // Staggered entrance, matching the web's 100 / 150 / 210ms delays.
    @State private var showTitle = false
    @State private var showScore = false
    @State private var showActions = false

    var body: some View {
        ZStack {
            Color.black.opacity(0.65)
                .ignoresSafeArea()
                .onTapGesture(perform: onClose)

            VStack(spacing: 0) {
                Rectangle()
                    .fill(outcome.color)
                    .frame(height: 4)

                VStack(spacing: Spacing.lg) {
                    header
                    scoreBlock
                    if let delta = outcome.eloDelta { eloRow(delta) }
                    actions
                }
                .padding(.horizontal, 26)
                .padding(.top, Spacing.xl)
                .padding(.bottom, 26)
            }
            .background(theme.bgPanel)
            .clipShape(RoundedRectangle(cornerRadius: Radius.dialog, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.dialog, style: .continuous)
                    .strokeBorder(theme.border, lineWidth: 1)
            )
            .elevation(.dialog(Color.black.opacity(0.55)))
            .frame(maxWidth: 380)
            .padding(.horizontal, Spacing.lg)
            .overlay(alignment: .topTrailing) {
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(theme.textSecondary)
                        .frame(width: 44, height: 44)   // 44pt HIG minimum
                        .contentShape(Rectangle())
                }
                .padding(.trailing, Spacing.xl)
                .padding(.top, Spacing.md)
                .accessibilityLabel("Close")
            }
        }
        .task { await runEntrance() }
        .accessibilityAddTraits(.isModal)
    }

    private var header: some View {
        VStack(spacing: 6) {
            Text(outcome.title)
                .font(Typography.displayTitle)
                .foregroundColor(outcome.color)
                .multilineTextAlignment(.center)
                // The result is the app's climactic moment; let it wrap at
                // accessibility text sizes rather than truncate.
                .fixedSize(horizontal: false, vertical: true)
            if let detail = outcome.detail {
                Text(detail)
                    .font(Typography.label)
                    .foregroundColor(theme.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
        .opacity(showTitle || reduceMotion ? 1 : 0)
        .offset(y: showTitle || reduceMotion ? 0 : 8)
    }

    private var scoreBlock: some View {
        VStack(spacing: 6) {
            scoreRow
            Text("\(outcome.moveCount) moves")
                .font(Typography.kicker)
                .foregroundColor(theme.textSecondary)
        }
        .opacity(showScore || reduceMotion ? 1 : 0)
        .offset(y: showScore || reduceMotion ? 0 : 10)
    }

    private var scoreRow: some View {
        HStack(spacing: Spacing.md) {
            Avatar(name: outcome.whiteName, size: 40, theme: theme, shape: .circle)
            Spacer(minLength: 0)
            HStack(spacing: 6) {
                Text("\(outcome.whiteScore)")
                Text("–").foregroundColor(theme.textSecondary)
                Text("\(outcome.blackScore)")
            }
            // Relative to .title so the score scales with Dynamic Type; the
            // rounded design and tabular figures are the deliberate look.
            .font(.system(.title, design: .rounded, weight: .black))
            .foregroundColor(theme.textPrimary)
            .monospacedDigit()
            Spacer(minLength: 0)
            Avatar(name: outcome.blackName, size: 40, theme: theme, shape: .circle)
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.vertical, 14)
        .background(theme.bgSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Radius.board, style: .continuous))
    }

    private func eloRow(_ delta: Int) -> some View {
        HStack(spacing: 6) {
            Text("ELO")
                .font(Typography.kicker)
                .foregroundColor(theme.textSecondary)
            Text(delta >= 0 ? "+\(delta)" : "\(delta)")
                .font(Typography.monoStrong)
                .foregroundColor(delta >= 0 ? Color(hex: "22c55e") : Color(hex: "ef4444"))
        }
        .padding(.top, Spacing.md)
    }

    private var actions: some View {
        VStack(spacing: Spacing.sm) {
            if let onReplay {
                Button("Watch Replay", action: onReplay)
                    .raichuButton(.secondary, theme: theme)
            }
            Button(primaryTitle, action: onPrimary)
                .raichuButton(.primary, theme: theme)
            if let onSecondary {
                Button(secondaryTitle, action: onSecondary)
                    .font(Typography.label)
                    .foregroundColor(theme.textSecondary)
                    .frame(maxWidth: .infinity, minHeight: 44)   // 44pt HIG minimum
                    .contentShape(Rectangle())
            }
        }
        .padding(.top, Spacing.sm)
        .opacity(showActions || reduceMotion ? 1 : 0)
        .offset(y: showActions || reduceMotion ? 0 : 10)
    }

    private func runEntrance() async {
        guard !reduceMotion else {
            showTitle = true; showScore = true; showActions = true
            return
        }
        try? await Task.sleep(for: .milliseconds(100))
        withAnimation(Motion.arrive(0.36)) { showTitle = true }
        try? await Task.sleep(for: .milliseconds(50))
        withAnimation(Motion.arrive(0.32)) { showScore = true }
        try? await Task.sleep(for: .milliseconds(60))
        withAnimation(Motion.arrive(0.32)) { showActions = true }
    }
}
