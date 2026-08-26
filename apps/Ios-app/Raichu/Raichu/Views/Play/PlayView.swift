// PlayView.swift
// Raichu
//
// Offline game screen: play vs the computer or local pass-and-play.
//
// Layout follows the web's mobile game surface rather than a shrunk desktop
// sidebar (see docs/platforms/web.md): player bar, full-bleed board, player
// bar, coach strip, action dock, collapsible move list.

import SwiftUI

struct PlayView: View {
    @EnvironmentObject private var gameStore: GameStore
    @EnvironmentObject private var uiStore: UIStore
    @Environment(\.theme) private var theme

    @State private var showNewGameSheet = false
    @State private var showGuide = false
    @State private var coachDismissed = false
    @State private var restartArmed = false
    @State private var restartDisarmTask: Task<Void, Never>?
    @State private var resultDismissed = false
    @State private var gameOverAnnounced = false

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            VStack(spacing: 0) {
                navBar
                PlayerBar(
                    name: name(forWhite: !bottomIsWhite),
                    subtitle: subtitle(forWhite: !bottomIsWhite),
                    isWhite: !bottomIsWhite,
                    isCurrentTurn: isTurn(ofWhite: !bottomIsWhite),
                    isThinking: isThinking(forWhite: !bottomIsWhite),
                    capturedPieces: captured(forWhite: !bottomIsWhite)
                )

                BoardView(
                    board: displayBoard,
                    selectedPiece: gameStore.selectedPiece,
                    legalMoves: uiStore.replayMode ? [] : gameStore.legalMoves,
                    lastMove: uiStore.replayMode ? nil : gameStore.lastMove,
                    flipped: uiStore.boardFlipped,
                    canInteract: canInteract,
                    onTap: handleTap,
                    onDrop: handleDrop
                )
                .frame(maxHeight: .infinity)

                PlayerBar(
                    name: name(forWhite: bottomIsWhite),
                    subtitle: subtitle(forWhite: bottomIsWhite),
                    isWhite: bottomIsWhite,
                    isCurrentTurn: isTurn(ofWhite: bottomIsWhite),
                    isThinking: isThinking(forWhite: bottomIsWhite),
                    capturedPieces: captured(forWhite: bottomIsWhite)
                )

                VStack(spacing: Spacing.sm) {
                    if showCoach {
                        GameCoach(
                            moveCount: gameStore.moveHistory.count,
                            isThinking: gameStore.isThinking,
                            isYourTurn: isYourTurn,
                            selectedLegalMoves: gameStore.selectedPiece == nil ? nil : gameStore.legalMoves,
                            isLocalPvP: gameStore.gameMode == "pvp",
                            botName: BotIdentity.name,
                            onDismiss: { withAnimation(Motion.press(0.2)) { coachDismissed = true } }
                        )
                    }
                    actionDock
                    if !gameStore.moveHistory.isEmpty {
                        MoveHistoryPanel(
                            moves: gameStore.moveHistory,
                            replayMode: uiStore.replayMode,
                            replayStep: uiStore.replayMode ? uiStore.replayStep : gameStore.moveHistory.count,
                            onSelectStep: selectReplayStep,
                            onExitReplay: uiStore.exitReplay
                        )
                    }
                }
                .padding(.horizontal, Spacing.sm)
                .padding(.top, Spacing.sm)
                .padding(.bottom, Spacing.xs)
            }

