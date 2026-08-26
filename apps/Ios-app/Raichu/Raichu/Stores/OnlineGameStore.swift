// OnlineGameStore.swift
// Raichu
// Multiplayer game state with Supabase Realtime + REST API.

import SwiftUI
import Combine
import Supabase

@MainActor
final class OnlineGameStore: ObservableObject {
    @Published var game: OnlineGameDetail? = nil
    @Published var board: [[String]] = []
    @Published var currentPlayer: String = "white"
    @Published var status: String = "playing"
    @Published var moves: [GameMove] = [] {
        didSet { rebuildBoardHistory() }
    }
    /// Board after each ply, index 0 being the starting position. Derived from
    /// each move's `board_after`, so replay needs no re-simulation.
    @Published private(set) var boardHistory: [[[String]]] = []
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

    // Realtime channel
    private var realtimeChannel: RealtimeChannelV2? = nil

    // MARK: - Auth helpers (live — read from supabase SDK directly)

    private func currentAccessToken() async -> String? {
        try? await supabase.auth.session.accessToken
    }

    private func currentUserId() async -> String? {
        try? await supabase.auth.session.user.id.uuidString
    }

    // MARK: - Load Game

    func loadGame(_ id: String) async {
        loading = true
        error = nil
        defer { loading = false }

        guard let token = await currentAccessToken(),
              let userId = await currentUserId() else {
            error = "Not signed in."
            return
        }

        do {
            let gameDetail = try await gamesAPI.get(id: id, accessToken: token)
            applyGameDetail(gameDetail, userId: userId)

            let gameMoves = try await gamesAPI.getMoves(id: id, accessToken: token)
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
        guard let gameId = game?.id else { return }
        guard let token = await currentAccessToken(),
              let userId = await currentUserId() else { return }
        isThinking = true
        error = nil
        defer { isThinking = false }
        clearSelection()

        do {
            let updated = try await gamesAPI.submitMove(move, gameId: gameId, accessToken: token)
            applyGameDetail(updated, userId: userId)
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Resign

    func resign() async {
        guard let gameId = game?.id,
              let token = await currentAccessToken() else { return }

        do {
            _ = try await gamesAPI.resign(gameId: gameId, accessToken: token)
            status = "abandoned"
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: - Realtime

    func subscribeRealtime(gameId: String) {
        // Cancel any existing channel first
        let oldChannel = realtimeChannel
        realtimeChannel = nil
        if let ch = oldChannel {
            Task { await supabase.realtimeV2.removeChannel(ch) }
        }

        let channel = supabase.realtimeV2.channel("game-\(gameId)")

        // games UPDATE — board_state / status / current_player changes
        _ = channel.onPostgresChange(
            UpdateAction.self,
            schema: "public",
            table: "games",
            filter: "id=eq.\(gameId)"
        ) { [weak self] _ in
            guard let self else { return }
            Task { await self.refreshGameDetail(gameId: gameId) }
        }

        // moves INSERT — new move records
        _ = channel.onPostgresChange(
            InsertAction.self,
            schema: "public",
            table: "moves",
            filter: "game_id=eq.\(gameId)"
        ) { [weak self] _ in
            guard let self else { return }
            Task { await self.refreshGameDetail(gameId: gameId) }
        }

        realtimeChannel = channel

        Task { try? await channel.subscribeWithError() }

        // Also run polling fallback in case Realtime drops
        startPollingFallback(gameId: gameId)
    }

    func unsubscribe() {
        pollTask?.cancel()
        pollTask = nil
        let ch = realtimeChannel
        realtimeChannel = nil
        if let ch {
            Task { await supabase.realtimeV2.removeChannel(ch) }
        }
    }

    // MARK: - Polling Fallback (3s)

    private func startPollingFallback(gameId: String) {
        pollTask?.cancel()
        pollTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 3_000_000_000)
                guard !Task.isCancelled else { break }
                await self?.refreshGameDetail(gameId: gameId)
                if let s = self?.status, s != "playing" && s != "waiting" { break }
            }
        }
    }

    private func refreshGameDetail(gameId: String) async {
        guard let token = await currentAccessToken(),
              let userId = await currentUserId() else { return }
        do {
            let g = try await gamesAPI.get(id: gameId, accessToken: token)
            applyGameDetail(g, userId: userId)
            // Without this the move list and both captured-piece rows keep
            // showing whatever loadGame fetched at open time.
            if let refreshed = try? await gamesAPI.getMoves(id: gameId, accessToken: token) {
                moves = refreshed
            }
        } catch { /* silent */ }
    }

    // MARK: - Realtime Handlers (called directly when needed)

    func handleGameUpdate(_ g: OnlineGameDetail) {
        Task {
            let userId = await currentUserId() ?? ""
            applyGameDetail(g, userId: userId)
        }
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

    private func rebuildBoardHistory() {
        var history: [[[String]]] = [RaichuEngine.shared.createInitialBoard()]
        history.append(contentsOf: moves.map { RaichuEngine.shared.decodeBoard($0.board_after) })
        boardHistory = history
    }

    /// Move list in engine form, for the shared move-history panel.
    var moveList: [Move] { moves.map(Move.init) }

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

    var capturedByWhite: [String] {
        moves.compactMap { $0.captured_piece }.filter { $0.isBlackPiece }
    }

    var capturedByBlack: [String] {
        moves.compactMap { $0.captured_piece }.filter { $0.isWhitePiece }
    }
}
