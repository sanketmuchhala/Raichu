// LobbyView.swift
// Raichu
// Online game lobby: quick match, create game, join by code, active games.

import SwiftUI

struct LobbyView: View {
    @EnvironmentObject var authStore: AuthStore
    @EnvironmentObject var matchmakingStore: MatchmakingStore
    @Environment(\.theme) var theme

    @State private var joinCode = ""
    @State private var selectedGameType = "ranked"
    @State private var activeGames: [OnlineGameDetail] = []
    @State private var loadingGames = false
    @State private var navigateToGameId: String? = nil

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            if !authStore.isAuthenticated {
                requireAuthView
            } else {
                ScrollView {
                    VStack(spacing: 20) {
                        quickMatchSection
                        createGameSection
                        joinByCodeSection
                        activeGamesSection
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Online")
        .toolbarBackground(theme.bgPanel, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .navigationDestination(item: $navigateToGameId) { id in
            OnlineGameView(gameId: id)
        }
        .task {
            if authStore.isAuthenticated { await loadActiveGames() }
        }
        .onChange(of: matchmakingStore.matchedGameId) { _, id in
            if let id {
                navigateToGameId = id
                matchmakingStore.reset()
            }
        }
    }

    // MARK: - Require Auth

    private var requireAuthView: some View {
        VStack(spacing: 20) {
            Image(systemName: "network")
                .font(.system(size: 60))
                .foregroundColor(theme.textSecondary)
            Text("Sign in to play online")
                .font(.title3.bold())
                .foregroundColor(theme.textPrimary)
            Text("Create an account to play ranked games, track your ELO, and compete with players worldwide.")
                .font(.subheadline)
                .foregroundColor(theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(32)
    }

    // MARK: - Quick Match

    private var quickMatchSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Quick Match", systemImage: "bolt.fill")
                .font(.headline)
                .foregroundColor(theme.textPrimary)

            if matchmakingStore.status == "queued" {
                HStack(spacing: 12) {
                    ProgressView().tint(theme.accent)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Finding opponent...")
                            .font(.subheadline.bold())
                            .foregroundColor(theme.textPrimary)
                        Text("Wait: \(matchmakingStore.waitSeconds)s · \(matchmakingStore.queueCount) in queue")
                            .font(.caption)
                            .foregroundColor(theme.textSecondary)
                    }
                    Spacer()
                    Button("Cancel") {
                        Task { await matchmakingStore.leaveQueue() }
                    }
                    .foregroundColor(theme.captureIndicator)
                }
                .padding()
                .background(theme.bgPanel)
                .cornerRadius(12)
            } else {
                Button(action: {
                    guard let token = authStore.accessToken else { return }
                    HapticManager.shared.buttonTap()
                    Task { await matchmakingStore.joinQueue(accessToken: token) }
                }) {
                    HStack {
                        Image(systemName: "magnifyingglass")
                        Text("Find Ranked Match")
                            .fontWeight(.semibold)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(theme.accent)
                    .cornerRadius(12)
                }
            }
        }
        .panelStyle(theme: theme)
    }

    // MARK: - Create Game

    private var createGameSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Create Game", systemImage: "plus.circle.fill")
                .font(.headline)
                .foregroundColor(theme.textPrimary)

            Picker("Game Type", selection: $selectedGameType) {
                Text("Ranked").tag("ranked")
                Text("Friendly").tag("friendly")
            }
            .pickerStyle(.segmented)

            Button(action: {
                guard let token = authStore.accessToken else { return }
                HapticManager.shared.buttonTap()
                Task {
                    do {
                        let game = try await gamesAPI.create(
                            gameType: selectedGameType,
                            difficulty: nil,
                            playAs: "random",
                            accessToken: token
                        )
                        navigateToGameId = game.id
                    } catch {}
                }
            }) {
                Text("Create \(selectedGameType.capitalized) Game")
                    .font(.subheadline.bold())
                    .foregroundColor(theme.textPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(theme.btnSecondaryBg)
                    .cornerRadius(10)
            }
        }
        .panelStyle(theme: theme)
    }

    // MARK: - Join by Code

    private var joinByCodeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Join by Code", systemImage: "link")
                .font(.headline)
                .foregroundColor(theme.textPrimary)

            HStack(spacing: 8) {
                TextField("Enter 6-char code", text: $joinCode)
                    .textFieldStyle(.plain)
                    .font(.system(.body, design: .monospaced))
                    .foregroundColor(theme.textPrimary)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.characters)
                    .padding(10)
                    .background(theme.bgSecondary)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(theme.border))

                Button("Join") {
                    guard let token = authStore.accessToken, !joinCode.isEmpty else { return }
                    HapticManager.shared.buttonTap()
                    Task {
                        do {
                            let game = try await gamesAPI.joinByCode(joinCode.uppercased(), accessToken: token)
                            navigateToGameId = game.id
                            joinCode = ""
                        } catch {}
                    }
                }
                .font(.subheadline.bold())
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(theme.accent)
                .cornerRadius(8)
                .disabled(joinCode.count < 6)
                .opacity(joinCode.count < 6 ? 0.5 : 1.0)
            }
        }
        .panelStyle(theme: theme)
    }

    // MARK: - Active Games

    private var activeGamesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Active Games", systemImage: "gamecontroller")
                .font(.headline)
                .foregroundColor(theme.textPrimary)

            if loadingGames {
                ProgressView().tint(theme.accent)
            } else if activeGames.isEmpty {
                Text("No active games")
                    .font(.subheadline)
                    .foregroundColor(theme.textSecondary)
            } else {
                ForEach(activeGames) { game in
                    Button(action: { navigateToGameId = game.id }) {
                        ActiveGameRow(game: game, userId: authStore.userId ?? "")
                    }
                }
            }
        }
        .panelStyle(theme: theme)
    }

    private func loadActiveGames() async {
        guard let token = authStore.accessToken else { return }
        loadingGames = true
        defer { loadingGames = false }
        do {
            let games = try await gamesAPI.myGames(accessToken: token)
            activeGames = games.filter { $0.status == "playing" || $0.status == "waiting" }
        } catch {}
    }
}

// MARK: - Active Game Row

struct ActiveGameRow: View {
    @Environment(\.theme) var theme
    let game: OnlineGameDetail
    let userId: String

    var opponent: Profile? {
        game.white_player_id == userId ? game.black_player : game.white_player
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(opponent?.username ?? "Waiting...")
                    .font(.subheadline.bold())
                    .foregroundColor(theme.textPrimary)
                Text("\(game.game_type.capitalized) · Move \(game.move_count)")
                    .font(.caption)
                    .foregroundColor(theme.textSecondary)
            }
            Spacer()
            if game.current_player == (game.white_player_id == userId ? "white" : "black") {
                Text("Your turn")
                    .font(.caption.bold())
                    .foregroundColor(theme.accent)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(theme.accent.opacity(0.15))
                    .cornerRadius(6)
            }
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(theme.textSecondary)
        }
        .padding(12)
        .background(theme.bgSecondary)
        .cornerRadius(10)
    }
}

// MARK: - Panel Style Modifier

private extension View {
    func panelStyle(theme: ThemeConfig) -> some View {
        self
            .padding()
            .background(theme.bgPanel)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(theme.border, lineWidth: 0.5))
    }
}

#Preview {
    NavigationStack { LobbyView() }
        .environmentObject(AuthStore())
        .environmentObject(MatchmakingStore())
        .environment(\.theme, ThemeConfig.classic)
}
