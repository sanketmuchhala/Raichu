// HistoryView.swift
// Raichu
// Game history with filter and replay support.

import SwiftUI

struct HistoryView: View {
    @EnvironmentObject var authStore: AuthStore
    @Environment(\.theme) var theme

    @State private var games: [OnlineGameDetail] = []
    @State private var loading = false
    @State private var filter = "all"   // all | ranked | friendly
    @State private var navigateToGameId: String? = nil

    private var filteredGames: [OnlineGameDetail] {
        switch filter {
        case "ranked": return games.filter { $0.game_type == "ranked" }
        case "friendly": return games.filter { $0.game_type == "friendly" || $0.game_type == "bot" }
        default: return games
        }
    }

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            if !authStore.isAuthenticated {
                requireAuthView
            } else {
                VStack(spacing: 0) {
                    filterPicker
                    if loading {
                        Spacer()
                        ProgressView().tint(theme.accent)
                        Spacer()
                    } else if filteredGames.isEmpty {
                        Spacer()
                        emptyState
                        Spacer()
                    } else {
                        gameList
                    }
                }
            }
        }
        .navigationTitle("History")
        .toolbarBackground(theme.bgPanel, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .navigationDestination(item: $navigateToGameId) { id in
            OnlineGameView(gameId: id)
        }
        .task {
            if authStore.isAuthenticated { await loadGames() }
        }
        .refreshable { await loadGames() }
    }

    // MARK: - Sub-views

    private var requireAuthView: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock.fill")
                .font(.system(size: 50))
                .foregroundColor(theme.textSecondary)
            Text("Sign in to view history")
                .font(.title3.bold())
                .foregroundColor(theme.textPrimary)
        }
    }

    private var filterPicker: some View {
        Picker("Filter", selection: $filter) {
            Text("All").tag("all")
            Text("Ranked").tag("ranked")
            Text("Friendly").tag("friendly")
        }
        .pickerStyle(.segmented)
        .padding()
        .background(theme.bgPanel)
    }

    private var gameList: some View {
        List(filteredGames) { game in
            Button(action: { navigateToGameId = game.id }) {
                HistoryGameRow(game: game, userId: authStore.userId ?? "")
            }
            .listRowBackground(theme.bgPanel)
            .listRowSeparatorTint(theme.border)
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(theme.bgPrimary)
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "tray.fill")
                .font(.system(size: 40))
                .foregroundColor(theme.textSecondary)
            Text("No games yet")
                .font(.headline)
                .foregroundColor(theme.textPrimary)
            Text("Your completed games will appear here.")
                .font(.subheadline)
                .foregroundColor(theme.textSecondary)
        }
    }

    private func loadGames() async {
        // Show cached games immediately while fetching (spec 6.3)
        if games.isEmpty { games = loadCachedGames() }

        guard let token = authStore.accessToken else { return }
        loading = true
        defer { loading = false }
        do {
            let fetched = try await gamesAPI.myGames(accessToken: token)
                .filter { $0.status != "playing" && $0.status != "waiting" }
                .sorted { $0.created_at > $1.created_at }
            games = fetched
            // Cache up to last 20 completed games (spec 6.3)
            cacheGames(Array(fetched.prefix(20)))
        } catch {
            // Network error — continue showing cached data
        }
    }

    // MARK: - Cache helpers

    private static let cacheKey = "cachedGameHistory"

    private func loadCachedGames() -> [OnlineGameDetail] {
        guard let data = UserDefaults.standard.data(forKey: Self.cacheKey),
              let cached = try? JSONDecoder().decode([OnlineGameDetail].self, from: data)
        else { return [] }
        return cached
    }

    private func cacheGames(_ list: [OnlineGameDetail]) {
        if let data = try? JSONEncoder().encode(list) {
            UserDefaults.standard.set(data, forKey: Self.cacheKey)
        }
    }
}

// MARK: - History Game Row

struct HistoryGameRow: View {
    @Environment(\.theme) var theme
    let game: OnlineGameDetail
    let userId: String

    private var won: Bool { game.winner_id == userId }
    private var abandoned: Bool { game.status == "abandoned" }
    private var opponent: Profile? {
        game.white_player_id == userId ? game.black_player : game.white_player
    }
    private var myColor: String {
        game.white_player_id == userId ? "White" : "Black"
    }
    private var eloDelta: Int? {
        if game.winner_id == userId { return game.winner_elo_delta }
        if game.winner_id != nil { return game.loser_elo_delta }
        return nil
    }
    private var resultColor: Color {
        abandoned ? theme.textSecondary : (won ? theme.accent : theme.captureIndicator)
    }

    var body: some View {
        HStack(spacing: 0) {
            // Colored left border
            Rectangle()
                .fill(resultColor)
                .frame(width: 4)
                .cornerRadius(2)
                .padding(.vertical, 2)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(opponent?.username ?? "Unknown")
                        .font(.subheadline.bold())
                        .foregroundColor(theme.textPrimary)
                    Spacer()
                    if let delta = eloDelta {
                        Text(delta >= 0 ? "+\(delta)" : "\(delta)")
                            .font(.caption.bold())
                            .foregroundColor(delta >= 0 ? theme.accent : theme.captureIndicator)
                    }
                }

                HStack(spacing: 8) {
                    Text(game.game_type.capitalized)
                        .font(.caption)
                        .foregroundColor(theme.textSecondary)
                    Text("·")
                        .foregroundColor(theme.textSecondary)
                    Text("Played as \(myColor)")
                        .font(.caption)
                        .foregroundColor(theme.textSecondary)
                    Text("·")
                        .foregroundColor(theme.textSecondary)
                    Text("\(game.move_count) moves")
                        .font(.caption)
                        .foregroundColor(theme.textSecondary)
                    Text("·")
                        .foregroundColor(theme.textSecondary)
                    Text(formattedDate(game.created_at))
                        .font(.caption)
                        .foregroundColor(theme.textSecondary)
                }

                Text(abandoned ? "Abandoned" : (won ? "Won" : "Lost"))
                    .font(.caption.bold())
                    .foregroundColor(resultColor)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(theme.textSecondary)
                .padding(.trailing, 8)
        }
        .background(theme.bgPanel)
        .cornerRadius(10)
    }

    private func formattedDate(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let date: Date?
        if let d = formatter.date(from: iso) {
            date = d
        } else {
            formatter.formatOptions = [.withInternetDateTime]
            date = formatter.date(from: iso)
        }
        guard let d = date else { return "" }
        return RelativeDateTimeFormatter().localizedString(for: d, relativeTo: Date())
    }
}

#Preview {
    NavigationStack { HistoryView() }
        .environmentObject(AuthStore())
        .environment(\.theme, ThemeConfig.classic)
}
