// PlayView.swift
// Raichu
// Offline game screen: play vs AI or local PvP (pass-and-play).

import SwiftUI

struct PlayView: View {
    @EnvironmentObject var gameStore: GameStore
    @EnvironmentObject var uiStore: UIStore
    @Environment(\.theme) var theme

    @State private var showNewGameSheet = false
    @State private var showMoveHistory = false
    @State private var gameOverHandled = false

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            VStack(spacing: 0) {
                navBar
                CapturedPiecesRow(pieces: topCaptured)
                    .padding(.horizontal, 8)
                    .padding(.top, 4)

                boardSection

                CapturedPiecesRow(pieces: bottomCaptured)
                    .padding(.horizontal, 8)
                    .padding(.bottom, 4)

                gameInfoRow
                    .padding(.horizontal, 12)
                    .padding(.top, 8)

                if !gameStore.moveHistory.isEmpty {
                    replayControls
                        .padding(.horizontal, 12)
                }

                controlsPanel
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
                    .padding(.bottom, 16)
            }

            // Bot thinking overlay
            if gameStore.isThinking {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .allowsHitTesting(true)
                VStack(spacing: 12) {
                    ProgressView()
                        .tint(.white)
                    Text("Thinking...")
                        .font(.headline)
                        .foregroundColor(.white)
                }
            }

