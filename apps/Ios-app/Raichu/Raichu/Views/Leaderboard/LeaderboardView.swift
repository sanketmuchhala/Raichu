// LeaderboardView.swift
// Raichu
// Top 50 players by ELO rating with gold/silver/bronze for top 3.

import SwiftUI

struct LeaderboardView: View {
    @EnvironmentObject var authStore: AuthStore
    @Environment(\.theme) var theme

    @State private var players: [Profile] = []
    @State private var loading = false

    var body: some View {
        ZStack {
            theme.bgPrimary.ignoresSafeArea()

            if loading && players.isEmpty {
                ProgressView().tint(theme.accent)
            } else if players.isEmpty {
                emptyState
            } else {
                playerList
            }
        }
        .navigationTitle("Leaderboard")
        .toolbarBackground(theme.bgPanel, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .task { await loadLeaderboard() }
        .refreshable { await loadLeaderboard() }
    }

    private var playerList: some View {
        List(Array(players.enumerated()), id: \.element.id) { index, player in
            LeaderboardRow(
                rank: index + 1,
                player: player,
                isCurrentUser: player.id == authStore.userId
            )
            .listRowBackground(
                player.id == authStore.userId ? theme.accent.opacity(0.1) : theme.bgPanel
            )
            .listRowSeparatorTint(theme.border)
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(theme.bgPrimary)
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "trophy.fill")
                .font(.system(size: 50))
                .foregroundColor(theme.textSecondary)
            Text("Leaderboard loading...")
                .foregroundColor(theme.textPrimary)
        }
    }

    private func loadLeaderboard() async {
        // TODO: Supabase direct query when SDK is added
        // let profiles: [Profile] = try await supabase
        //   .from("profiles").select()
        //   .order("elo_rating", ascending: false).limit(50).execute().value
        // players = profiles

        // Placeholder: use API approach
        loading = false
    }
}

// MARK: - Leaderboard Row

struct LeaderboardRow: View {
    @Environment(\.theme) var theme
    let rank: Int
    let player: Profile
    let isCurrentUser: Bool

    private var rankLabel: some View {
        Group {
            switch rank {
            case 1:
                Text("🥇")
                    .font(.title2)
            case 2:
                Text("🥈")
                    .font(.title2)
            case 3:
                Text("🥉")
                    .font(.title2)
            default:
                Text("\(rank)")
                    .font(.subheadline.bold())
                    .foregroundColor(theme.textSecondary)
                    .frame(width: 30)
            }
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            rankLabel
                .frame(width: 36)

            // Avatar
            ZStack {
                Circle()
                    .fill(theme.accent.opacity(isCurrentUser ? 0.3 : 0.15))
                    .frame(width: 36, height: 36)
                Text(String(player.username.prefix(1)).uppercased())
                    .font(.subheadline.bold())
                    .foregroundColor(isCurrentUser ? theme.accent : theme.textPrimary)
            }

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(player.username)
                        .font(.subheadline.bold())
                        .foregroundColor(isCurrentUser ? theme.accent : theme.textPrimary)
                    if isCurrentUser {
                        Text("You")
                            .font(.caption2.bold())
                            .foregroundColor(theme.accent)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(theme.accent.opacity(0.15))
                            .cornerRadius(4)
                    }
                }
                Text("\(player.games_played) games · \(winRate)% win")
                    .font(.caption)
                    .foregroundColor(theme.textSecondary)
            }

            Spacer()

            Text("\(player.elo_rating)")
                .font(.headline.bold())
                .foregroundColor(rank <= 3 ? theme.accent : theme.textPrimary)
        }
        .padding(.vertical, 4)
    }

    private var winRate: Int {
        guard player.games_played > 0 else { return 0 }
        return Int(Double(player.games_won) / Double(player.games_played) * 100)
    }
}

#Preview {
    NavigationStack { LeaderboardView() }
        .environmentObject(AuthStore())
        .environment(\.theme, ThemeConfig.classic)
}
