// EngineTypes.swift
// Raichu
// Swift type definitions mirroring the TypeScript shared-types package.

import Foundation

// MARK: - Core Game Types

struct Position: Codable, Hashable, Equatable {
    let row: Int
    let col: Int
}

struct CapturedInfo: Codable, Equatable {
    let position: Position
    let piece: String
}

struct Move: Codable, Identifiable, Equatable {
    var id: String { "\(from.row)\(from.col)\(to.row)\(to.col)\(piece)" }
    let from: Position
    let to: Position
    let piece: String
    let captured: CapturedInfo?
    let promotion: String?
}

// MARK: - Enums

enum Player: String, Codable {
    case white, black

    var opposite: Player {
        self == .white ? .black : .white
    }
}

enum GameStatus: String, Codable {
    case playing
    case white_wins
    case black_wins
    case draw
}

enum GameMode: String, Codable {
    case pvp, bot, online
}

enum Difficulty: String, Codable, CaseIterable {
    case easy, medium, hard

    var displayName: String {
        rawValue.capitalized
    }
}

enum GameType: String, Codable, CaseIterable {
    case friendly, ranked, bot

    var displayName: String {
        rawValue.capitalized
    }
}

enum OnlineGameStatus: String, Codable {
    case waiting, playing, white_wins, black_wins, abandoned
}

enum PieceType: String, Codable {
    case pichu, pikachu, raichu
}

// MARK: - Database Models

struct Profile: Codable, Identifiable {
    let id: String
    let username: String
    let display_name: String?
    let avatar_url: String?
    let elo_rating: Int
    let games_played: Int
    let games_won: Int
    let created_at: String
    let updated_at: String

    var displayOrUsername: String {
        display_name ?? username
    }
}

struct OnlineGame: Codable, Identifiable {
    let id: String
    let white_player_id: String?
    let black_player_id: String?
    let status: String
    let board_state: String
    let current_player: String
    let game_type: String
    let difficulty: String?
    let invite_code: String?
    let move_count: Int
    let winner_id: String?
    let winner_elo_delta: Int?
    let loser_elo_delta: Int?
    let created_at: String
    let updated_at: String
    let finished_at: String?
}

struct OnlineGameDetail: Codable, Identifiable {
    let id: String
    let white_player_id: String?
    let black_player_id: String?
    let status: String
    let board_state: String
    let current_player: String
    let game_type: String
    let difficulty: String?
    let invite_code: String?
    let move_count: Int
    let winner_id: String?
    let winner_elo_delta: Int?
    let loser_elo_delta: Int?
    let created_at: String
    let updated_at: String
    let finished_at: String?
    let white_player: Profile?
    let black_player: Profile?
}

extension Move {
    /// Converts a persisted online move into the engine's in-memory shape.
    init(_ gameMove: GameMove) {
        let captured: CapturedInfo?
        if let piece = gameMove.captured_piece,
           let row = gameMove.captured_row,
           let col = gameMove.captured_col {
            captured = CapturedInfo(position: Position(row: row, col: col), piece: piece)
        } else {
            captured = nil
        }
        self.init(
            from: Position(row: gameMove.from_row, col: gameMove.from_col),
            to: Position(row: gameMove.to_row, col: gameMove.to_col),
            piece: gameMove.piece,
            captured: captured,
            promotion: gameMove.promotion
        )
    }
}

struct GameMove: Codable, Identifiable {
    let id: String
    let game_id: String
    let move_number: Int
    let player: String
    let from_row: Int
    let from_col: Int
    let to_row: Int
    let to_col: Int
    let piece: String
    let captured_piece: String?
    let captured_row: Int?
    let captured_col: Int?
    let promotion: String?
    let board_after: String
    let created_at: String

    var asMove: Move {
        Move(
            from: Position(row: from_row, col: from_col),
            to: Position(row: to_row, col: to_col),
            piece: piece,
            captured: captured_piece.map { cp in
                CapturedInfo(
                    position: Position(row: captured_row ?? 0, col: captured_col ?? 0),
                    piece: cp
                )
            },
            promotion: promotion
        )
    }
}

// MARK: - API Request/Response Models

struct CreateGameRequest: Codable {
    let gameType: String
    let difficulty: String?
    let playAs: String?
}

struct SubmitMoveRequest: Codable {
    let from: Position
    let to: Position
    let piece: String
    let captured: CapturedInfo?
    let promotion: String?
}

struct ResignResponse: Codable {
    let winner_id: String
}

struct MatchmakingStatusResponse: Codable {
    let status: String
    let waitSeconds: Int?
    let queueCount: Int?
    let gameId: String?
}

// MARK: - Piece Helper

extension String {
    var isWhitePiece: Bool {
        ["w", "W", "@"].contains(self)
    }

    var isBlackPiece: Bool {
        ["b", "B", "$"].contains(self)
    }

    var isPiece: Bool {
        isWhitePiece || isBlackPiece
    }

    var pieceColor: Player? {
        if isWhitePiece { return .white }
        if isBlackPiece { return .black }
        return nil
    }
}