            if showResult, let outcome {
                GameResultModal(
                    outcome: outcome,
                    primaryTitle: "Play Again",
                    onPrimary: {
                        resultDismissed = false
                        gameStore.restart()
                    },
                    onSecondary: { resultDismissed = true; showNewGameSheet = true },
                    onReplay: gameStore.moveHistory.isEmpty ? nil : {
                        resultDismissed = true
                        uiStore.enterReplay(step: 0)
                    },
                    onClose: { resultDismissed = true }
                )
                .transition(.opacity)
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showGuide) {
            HomeView()
                .environmentObject(uiStore)
                .environment(\.theme, theme)
        }
        .sheet(isPresented: $showNewGameSheet) {
            NewGameSheet(isPresented: $showNewGameSheet)
                .environmentObject(gameStore)
                .environmentObject(uiStore)
                .environment(\.theme, theme)
        }
        .onAppear {
            if gameStore.board.isEmpty { gameStore.newGame() }
            HapticManager.shared.prepare()
        }
        .onChange(of: gameStore.status) { _, status in
            guard status != "playing" else {
                gameOverAnnounced = false
                resultDismissed = false
                return
            }
            announceGameOver()
        }
        .onDisappear { restartDisarmTask?.cancel() }
        .animation(Motion.press(0.3), value: showResult)
    }

    // MARK: - Nav bar

    private var navBar: some View {
        HStack {
            Text("Raichu")
                .font(.system(.title3, design: .default, weight: .bold))
                .foregroundColor(theme.accent)
            Spacer()
            Button {
                HapticManager.shared.buttonTap()
                showGuide = true
            } label: {
                Image(systemName: "questionmark.circle")
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(theme.textSecondary)
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .accessibilityLabel("How to play")

            Button {
                HapticManager.shared.buttonTap()
                showNewGameSheet = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(theme.textSecondary)
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .accessibilityLabel("Game settings")
        }
        .padding(.leading, Spacing.lg)
        .padding(.trailing, Spacing.xs)
        .frame(height: 52)
        .background(theme.bgPanel)
    }

    // MARK: - Action dock

    private var actionDock: some View {
        HStack(spacing: Spacing.sm) {
            Button {
                HapticManager.shared.buttonTap()
                showNewGameSheet = true
            } label: {
                DockLabel(systemImage: "plus", title: "New game")
            }
            .raichuButton(.primary, theme: theme)

            Button(action: handleRestart) {
                DockLabel(
                    systemImage: restartArmed ? "exclamationmark.triangle.fill" : "arrow.counterclockwise",
                    title: restartArmed ? "Confirm" : "Restart"
                )
            }
            // Two-step confirm: the first tap arms, matching the web's
            // restartArmed state and its 3.5s auto-disarm.
            .raichuButton(.dock, theme: theme, fill: restartArmed ? Color(hex: "a84444") : nil)
            .accessibilityLabel(restartArmed ? "Confirm restart" : "Restart game")

            Button {
                HapticManager.shared.buttonTap()
                withAnimation(Motion.arrive(0.4)) { uiStore.flipBoard() }
            } label: {
                DockLabel(systemImage: "arrow.up.arrow.down", title: "Flip")
            }
            .raichuButton(.dock, theme: theme)
            .accessibilityLabel("Flip board")
        }
        .animation(Motion.press(0.18), value: restartArmed)
    }

    private func handleRestart() {
        restartDisarmTask?.cancel()

        guard restartArmed || gameStore.moveHistory.isEmpty else {
            HapticManager.shared.buttonTap()
            restartArmed = true
            restartDisarmTask = Task { @MainActor in
                try? await Task.sleep(for: .milliseconds(3500))
                guard !Task.isCancelled else { return }
                withAnimation(Motion.press(0.18)) { restartArmed = false }
            }
            return
        }

        HapticManager.shared.validMove()
        restartArmed = false
        resultDismissed = false
        uiStore.exitReplay()
        gameStore.restart()
    }

    // MARK: - Board wiring

    private var displayBoard: [[String]] {
        if uiStore.replayMode, gameStore.boardHistory.indices.contains(uiStore.replayStep) {
            return gameStore.boardHistory[uiStore.replayStep]
        }
        return gameStore.board
    }

    private var canInteract: Bool {
        !gameStore.isThinking && gameStore.status == "playing" && !uiStore.replayMode
    }

    // GameStore.selectPiece already commits when the tap lands on a legal
    // destination, so the view only decides which haptic to fire — one owner
    // for the move, one for the feedback.
    private func handleTap(_ pos: Position) {
        let landing = gameStore.selectedPiece != nil
            ? gameStore.legalMoves.first(where: { $0.to == pos })
            : nil

        if let landing {
            fireMoveHaptic(for: landing)
        } else {
            HapticManager.shared.buttonTap()
        }
        gameStore.selectPiece(at: pos)
    }

    private func handleDrop(_ from: Position, _ to: Position) {
        guard let move = gameStore.legalMoves.first(where: { $0.from == from && $0.to == to }) else {
            HapticManager.shared.invalidDrop()
            gameStore.clearSelection()
            return
        }
        fireMoveHaptic(for: move)
        gameStore.makeMove(move)
    }

    private func fireMoveHaptic(for move: Move) {
        if move.captured != nil {
            HapticManager.shared.capture()
        } else {
            HapticManager.shared.validMove()
        }
    }

    private func selectReplayStep(_ step: Int) {
        let total = gameStore.moveHistory.count
        let clamped = max(0, min(step, total))
        if clamped >= total {
            uiStore.exitReplay()
        } else {
            uiStore.enterReplay(step: clamped)
        }
    }

    // MARK: - Player bars

    private var bottomIsWhite: Bool { uiStore.boardFlipped }

    private func name(forWhite isWhite: Bool) -> String {
        guard gameStore.gameMode == "bot" else { return isWhite ? "White" : "Black" }
        return (gameStore.playerColor == "white") == isWhite ? "You" : BotIdentity.name
    }

    private func subtitle(forWhite isWhite: Bool) -> String {
        guard gameStore.gameMode == "bot",
              (gameStore.playerColor == "white") != isWhite else {
            return isWhite ? "White" : "Black"
        }
        return gameStore.difficulty.capitalized
    }

    private func captured(forWhite isWhite: Bool) -> [String] {
        isWhite ? gameStore.capturedByWhite : gameStore.capturedByBlack
    }

    private func isTurn(ofWhite isWhite: Bool) -> Bool {
        gameStore.status == "playing" && (gameStore.currentPlayer == "white") == isWhite
    }

    private func isThinking(forWhite isWhite: Bool) -> Bool {
        gameStore.isThinking && (gameStore.currentPlayer == "white") == isWhite
    }

    private var isYourTurn: Bool {
        guard gameStore.gameMode == "bot" else { return true }
        return gameStore.currentPlayer == gameStore.playerColor
    }

    // MARK: - Coach

    private var showCoach: Bool {
        !coachDismissed
            && gameStore.moveHistory.count < 2
            && gameStore.status == "playing"
            && !uiStore.replayMode
    }

    // MARK: - Result

    private var showResult: Bool {
        gameStore.status != "playing" && !resultDismissed && !showNewGameSheet
    }

    private var outcome: GameResultOutcome? {
        guard gameStore.status != "playing" else { return nil }

        let whiteWon = gameStore.status == "white_wins"
        let kind: GameResultOutcome.Kind
        let title: String

        if gameStore.status == "draw" {
            kind = .draw
            title = "Draw"
        } else if gameStore.gameMode == "bot" {
            let playerWon = whiteWon ? gameStore.playerColor == "white" : gameStore.playerColor == "black"
            kind = playerWon ? .won : .lost
            title = playerWon ? "You Won!" : "You Lost"
        } else {
            kind = .won
            title = whiteWon ? "White Wins!" : "Black Wins!"
        }

        return GameResultOutcome(
            kind: kind,
            title: title,
            detail: gameStore.drawReason,
            whiteName: name(forWhite: true),
            blackName: name(forWhite: false),
            whiteScore: gameStore.capturedByWhite.count,
            blackScore: gameStore.capturedByBlack.count,
            moveCount: gameStore.moveHistory.count,
            eloDelta: nil
        )
    }

    private func announceGameOver() {
        guard !gameOverAnnounced else { return }
        gameOverAnnounced = true

        switch outcome?.kind {
        case .won: HapticManager.shared.gameWon()
        case .lost: HapticManager.shared.gameLost()
        default: HapticManager.shared.buttonTap()
        }
    }
}

#Preview {
    NavigationStack { PlayView() }
        .environmentObject(GameStore())
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
