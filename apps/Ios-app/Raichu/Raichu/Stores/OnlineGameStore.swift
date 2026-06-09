// OnlineGameStore.swift
// Raichu
// Multiplayer game state with Supabase Realtime + REST API.

import SwiftUI
import Combine

@MainActor
final class OnlineGameStore: ObservableObject {
    @Published var game: OnlineGameDetail? = nil
    @Published var board: [[String]] = []
    @Published var currentPlayer: String = "white"
    @Published var status: String = "playing"
    @Published var moves: [GameMove] = []
    @Published var lastMove: Move? = nil
    @Published var myColor: String? = nil
    @Published var loading: Bool = false
    @Published var error: String? = nil
    @Published var selectedPiece: Position? = nil
    @Published var legalMoves: [Move] = []
    @Published var isThinking: Bool = false

    // Draw detection
    private var positionCounts: [String: Int] = [:]
    private var halfMovesSinceProgress: Int = 0
    @Published var drawReason: String? = nil

    // Polling fallback task
    private var pollTask: Task<Void, Never>? = nil

    // MARK: - Load Game

    func loadGame(_ id: String, accessToken: String, userId: String) async {
        loading = true
        error = nil
        defer { loading = false }

        do {
            let gameDetail = try await gamesAPI.get(id: id, accessToken: accessToken)
            applyGameDetail(gameDetail, userId: userId)

            let gameMoves = try await gamesAPI.getMoves(id: id, accessToken: accessToken)
            moves = gameMoves
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func applyGameDetail(_ g: OnlineGameDetail, userId: String) {
        game = g
        board = RaichuEngine.shared.decodeBoard(g.board_state)
        currentPlayer = g.current_player
        status = g.status

        if g.white_player_id == userId {
            myColor = "white"
        } else if g.black_player_id == userId {
            myColor = "black"
        } else {
            myColor = nil
        }
    }

    // MARK: - Selection

    func selectPiece(at pos: Position) {
        guard let myColor, currentPlayer == myColor else { return }

        let cell = board[pos.row][pos.col]

        // Tapping a legal destination
        if selectedPiece != nil,
           let move = legalMoves.first(where: { $0.to == pos }) {
            Task { await submitMove(move) }
            return
        }

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

    // MARK: - Submit Move

    func submitMove(_ move: Move) async {
        guard let gameId = game?.id,
              let token = currentAccessToken() else { return }
        isThinking = true
        error = nil
        defer { isThinking = false }
        clearSelection()

        do {
            let updated = try await gamesAPI.submitMove(move, gameId: gameId, accessToken: token)
            let userId = currentUserId() ?? ""
            applyGameDetail(updated, userId: userId)
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Resign

    func resign() async {
        guard let gameId = game?.id,
              let token = currentAccessToken() else { return }

        do {
            _ = try await gamesAPI.resign(gameId: gameId, accessToken: token)
            status = "abandoned"
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Realtime (stub — wire up when Supabase SDK is added)

    func subscribeRealtime(gameId: String) {
        // TODO: wire supabase realtime channel
        // supabase.realtime.channel("game-\(gameId)")
        //   .on(.postgres, table: "games", filter: "id=eq.\(gameId)") { handleGameUpdate }
        //   .on(.postgres, table: "moves",  filter: "game_id=eq.\(gameId)") { handleNewMove }
        //   .subscribe()
        startPollingFallback(gameId: gameId)
    }

    func unsubscribe() {
        pollTask?.cancel()
        pollTask = nil
        // TODO: supabase.realtime.removeChannel(realtimeChannel)
    }

    // MARK: - Polling Fallback (3s)

    private func startPollingFallback(gameId: String) {
        pollTask?.cancel()
        pollTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 3_000_000_000)
                guard !Task.isCancelled else { break }
                await self?.pollGame(gameId: gameId)
                if let s = self?.status, s != "playing" && s != "waiting" { break }
            }
        }
    }

    private func pollGame(gameId: String) async {
        guard let token = currentAccessToken() else { return }
        do {
            let g = try await gamesAPI.get(id: gameId, accessToken: token)
            let userId = currentUserId() ?? ""
            if g.board_state != game?.board_state || g.status != game?.status {
                applyGameDetail(g, userId: userId)
            }
        } catch { /* silent poll failure */ }
    }

    // MARK: - Realtime Handlers

    func handleGameUpdate(_ g: OnlineGameDetail) {
        let userId = currentUserId() ?? ""
        applyGameDetail(g, userId: userId)
    }

    func handleNewMove(_ gameMove: GameMove) {
        moves.append(gameMove)
        board = RaichuEngine.shared.decodeBoard(gameMove.board_after)
        lastMove = gameMove.asMove
        currentPlayer = currentPlayer == "white" ? "black" : "white"

        // Draw detection
        let isCapture = gameMove.captured_piece != nil
        let isPromotion = gameMove.promotion != nil
        if isCapture || isPromotion {
            halfMovesSinceProgress = 0
        } else {
            halfMovesSinceProgress += 1
        }

        let key = gameMove.board_after + ":\(currentPlayer)"
        let count = (positionCounts[key] ?? 0) + 1
        positionCounts[key] = count

        if count >= 3 {
            status = "draw"
            drawReason = "Threefold repetition"
        } else if halfMovesSinceProgress >= 100 {
            status = "draw"
            drawReason = "50-move rule"
        }
    }

    // MARK: - Reset

    func reset() {
        unsubscribe()
        game = nil
        board = []
        currentPlayer = "white"
        status = "playing"
        moves = []
        lastMove = nil
        myColor = nil
        loading = false
        error = nil
        positionCounts = [:]
        halfMovesSinceProgress = 0
        drawReason = nil
        clearSelection()
    }

    // MARK: - Helpers (will come from AuthStore via environment)

    private func currentAccessToken() -> String? {
        // Accessed by passing token in when calling actions
        nil
    }

    private func currentUserId() -> String? {
        nil
    }

    var capturedByWhite: [String] {
        moves.compactMap { $0.captured_piece }.filter { $0.isBlackPiece }
    }

    var capturedByBlack: [String] {
        moves.compactMap { $0.captured_piece }.filter { $0.isWhitePiece }
    }
}
