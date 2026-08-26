// OnlineGameView.swift
// Raichu
// Live multiplayer game screen — connects via Supabase Realtime + REST API.

import SwiftUI

struct OnlineGameView: View {
    let gameId: String

    @EnvironmentObject var onlineGameStore: OnlineGameStore
    @EnvironmentObject var authStore: AuthStore
    @EnvironmentObject var uiStore: UIStore
    @Environment(\.theme) var theme
    @Environment(\.dismiss) var dismiss

    @State private var showResignAlert = false
    @State private var resultDismissed = false

    private var myColor: String { onlineGameStore.myColor ?? "white" }
    /// `true` renders White at the bottom (BoardView.flipped, web boardFlipped).
    /// A black player sees their own side at the bottom; everyone else sees White.
    private var whiteAtBottom: Bool { myColor != "black" }

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            VStack(spacing: 0) {
                navBar
                    .padding(.bottom, 4)

                if onlineGameStore.game?.status == "waiting" {
                    waitingRoom
                } else {
                    gameContent
                }
            }

            // Game over
            if isFinished && !resultDismissed && !uiStore.replayMode {
                GameResultModal(
                    outcome: resultOutcome,
                    primaryTitle: "Back to Lobby",
                    onPrimary: { dismiss() },
                    onReplay: onlineGameStore.moves.isEmpty ? nil : {
                        resultDismissed = true
                        uiStore.enterReplay(step: 0)
                    },
                    onClose: { resultDismissed = true }
                )
                .transition(.opacity)
            }
        }
        .navigationBarHidden(true)
        .task {
            await onlineGameStore.loadGame(gameId)
            onlineGameStore.subscribeRealtime(gameId: gameId)
        }
        .onDisappear {
            onlineGameStore.unsubscribe()
            uiStore.exitReplay()
        }
        .alert("Resign?", isPresented: $showResignAlert) {
            Button("Resign", role: .destructive) {
                Task { await onlineGameStore.resign() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You will forfeit this game.")
        }
    }

    // MARK: - Nav Bar

    private var navBar: some View {
        HStack {
            Button(action: { dismiss() }) {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                    Text("Lobby")
                }
                .foregroundColor(theme.accent)
            }
            Spacer()
            Text("Game")
                .font(.headline)
                .foregroundColor(theme.textPrimary)
            Spacer()
            Button(action: { showResignAlert = true }) {
                Text("Resign")
                    .font(.subheadline)
                    .foregroundColor(theme.captureIndicator)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(theme.bgPanel)
    }

    // MARK: - Waiting Room

    private var waitingRoom: some View {
        VStack(spacing: 24) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)
                .tint(theme.accent)

            Text("Waiting for opponent...")
                .font(.title3.bold())
                .foregroundColor(theme.textPrimary)

            if let code = onlineGameStore.game?.invite_code {
                VStack(spacing: 8) {
                    Text("Invite Code")
                        .font(.caption)
                        .foregroundColor(theme.textSecondary)

                    HStack(spacing: 12) {
                        Text(code)
                            .font(.system(size: 32, weight: .black, design: .monospaced))
                            .foregroundColor(theme.accent)

                        Button(action: {
                            UIPasteboard.general.string = code
                            HapticManager.shared.copyCode()
                        }) {
                            Image(systemName: "doc.on.doc")
                                .foregroundColor(theme.textSecondary)
                        }
                    }
                    .padding(16)
                    .background(theme.bgPanel)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.border))
                }
            }

            Button(action: { dismiss() }) {
                Text("Cancel")
                    .foregroundColor(theme.captureIndicator)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(theme.btnSecondaryBg)
                    .cornerRadius(10)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Game Content

    private var gameContent: some View {
        VStack(spacing: 0) {
            // Top player
            PlayerBar(
                name: topPlayer?.username ?? "Opponent",
                elo: topPlayer?.elo_rating ?? 1200,
                isWhite: topColor == "white",
                isCurrentTurn: onlineGameStore.currentPlayer == topColor,
                capturedPieces: topCaptured
            )

            // Board
            BoardView(
                board: displayBoard,
                selectedPiece: onlineGameStore.selectedPiece,
                legalMoves: uiStore.replayMode ? [] : onlineGameStore.legalMoves,
                lastMove: uiStore.replayMode ? nil : onlineGameStore.lastMove,
                flipped: whiteAtBottom,
                canInteract: canInteract,
                onTap: { pos in
                    HapticManager.shared.buttonTap()
                    onlineGameStore.selectPiece(at: pos)
                },
                onDrop: { from, to in
                    if let move = onlineGameStore.legalMoves.first(where: { $0.from == from && $0.to == to }) {
                        if move.captured != nil { HapticManager.shared.capture() }
                        else { HapticManager.shared.validMove() }
                        Task { await onlineGameStore.submitMove(move) }
                    } else {
                        HapticManager.shared.invalidDrop()
                        onlineGameStore.clearSelection()
                    }
                }
            )
            .frame(maxHeight: .infinity)

            // Bottom player
            PlayerBar(
                name: bottomPlayer?.username ?? "You",
                elo: bottomPlayer?.elo_rating ?? 1200,
                isWhite: bottomColor == "white",
                isCurrentTurn: onlineGameStore.currentPlayer == bottomColor,
                capturedPieces: bottomCaptured
            )

            if !onlineGameStore.moves.isEmpty {
                MoveHistoryPanel(
                    moves: onlineGameStore.moveList,
                    replayMode: uiStore.replayMode,
                    replayStep: uiStore.replayMode ? uiStore.replayStep : onlineGameStore.moves.count,
                    onSelectStep: selectReplayStep,
                    onExitReplay: uiStore.exitReplay
                )
                .padding(.horizontal, Spacing.sm)
                .padding(.top, Spacing.sm)
                .padding(.bottom, Spacing.xs)
            }
        }
    }

    // MARK: - Player Helpers

    private var topColor: String { whiteAtBottom ? "black" : "white" }
    private var bottomColor: String { whiteAtBottom ? "white" : "black" }

    private var topPlayer: Profile? {
        topColor == "white" ? onlineGameStore.game?.white_player : onlineGameStore.game?.black_player
    }
    private var bottomPlayer: Profile? {
        bottomColor == "white" ? onlineGameStore.game?.white_player : onlineGameStore.game?.black_player
    }
    private var topCaptured: [String] {
        topColor == "white" ? onlineGameStore.capturedByWhite : onlineGameStore.capturedByBlack
    }
    private var bottomCaptured: [String] {
        bottomColor == "white" ? onlineGameStore.capturedByWhite : onlineGameStore.capturedByBlack
    }

    private var canInteract: Bool {
        onlineGameStore.status == "playing"
            && onlineGameStore.currentPlayer == myColor
            && !onlineGameStore.isThinking
            && !uiStore.replayMode
    }

    // MARK: - Game Over Overlay

    private var displayBoard: [[String]] {
        if uiStore.replayMode, onlineGameStore.boardHistory.indices.contains(uiStore.replayStep) {
            return onlineGameStore.boardHistory[uiStore.replayStep]
        }
        return onlineGameStore.board
    }

    private var resultOutcome: GameResultOutcome {
        let status = onlineGameStore.status
        let winnerId = onlineGameStore.game?.winner_id
        let myId = authStore.userId

        let kind: GameResultOutcome.Kind
        if status == "draw" || winnerId == nil {
            kind = .draw
        } else {
            kind = winnerId == myId ? .won : .lost
        }

        return GameResultOutcome(
            kind: kind,
            title: gameOverTitle,
            detail: status == "abandoned" ? "Opponent resigned" : onlineGameStore.drawReason,
            whiteName: onlineGameStore.game?.white_player?.username ?? "White",
            blackName: onlineGameStore.game?.black_player?.username ?? "Black",
            whiteScore: onlineGameStore.capturedByWhite.count,
            blackScore: onlineGameStore.capturedByBlack.count,
            moveCount: onlineGameStore.moves.count,
            eloDelta: nil
        )
    }

    private func selectReplayStep(_ step: Int) {
        let total = onlineGameStore.moves.count
        let clamped = max(0, min(step, total))
        if clamped >= total {
            uiStore.exitReplay()
        } else {
            uiStore.enterReplay(step: clamped)
        }
    }

    private var isFinished: Bool {
        onlineGameStore.status != "playing" && onlineGameStore.status != "waiting"
    }

    private var gameOverTitle: String {
        let status = onlineGameStore.status
        if status == "abandoned" { return "Game Resigned" }
        let winnerId = onlineGameStore.game?.winner_id
        let myId = authStore.userId
        if winnerId == myId { return "You Won!" }
        if winnerId != nil { return "You Lost" }
        return status == "draw" ? "Draw" : "Game Over"
    }

}

#Preview {
    OnlineGameView(gameId: "preview-id")
        .environmentObject(OnlineGameStore())
        .environmentObject(AuthStore())
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
