// APIClient.swift
// Raichu
// Typed REST API client that attaches JWT auth to every request.

import Foundation

// MARK: - Errors

enum APIClientError: LocalizedError {
    case serverError(String)
    case unauthorized
    case notFound
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .serverError(let msg): return msg
        case .unauthorized: return "Please sign in to continue."
        case .notFound: return "Resource not found."
        case .networkError(let e): return e.localizedDescription
        }
    }
}

// MARK: - Private error body decoder

private struct APIErrorBody: Decodable {
    let error: String
}

// MARK: - APIClient

final class APIClient {
    static let shared = APIClient()
    private init() {}

    private let baseURL = AppConfig.apiBaseURL

    // Generic fetch with JWT auth. T must be Decodable.
    func fetch<T: Decodable>(
        path: String,
        method: String = "GET",
        body: (any Encodable)? = nil,
        accessToken: String? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIClientError.serverError("Invalid URL: \(baseURL)\(path)")
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIClientError.networkError(error)
        }

        guard let http = response as? HTTPURLResponse else {
            throw APIClientError.serverError("Invalid response")
        }

        switch http.statusCode {
        case 200...299:
            do {
                return try JSONDecoder().decode(T.self, from: data)
            } catch {
                throw APIClientError.serverError("Decode error: \(error.localizedDescription)")
            }
        case 401:
            throw APIClientError.unauthorized
        case 404:
            throw APIClientError.notFound
        default:
            let body = try? JSONDecoder().decode(APIErrorBody.self, from: data)
            throw APIClientError.serverError(body?.error ?? "HTTP \(http.statusCode)")
        }
    }
}

// MARK: - Games API

struct GamesAPI {
    private let client = APIClient.shared

    func create(gameType: String, difficulty: String? = nil, playAs: String? = nil, accessToken: String) async throws -> OnlineGameDetail {
        let body = CreateGameRequest(gameType: gameType, difficulty: difficulty, playAs: playAs)
        return try await client.fetch(path: "/games", method: "POST", body: body, accessToken: accessToken)
    }

    func get(id: String, accessToken: String) async throws -> OnlineGameDetail {
        try await client.fetch(path: "/games/\(id)", accessToken: accessToken)
    }

    func myGames(accessToken: String) async throws -> [OnlineGameDetail] {
        try await client.fetch(path: "/games/my", accessToken: accessToken)
    }

    func getMoves(id: String, accessToken: String) async throws -> [GameMove] {
        try await client.fetch(path: "/games/\(id)/moves", accessToken: accessToken)
    }

    func submitMove(_ move: Move, gameId: String, accessToken: String) async throws -> OnlineGameDetail {
        let body = SubmitMoveRequest(
            from: move.from,
            to: move.to,
            piece: move.piece,
            captured: move.captured,
            promotion: move.promotion
        )
        return try await client.fetch(path: "/games/\(gameId)/move", method: "POST", body: body, accessToken: accessToken)
    }

    func resign(gameId: String, accessToken: String) async throws -> ResignResponse {
        try await client.fetch(path: "/games/\(gameId)/resign", method: "POST", accessToken: accessToken)
    }

    func joinByCode(_ code: String, accessToken: String) async throws -> OnlineGameDetail {
        try await client.fetch(path: "/games/join/\(code)", method: "POST", accessToken: accessToken)
    }
}

// MARK: - Matchmaking API

struct MatchmakingAPI {
    private let client = APIClient.shared

    struct QueuedResponse: Codable {
        let status: String
        let queuedAt: String?
    }

    struct RemovedResponse: Codable {
        let status: String
    }

    func joinQueue(accessToken: String) async throws -> QueuedResponse {
        try await client.fetch(path: "/matchmaking/queue", method: "POST", accessToken: accessToken)
    }

    func leaveQueue(accessToken: String) async throws -> RemovedResponse {
        try await client.fetch(path: "/matchmaking/queue", method: "DELETE", accessToken: accessToken)
    }

    func status(accessToken: String) async throws -> MatchmakingStatusResponse {
        try await client.fetch(path: "/matchmaking/status", accessToken: accessToken)
    }
}

// Shared API namespaces
let gamesAPI = GamesAPI()
let matchmakingAPI = MatchmakingAPI()
