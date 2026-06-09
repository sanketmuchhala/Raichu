// MatchmakingStore.swift
// Raichu
// ELO-based ranked matchmaking queue with 2-second polling.

import SwiftUI
import Combine

@MainActor
final class MatchmakingStore: ObservableObject {
    @Published var status: String = "idle"   // idle | queued | matched
    @Published var loading: Bool = false
    @Published var waitSeconds: Int = 0
    @Published var queueCount: Int = 0
    @Published var matchedGameId: String? = nil
    @Published var error: String? = nil

    private var idleRetries: Int = 0
    private var pollTask: Task<Void, Never>? = nil
    private var accessToken: String? = nil

    func joinQueue(accessToken: String) async {
        self.accessToken = accessToken
        loading = true
        error = nil
        defer { loading = false }

        do {
            _ = try await matchmakingAPI.joinQueue(accessToken: accessToken)
            status = "queued"
            idleRetries = 0
            startPolling()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func leaveQueue() async {
        pollTask?.cancel()
        pollTask = nil
        guard let token = accessToken else { return }

        do {
            _ = try await matchmakingAPI.leaveQueue(accessToken: token)
        } catch { /* ignore leave errors */ }

        reset()
    }

    private func startPolling() {
        pollTask?.cancel()
        pollTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
                guard !Task.isCancelled else { break }
                await self?.pollStatus()
                if self?.status != "queued" { break }
            }
        }
    }

    func pollStatus() async {
        guard let token = accessToken else { return }

        do {
            let response = try await matchmakingAPI.status(accessToken: token)
            switch response.status {
            case "queued":
                status = "queued"
                waitSeconds = response.waitSeconds ?? 0
                queueCount = response.queueCount ?? 0
                idleRetries = 0
            case "matched":
                status = "matched"
                matchedGameId = response.gameId
                pollTask?.cancel()
            case "idle":
                idleRetries += 1
                // 3 consecutive idle responses → we're actually idle (race condition guard)
                if idleRetries >= 3 {
                    status = "idle"
                    pollTask?.cancel()
                }
            default:
                break
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func reset() {
        pollTask?.cancel()
        pollTask = nil
        status = "idle"
        loading = false
        waitSeconds = 0
        queueCount = 0
        matchedGameId = nil
        error = nil
        idleRetries = 0
        accessToken = nil
    }
}
