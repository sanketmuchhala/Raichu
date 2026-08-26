// GameStore.swift
// Raichu
// Offline game state: PvP and bot games using the local JS engine.

import SwiftUI
import Combine

@MainActor
final class GameStore: ObservableObject {
    // Board & game state
    @Published var board: [[String]] = []
    @Published var currentPlayer: String = "white"
    @Published var status: String = "playing"
    @Published var moveHistory: [Move] = []
    @Published var boardHistory: [[[String]]] = []
    @Published var lastMove: Move? = nil
    @Published var isThinking: Bool = false

    // Selection UI state
    @Published var selectedPiece: Position? = nil
    @Published var legalMoves: [Move] = []

    // Draw detection
    @Published var positionCounts: [String: Int] = [:]
    @Published var halfMovesSinceProgress: Int = 0
    @Published var drawReason: String? = nil

    // Config
    @Published var gameMode: String = "bot"        // pvp | bot
    @Published var difficulty: String = "easy"     // easy | medium | hard
    @Published var playerColor: String = "white"   // which color the human plays (bot mode)

    init() {
        board = RaichuEngine.shared.createInitialBoard()
    }

    // MARK: - Selection

    func selectPiece(at pos: Position) {
        let cell = board[pos.row][pos.col]

        // If tapping a legal move destination
        if let selected = selectedPiece,
           let move = legalMoves.first(where: { $0.to == pos }) {
            _ = selected  // consumed
            makeMove(move)
            return
        }

        // Tapping own piece
        if cell.pieceColor?.rawValue == currentPlayer {
            selectedPiece = pos
            legalMoves = RaichuEngine.shared.generateMovesForPiece(
                board: board, row: pos.row, col: pos.col
            )
        } else {
            clearSelection()
        }
    }

    func clearSelection() {
        selectedPiece = nil
        legalMoves = []
    }

    // MARK: - Move Execution

    func makeMove(_ move: Move) {
        let newBoard = RaichuEngine.shared.applyMove(board: board, move: move)
        let nextPlayer = currentPlayer == "white" ? "black" : "white"

        // Draw detection: half-move clock
        let isCapture = move.captured != nil
        let isPromotion = move.promotion != nil
        if isCapture || isPromotion {
            halfMovesSinceProgress = 0
        } else {
            halfMovesSinceProgress += 1
        }

        // Threefold repetition tracking
        let key = RaichuEngine.shared.encodeBoard(newBoard) + ":\(nextPlayer)"
        let count = (positionCounts[key] ?? 0) + 1
        positionCounts[key] = count

        // Update board history for replay
        boardHistory.append(board)
        moveHistory.append(move)

        // Apply state
        board = newBoard
        currentPlayer = nextPlayer
        lastMove = move
        clearSelection()

        // Check game status
        let gameStatus = RaichuEngine.shared.getGameStatus(board: newBoard, nextPlayer: nextPlayer)

        if count >= 3 {
            status = "draw"
            drawReason = "Threefold repetition"
        } else if halfMovesSinceProgress >= 100 {
            status = "draw"
            drawReason = "50-move rule"
        } else {
            status = gameStatus
        }

        // Trigger bot if applicable
        if gameMode == "bot" && status == "playing" && currentPlayer != playerColor {
            Task {
                try? await Task.sleep(nanoseconds: 300_000_000) // 0.3s delay for UI
                await requestBotMove()
            }
        }
    }

    // MARK: - Bot

    func requestBotMove() async {
        guard status == "playing", gameMode == "bot", currentPlayer != playerColor else { return }
        isThinking = true
        defer { isThinking = false }

        // Yield for UI update
        try? await Task.sleep(nanoseconds: 50_000_000) // 50ms

        let botMove = RaichuEngine.shared.findBestMove(
            board: board, player: currentPlayer, difficulty: difficulty
        )

        if let move = botMove {
            makeMove(move)
        } else if let randomMove = RaichuEngine.shared.generateAllMoves(board: board, player: currentPlayer).randomElement() {
            makeMove(randomMove)
        }
    }

    // MARK: - Game Control

    func newGame(mode: String = "bot", difficulty: String = "easy", playerColor: String = "white") {
        self.gameMode = mode
        self.difficulty = difficulty
        self.playerColor = playerColor

        board = RaichuEngine.shared.createInitialBoard()
        currentPlayer = "white"
        status = "playing"
        moveHistory = []
        boardHistory = []
        lastMove = nil
        isThinking = false
        positionCounts = [:]
        halfMovesSinceProgress = 0
        drawReason = nil
        clearSelection()

        // If bot game and bot goes first
        if mode == "bot" && playerColor == "black" {
            Task {
                try? await Task.sleep(nanoseconds: 500_000_000)
                await requestBotMove()
            }
        }
    }

    func restart() {
        newGame(mode: gameMode, difficulty: difficulty, playerColor: playerColor)
    }

    // MARK: - Captured Pieces

    var capturedByWhite: [String] {
        moveHistory.compactMap { $0.captured?.piece }.filter { $0.isBlackPiece }
    }

    var capturedByBlack: [String] {
        moveHistory.compactMap { $0.captured?.piece }.filter { $0.isWhitePiece }
    }
}