            // Game over overlay
            if gameStore.status != "playing" && !showNewGameSheet {
                gameOverOverlay
            }
        }
        .navigationTitle("")
        .navigationBarHidden(true)
        .sheet(isPresented: $showNewGameSheet) {
            NewGameSheet(isPresented: $showNewGameSheet)
                .environmentObject(gameStore)
                .environmentObject(uiStore)
                .environment(\.theme, theme)
        }
        .onAppear {
            if gameStore.board.isEmpty {
                gameStore.newGame()
            }
        }
    }

    // MARK: - Nav Bar

    private var navBar: some View {
        HStack {
            Text("Raichu")
                .font(.title2.bold())
                .foregroundColor(theme.accent)
            Spacer()
            Button(action: { showNewGameSheet = true }) {
                Image(systemName: "gearshape.fill")
                    .foregroundColor(theme.textSecondary)
                    .font(.title3)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(theme.bgPanel)
    }

    // MARK: - Board

    private var boardSection: some View {
        let boardFlipped = uiStore.boardFlipped
        let displayBoard: [[String]] = {
            if uiStore.replayMode, uiStore.replayStep < gameStore.boardHistory.count {
                return gameStore.boardHistory[uiStore.replayStep]
            }
            return gameStore.board
        }()
        let canInteract = !gameStore.isThinking && gameStore.status == "playing" && !uiStore.replayMode

        return BoardView(
            board: displayBoard,
            selectedPiece: gameStore.selectedPiece,
            legalMoves: gameStore.legalMoves,
            lastMove: gameStore.lastMove,
            flipped: boardFlipped,
            canInteract: canInteract,
            onTap: { pos in
                HapticManager.shared.buttonTap()
                gameStore.selectPiece(at: pos)
            },
            onDrop: { from, to in
                if let move = gameStore.legalMoves.first(where: { $0.from == from && $0.to == to }) {
                    if move.captured != nil { HapticManager.shared.capture() }
                    else { HapticManager.shared.validMove() }
                    gameStore.makeMove(move)
                } else {
                    HapticManager.shared.invalidDrop()
                    gameStore.clearSelection()
                }
            }
        )
        // Replay step: 100ms easeInOut fade on board transition (spec 6.2)
        .animation(.easeInOut(duration: 0.1), value: uiStore.replayStep)
        .padding(8)
    }

    // MARK: - Captured Pieces (perspective-aware)

    private var topCaptured: [String] {
        uiStore.boardFlipped ? gameStore.capturedByBlack : gameStore.capturedByWhite
    }

    private var bottomCaptured: [String] {
        uiStore.boardFlipped ? gameStore.capturedByWhite : gameStore.capturedByBlack
    }

    // MARK: - Game Info Row

    private var gameInfoRow: some View {
        HStack {
            // Color indicator + turn text
            HStack(spacing: 8) {
                Circle()
                    .fill(gameStore.currentPlayer == "white" ? Color.white : Color.black)
                    .frame(width: 12, height: 12)
                    .overlay(Circle().stroke(theme.border, lineWidth: 1))
                VStack(alignment: .leading, spacing: 2) {
                    Text(gameStore.isThinking ? "Bot thinking..." : "\(gameStore.currentPlayer.capitalized) to move")
                        .font(.subheadline.bold())
                        .foregroundColor(theme.textPrimary)
                    Text(gameModeLabel)
                        .font(.caption)
                        .foregroundColor(theme.textSecondary)
                }
            }
            Spacer()
            Text("Move \(gameStore.moveHistory.count)")
                .font(.caption)
                .foregroundColor(theme.textSecondary)
        }
        .padding(10)
        .background(theme.bgPanel)
        .cornerRadius(10)
    }

    private var gameModeLabel: String {
        switch gameStore.gameMode {
        case "bot": return "vs AI (\(gameStore.difficulty.capitalized))"
        case "pvp": return "Local PvP"
        default: return ""
        }
    }

    // MARK: - Replay Controls

    private var replayControls: some View {
        HStack(spacing: 16) {
            if uiStore.replayMode {
                Text("Reviewing")
                    .font(.caption)
                    .foregroundColor(theme.accent)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(theme.accent.opacity(0.15))
                    .cornerRadius(6)
            }
            Spacer()
            Group {
                replayButton(icon: "backward.end.fill") {
                    uiStore.enterReplay(step: 0)
                }
                replayButton(icon: "backward.fill") {
                    if uiStore.replayMode {
                        uiStore.setReplayStep(max(0, uiStore.replayStep - 1))
                    } else {
                        uiStore.enterReplay(step: gameStore.boardHistory.count - 1)
                    }
                }
                replayButton(icon: "forward.fill") {
                    let next = uiStore.replayStep + 1
                    if next >= gameStore.boardHistory.count {
                        uiStore.exitReplay()
                    } else {
                        uiStore.setReplayStep(next)
                    }
                }
                replayButton(icon: "forward.end.fill") {
                    uiStore.exitReplay()
                }
            }
            if uiStore.replayMode {
                Button("Live") { uiStore.exitReplay() }
                    .font(.caption.bold())
                    .foregroundColor(theme.accent)
            }
        }
        .padding(8)
        .background(theme.bgPanel)
        .cornerRadius(10)
        .padding(.top, 4)
    }

    private func replayButton(icon: String, action: @escaping () -> Void) -> some View {
        Button(action: { HapticManager.shared.buttonTap(); action() }) {
            Image(systemName: icon)
                .foregroundColor(theme.textSecondary)
                .font(.callout)
        }
    }

    // MARK: - Controls Panel

    private var controlsPanel: some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                Button(action: { HapticManager.shared.buttonTap(); showNewGameSheet = true }) {
                    Label("New Game", systemImage: "plus.circle.fill")
                        .font(.subheadline.bold())
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(theme.accent)
                        .cornerRadius(10)
                }

                Button(action: { HapticManager.shared.buttonTap(); gameStore.restart() }) {
                    Label("Restart", systemImage: "arrow.counterclockwise")
                        .font(.subheadline)
                        .foregroundColor(theme.textPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(theme.btnSecondaryBg)
                        .cornerRadius(10)
                }
            }

            Button(action: { HapticManager.shared.buttonTap(); uiStore.flipBoard() }) {
                Label("Flip Board", systemImage: "arrow.up.arrow.down")
                    .font(.subheadline)
                    .foregroundColor(theme.textPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(theme.btnSecondaryBg)
                    .cornerRadius(10)
            }
        }
    }

    // MARK: - Game Over Overlay

    private var gameOverOverlay: some View {
        ZStack {
            Color.black.opacity(0.6).ignoresSafeArea()
            VStack(spacing: 20) {
                Text(gameOverTitle)
                    .font(.system(size: 36, weight: .black))
                    .foregroundColor(gameOverColor)

                if let reason = gameStore.drawReason {
                    Text(reason)
                        .font(.subheadline)
                        .foregroundColor(theme.textSecondary)
                }

                HStack(spacing: 12) {
                    Button(action: { gameStore.restart() }) {
                        Text("Play Again")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .background(theme.accent)
                            .cornerRadius(12)
                    }
                    Button(action: { showNewGameSheet = true }) {
                        Text("New Game")
                            .font(.headline)
                            .foregroundColor(theme.textPrimary)
                            .padding()
                            .background(theme.btnSecondaryBg)
                            .cornerRadius(12)
                    }
                }
            }
            .padding(32)
            .background(theme.bgPanel)
            .cornerRadius(24)
            .shadow(color: theme.shadow, radius: 20)
        }
        .transition(.opacity)
        .animation(.easeOut(duration: 0.3), value: gameStore.status)
        .onAppear {
            // Distinguish win vs loss based on player color (spec 6.2)
            if gameStore.status == "white_wins" || gameStore.status == "black_wins" {
                let playerWon = gameStore.status == "white_wins"
                    ? gameStore.playerColor == "white"
                    : gameStore.playerColor == "black"
                if gameStore.gameMode == "pvp" || playerWon {
                    HapticManager.shared.gameWon()
                } else {
                    HapticManager.shared.gameLost()
                }
            }
        }
    }

    private var gameOverTitle: String {
        switch gameStore.status {
        case "white_wins": return "White Wins!"
        case "black_wins": return "Black Wins!"
        case "draw": return "Draw"
        default: return ""
        }
    }

    private var gameOverColor: Color {
        switch gameStore.status {
        case "white_wins": return theme.accent
        case "black_wins": return theme.captureIndicator
        case "draw": return theme.textSecondary
        default: return theme.textPrimary
        }
    }
}

