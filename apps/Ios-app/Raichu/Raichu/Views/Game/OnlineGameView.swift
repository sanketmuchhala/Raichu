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

    private var myColor: String { onlineGameStore.myColor ?? "white" }
    private var boardFlipped: Bool { myColor == "black" }

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

            // Game over overlay
            if onlineGameStore.status != "playing" && onlineGameStore.status != "waiting" {
                gameOverOverlay
            }
        }
        .navigationBarHidden(true)
        .task {
            await onlineGameStore.loadGame(gameId)
            onlineGameStore.subscribeRealtime(gameId: gameId)
        }
        .onDisappear {
            onlineGameStore.unsubscribe()
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
                player: topPlayer,
                isCurrentTurn: onlineGameStore.currentPlayer == topColor,
                capturedPieces: topCaptured
            )

            // Board
            BoardView(
                board: onlineGameStore.board,
                selectedPiece: onlineGameStore.selectedPiece,
                legalMoves: onlineGameStore.legalMoves,
                lastMove: onlineGameStore.lastMove,
                flipped: boardFlipped,
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
            .padding(8)

            // Bottom player
            PlayerBar(
                player: bottomPlayer,
                isCurrentTurn: onlineGameStore.currentPlayer == bottomColor,
                capturedPieces: bottomCaptured
            )
        }
    }

    // MARK: - Player Helpers

    private var topColor: String { boardFlipped ? "white" : "black" }
    private var bottomColor: String { boardFlipped ? "black" : "white" }

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
        onlineGameStore.status == "playing" && onlineGameStore.currentPlayer == myColor && !onlineGameStore.isThinking
    }

    // MARK: - Game Over Overlay

    private var gameOverOverlay: some View {
        ZStack {
            Color.black.opacity(0.6).ignoresSafeArea()
            VStack(spacing: 20) {
                Text(gameOverTitle)
                    .font(.system(size: 36, weight: .black))
                    .foregroundColor(gameOverColor)

                HStack(spacing: 12) {
                    Button(action: { dismiss() }) {
                        Text("Back to Lobby")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .background(theme.accent)
                            .cornerRadius(12)
                    }
                }
            }
            .padding(32)
            .background(theme.bgPanel)
            .cornerRadius(24)
        }
        .transition(.opacity)
        .animation(.easeOut(duration: 0.3), value: onlineGameStore.status)
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

    private var gameOverColor: Color {
        let winnerId = onlineGameStore.game?.winner_id
        let myId = authStore.userId
        if winnerId == myId { return theme.accent }
        return theme.captureIndicator
    }
}

// MARK: - Player Bar

struct PlayerBar: View {
    @Environment(\.theme) var theme
    let player: Profile?
    let isCurrentTurn: Bool
    let capturedPieces: [String]

    @State private var glowOpacity: Double = 1.0

    var body: some View {
        HStack(spacing: 10) {
            // Avatar circle
            ZStack {
                Circle()
                    .fill(theme.accent.opacity(0.2))
                    .frame(width: 36, height: 36)
                Text(String((player?.username ?? "?").prefix(1)).uppercased())
                    .font(.headline.bold())
                    .foregroundColor(theme.accent)
            }
            .overlay(
                Circle()
                    .stroke(theme.accent, lineWidth: isCurrentTurn ? 2 : 0)
                    .opacity(isCurrentTurn ? glowOpacity : 0)
            )
            .onAppear {
                if isCurrentTurn {
                    withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                        glowOpacity = 0.3
                    }
                }
            }
            .onChange(of: isCurrentTurn) { _, newValue in
                if newValue {
                    glowOpacity = 1.0
                    withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                        glowOpacity = 0.3
                    }
                } else {
                    glowOpacity = 1.0
                }
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(player?.username ?? "Opponent")
                    .font(.subheadline.bold())
                    .foregroundColor(theme.textPrimary)
                Text("\(player?.elo_rating ?? 1200) ELO")
                    .font(.caption)
                    .foregroundColor(theme.textSecondary)
            }

            Spacer()
            CapturedPiecesRow(pieces: capturedPieces)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(isCurrentTurn ? theme.accent.opacity(0.08) : theme.bgPanel)
    }
}

#Preview {
    OnlineGameView(gameId: "preview-id")
        .environmentObject(OnlineGameStore())
        .environmentObject(AuthStore())
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
