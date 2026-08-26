// MoveHistoryPanel.swift
// Raichu
//
// Collapsible move list with replay transport.
// Ported from apps/web/src/components/panels/MoveHistory.tsx: collapsed by
// default on phones with a "Last: {move}" preview in the header.

import SwiftUI

struct MoveHistoryPanel: View {
    let moves: [Move]
    let replayMode: Bool
    /// Index into the board history; `0` is the starting position.
    let replayStep: Int
    var onSelectStep: (Int) -> Void
    var onExitReplay: () -> Void

    @Environment(\.theme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // Named `typeSize`, not `dynamicTypeSize`: the View modifier of that name
    // shadows a stored property in member lookup.
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var expanded = false

    private var isAccessibilityText: Bool { typeSize.isAccessibilitySize }

    private var pairs: [(index: Int, white: Move?, black: Move?)] {
        stride(from: 0, to: moves.count, by: 2).map { i in
            (index: i / 2,
             white: moves[i],
             black: i + 1 < moves.count ? moves[i + 1] : nil)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            if expanded {
                Divider().overlay(theme.border)
                list
            }
        }
        .background(theme.bgPanel)
        .clipShape(RoundedRectangle(cornerRadius: Radius.bar, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.bar, style: .continuous)
                .strokeBorder(theme.border, lineWidth: 1)
        )
    }

    private var header: some View {
        HStack(spacing: Spacing.sm) {
            Button {
                HapticManager.shared.buttonTap()
                withAnimation(reduceMotion ? nil : Motion.press(0.22)) { expanded.toggle() }
            } label: {
                HStack(spacing: 6) {
                    Text("Moves")
                        .font(Typography.bodyStrong)
                        .foregroundColor(theme.textPrimary)
                        .fixedSize()
                    Text("\(moves.count)")
                        .font(Typography.caption)
                        .foregroundColor(theme.textSecondary)
                    // The "Last:" preview is optional context. At accessibility
                    // sizes it has nowhere to go and was reported clipped, so it
                    // yields the row rather than truncating mid-move.
                    if !expanded, !isAccessibilityText, let last = moves.last {
                        Text("Last: \(MoveNotation.short(last))")
                            .font(Typography.caption)
                            .foregroundColor(theme.textSecondary)
                            .lineLimit(1)
                            .truncationMode(.tail)
                    }
                    Image(systemName: "chevron.down")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(theme.textSecondary)
                        .rotationEffect(.degrees(expanded ? 180 : 0))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(expanded ? "Collapse move list" : "Expand move list")

            transport
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, 10)
        .frame(minHeight: 44)
    }

    private var transport: some View {
        HStack(spacing: 2) {
            if replayMode {
                Button("Live") {
                    HapticManager.shared.buttonTap()
                    onExitReplay()
                }
                .font(Typography.kicker)
                .foregroundColor(theme.accent)
                .padding(.horizontal, 8)
                .frame(minHeight: 30)
                .background(theme.accent.alpha(.a22))
                .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
            }
            transportButton("backward.end.fill", "First move", enabled: replayStep > 0) {
                onSelectStep(0)
            }
            transportButton("backward.fill", "Previous move", enabled: replayStep > 0) {
                onSelectStep(replayStep - 1)
            }
            transportButton("forward.fill", "Next move", enabled: replayStep < moves.count) {
                onSelectStep(replayStep + 1)
            }
            transportButton("forward.end.fill", "Last move", enabled: replayStep < moves.count) {
                onSelectStep(moves.count)
            }
        }
    }

    private func transportButton(
        _ icon: String,
        _ label: String,
        enabled: Bool,
        action: @escaping () -> Void
    ) -> some View {
        Button {
            HapticManager.shared.buttonTap()
            action()
        } label: {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(theme.textSecondary)
                .frame(width: 44, height: 44)   // 44pt HIG minimum
                .contentShape(Rectangle())
        }
        .disabled(!enabled || moves.isEmpty)
        .opacity(enabled && !moves.isEmpty ? 1 : 0.36)
        .accessibilityLabel(label)
    }

    private var list: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 2) {
                    ForEach(pairs, id: \.index) { pair in
                        HStack(spacing: Spacing.sm) {
                            Text("\(pair.index + 1).")
                                .font(Typography.mono)
                                .foregroundColor(theme.textSecondary)
                                .frame(width: 26, alignment: .trailing)
                            halfMove(pair.white, ply: pair.index * 2)
                            halfMove(pair.black, ply: pair.index * 2 + 1)
                            Spacer(minLength: 0)
                        }
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, 3)
                        .background(pair.index % 2 == 1 ? theme.bgSecondary.opacity(0.4) : .clear)
                        .id(pair.index)
                    }
                }
                .padding(.vertical, Spacing.sm)
            }
            .frame(maxHeight: 220)
            .onChange(of: moves.count) { _, count in
                guard !replayMode, count > 0 else { return }
                withAnimation(reduceMotion ? nil : Motion.arrive(0.2)) {
                    proxy.scrollTo((count - 1) / 2, anchor: .bottom)
                }
            }
        }
    }

    @ViewBuilder
    private func halfMove(_ move: Move?, ply: Int) -> some View {
        if let move {
            // Step N shows the board *after* N plies, so ply index maps to N+1.
            let isActive = replayMode && replayStep == ply + 1
            Button {
                HapticManager.shared.buttonTap()
                onSelectStep(ply + 1)
            } label: {
                Text(MoveNotation.short(move))
                    .font(Typography.mono)
                    .foregroundColor(isActive ? theme.accent : theme.textPrimary)
                    .fontWeight(isActive ? .bold : .regular)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(
                        RoundedRectangle(cornerRadius: 4, style: .continuous)
                            .fill(isActive ? theme.accent.alpha(.a22) : .clear)
                    )
                    .frame(width: 92, alignment: .leading)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Review \(MoveNotation.spoken(move))")
        } else {
            Color.clear.frame(width: 92, height: 1)
        }
    }
}