// MARK: - New Game Sheet

struct NewGameSheet: View {
    @Binding var isPresented: Bool
    @EnvironmentObject var gameStore: GameStore
    @Environment(\.theme) var theme

    @State private var selectedMode: String = "bot"
    @State private var selectedDifficulty: String = "medium"
    @State private var selectedColor: String = "white"

    var body: some View {
        NavigationStack {
            Form {
                Section("Game Mode") {
                    Picker("Mode", selection: $selectedMode) {
                        Text("vs AI").tag("bot")
                        Text("Local PvP").tag("pvp")
                    }
                    .pickerStyle(.segmented)
                }

                if selectedMode == "bot" {
                    Section("Difficulty") {
                        Picker("Difficulty", selection: $selectedDifficulty) {
                            Text("Easy").tag("easy")
                            Text("Medium").tag("medium")
                            Text("Hard").tag("hard")
                        }
                        .pickerStyle(.segmented)
                    }

                    Section("Play As") {
                        Picker("Color", selection: $selectedColor) {
                            Text("White").tag("white")
                            Text("Black").tag("black")
                            Text("Random").tag("random")
                        }
                        .pickerStyle(.segmented)
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(theme.bgPrimary)
            .navigationTitle("New Game")
            .navigationBarItems(
                leading: Button("Cancel") { isPresented = false },
                trailing: Button("Start") {
                    let color = selectedColor == "random"
                        ? (Bool.random() ? "white" : "black")
                        : selectedColor
                    gameStore.newGame(mode: selectedMode, difficulty: selectedDifficulty, playerColor: color)
                    isPresented = false
                }
                .fontWeight(.bold)
                .foregroundColor(theme.accent)
            )
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }
}

#Preview {
    NavigationStack { PlayView() }
        .environmentObject(GameStore())
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
