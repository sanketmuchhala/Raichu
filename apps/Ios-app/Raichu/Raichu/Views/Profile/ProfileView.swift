// ProfileView.swift
// Raichu
// User profile: stats, ELO history chart, recent games, settings.

import SwiftUI
import Charts

struct ProfileView: View {
    @EnvironmentObject var authStore: AuthStore
    @Environment(\.theme) var theme

    @State private var recentGames: [OnlineGameDetail] = []
    @State private var eloHistory: [ELOPoint] = []
    @State private var navigateToSettings = false
    @State private var navigateToGameId: String? = nil

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    profileHeader
                    statsGrid
                    if !eloHistory.isEmpty { eloChart }
                    recentGamesSection
                    signOutButton
                }
                .padding()
            }
        }
        .navigationTitle("Profile")
        .toolbarBackground(theme.bgPanel, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { navigateToSettings = true }) {
                    Image(systemName: "gearshape.fill")
                        .foregroundColor(theme.textSecondary)
                }
            }
        }
        .navigationDestination(isPresented: $navigateToSettings) {
            SettingsView()
        }
        .navigationDestination(item: $navigateToGameId) { id in
            OnlineGameView(gameId: id)
        }
        .task { await loadData() }
    }

    // MARK: - Header

    private var profileHeader: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(theme.accent.opacity(0.2))
                    .frame(width: 72, height: 72)
                Text(String((authStore.profile?.username ?? "?").prefix(1)).uppercased())
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(theme.accent)
            }

            VStack(spacing: 4) {
                Text(authStore.profile?.displayOrUsername ?? "Player")
                    .font(.title2.bold())
                    .foregroundColor(theme.textPrimary)
                Text("\(authStore.profile?.elo_rating ?? 1200) ELO")
                    .font(.title3)
                    .foregroundColor(theme.accent)
            }
        }
        .padding(.top, 8)
    }

    // MARK: - Stats Grid

    private var statsGrid: some View {
        let profile = authStore.profile
        let wins = profile?.games_won ?? 0
        let played = profile?.games_played ?? 0
        let losses = max(0, played - wins)
        let winRate = played > 0 ? Int(Double(wins) / Double(played) * 100) : 0

        return LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
            StatTile(label: "Wins", value: "\(wins)", color: theme.accent)
            StatTile(label: "Losses", value: "\(losses)", color: theme.captureIndicator)
            StatTile(label: "Win Rate", value: "\(winRate)%", color: theme.textPrimary)
            StatTile(label: "Games", value: "\(played)", color: theme.textPrimary)
        }
    }

    // MARK: - ELO Chart

    struct ELOPoint: Identifiable {
        let id = UUID()
        let game: Int
        let elo: Int
    }

    private var eloChart: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("ELO History")
                .font(.headline)
                .foregroundColor(theme.textPrimary)

            Chart(eloHistory) { point in
                LineMark(
                    x: .value("Game", point.game),
                    y: .value("ELO", point.elo)
                )
                .foregroundStyle(theme.accent)
                .interpolationMethod(.catmullRom)

                AreaMark(
                    x: .value("Game", point.game),
                    y: .value("ELO", point.elo)
                )
                .foregroundStyle(theme.accent.opacity(0.15))
                .interpolationMethod(.catmullRom)
            }
            .frame(height: 120)
            .chartXAxis(.hidden)
            .chartYAxis {
                AxisMarks(values: .automatic(desiredCount: 3)) { value in
                    AxisValueLabel()
                        .foregroundStyle(theme.textSecondary)
                }
            }
        }
        .padding()
        .background(theme.bgPanel)
        .cornerRadius(16)
    }

    // MARK: - Recent Games

    private var recentGamesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Games")
                .font(.headline)
                .foregroundColor(theme.textPrimary)

            if recentGames.isEmpty {
                Text("No games yet")
                    .font(.subheadline)
                    .foregroundColor(theme.textSecondary)
            } else {
                ForEach(recentGames.prefix(5)) { game in
                    Button(action: { navigateToGameId = game.id }) {
                        HistoryGameRow(game: game, userId: authStore.userId ?? "")
                    }
                }
            }
        }
        .padding()
        .background(theme.bgPanel)
        .cornerRadius(16)
    }

    // MARK: - Sign Out

    private var signOutButton: some View {
        Button(action: {
            HapticManager.shared.buttonTap()
            Task { await authStore.signOut() }
        }) {
            Text("Sign Out")
                .font(.subheadline.bold())
                .foregroundColor(theme.captureIndicator)
                .frame(maxWidth: .infinity)
                .padding()
                .background(theme.btnSecondaryBg)
                .cornerRadius(12)
        }
    }

    // MARK: - Data Loading

    private func loadData() async {
        guard let token = authStore.accessToken else { return }
        await authStore.fetchProfile()

        do {
            let games = try await gamesAPI.myGames(accessToken: token)
            recentGames = games
                .filter { $0.status != "playing" && $0.status != "waiting" }
                .sorted { $0.created_at > $1.created_at }

            // Build ELO history from last 20 completed games (placeholder)
            // Full implementation: track ELO per game in API response
            let userId = authStore.userId ?? ""
            var elo = authStore.profile?.elo_rating ?? 1200
            let completedGames = recentGames.prefix(20).reversed()
            var points: [ELOPoint] = []
            var idx = 1
            for game in completedGames {
                let delta: Int
                if game.winner_id == userId {
                    delta = game.winner_elo_delta ?? 0
                } else if game.winner_id != nil {
                    delta = game.loser_elo_delta ?? 0
                } else {
                    delta = 0
                }
                elo -= delta  // walk backwards
                points.append(ELOPoint(game: idx, elo: elo))
                idx += 1
            }
            eloHistory = points.reversed()
        } catch {}
    }
}

// MARK: - Stat Tile

struct StatTile: View {
    @Environment(\.theme) var theme
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Text(value)
                .font(.title2.bold())
                .foregroundColor(color)
            Text(label)
                .font(.caption)
                .foregroundColor(theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(theme.bgPanel)
        .cornerRadius(12)
    }
}

#Preview {
    NavigationStack { ProfileView() }
        .environmentObject(AuthStore())
        .environment(\.theme, ThemeConfig.classic)
}
