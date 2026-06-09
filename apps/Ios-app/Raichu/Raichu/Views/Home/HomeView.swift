// HomeView.swift
// Raichu
// Landing screen shown on first launch — explains the game and funnels into play.

import SwiftUI

struct HomeView: View {
    @Environment(\.theme) var theme
    @State private var appeared = false
    @State private var navigateToPlay = false
    @State private var navigateToLobby = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Logo + title
                    logoSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5), value: appeared)

                    // CTAs
                    ctaSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.15), value: appeared)

                    // Stats strip
                    statsStrip
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.30), value: appeared)

                    // Piece guide
                    pieceGuideSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.45), value: appeared)

                    // How to Play
                    howToPlaySection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.60), value: appeared)

                    // Final CTA
                    Button(action: { navigateToPlay = true }) {
                        Text("Start Playing")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(theme.accent)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.75), value: appeared)
                }
                .padding(.vertical, 24)
            }
            .background(theme.bgPrimary.ignoresSafeArea())
            .navigationBarHidden(true)
            .navigationDestination(isPresented: $navigateToPlay) {
                PlayView()
            }
            .navigationDestination(isPresented: $navigateToLobby) {
                LobbyView()
            }
        }
        .onAppear { appeared = true }
    }

    // MARK: - Sections

    private var logoSection: some View {
        VStack(spacing: 12) {
            if UIImage(named: "raichu logo") != nil {
                Image("raichu logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .cornerRadius(16)
            } else {
                Image(systemName: "crown.fill")
                    .font(.system(size: 60))
                    .foregroundColor(theme.accent)
            }

            Text("Raichu")
                .font(.system(size: 44, weight: .black))
                .foregroundColor(theme.textPrimary)

            Text("Chess-inspired. No luck. 5–15 minutes.")
                .font(.subheadline)
                .foregroundColor(theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 16)
    }

    private var ctaSection: some View {
        HStack(spacing: 12) {
            Button(action: {
                HapticManager.shared.buttonTap()
                navigateToPlay = true
            }) {
                Text("Play vs AI")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(theme.accent)
                    .cornerRadius(12)
            }

            Button(action: {
                HapticManager.shared.buttonTap()
                navigateToLobby = true
            }) {
                Text("Play Online")
                    .font(.headline)
                    .foregroundColor(theme.textPrimary)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(theme.btnSecondaryBg)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.border, lineWidth: 1))
                    .cornerRadius(12)
            }
        }
        .padding(.horizontal)
    }

    private var statsStrip: some View {
        HStack(spacing: 8) {
            StatCard(value: "5–15", label: "min")
            StatCard(value: "0", label: "luck")
            StatCard(value: "3", label: "pieces")
            StatCard(value: "Free", label: "always")
        }
        .padding(.horizontal)
    }

    private var pieceGuideSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Piece Types")
                .font(.title3.bold())
                .foregroundColor(theme.textPrimary)
                .padding(.horizontal)

            HStack(spacing: 8) {
                PieceCard(
                    piece: "w",
                    name: "Pichu",
                    description: "Moves 1 diag forward.\nCaptures Pichu only."
                )
                PieceCard(
                    piece: "W",
                    name: "Pikachu",
                    description: "Moves 1–2 forward/side.\nCaptures Pichu + Pikachu."
                )
                PieceCard(
                    piece: "@",
                    name: "Raichu",
                    description: "Queen-like movement.\nCaptures anything."
                )
            }
            .padding(.horizontal)
        }
    }

    private var howToPlaySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("How to Play")
                .font(.title3.bold())
                .foregroundColor(theme.textPrimary)

            ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                HStack(alignment: .top, spacing: 12) {
                    Text("\(index + 1)")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(width: 28, height: 28)
                        .background(theme.accent)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: 2) {
                        Text(step.title)
                            .font(.headline)
                            .foregroundColor(theme.textPrimary)
                        Text(step.description)
                            .font(.subheadline)
                            .foregroundColor(theme.textSecondary)
                    }
                    Spacer()
                }
            }
        }
        .padding()
        .background(theme.bgPanel)
        .cornerRadius(16)
        .padding(.horizontal)
    }

    private let steps = [
        (title: "Select a piece", description: "Tap any of your pieces to see legal moves highlighted on the board."),
        (title: "Capture strategically", description: "Pichus capture Pichus. Pikachus capture Pichus and Pikachus. Raichus capture anything."),
        (title: "Win the board", description: "Capture all opponent pieces to win. Promote Pichu or Pikachu to the back rank to create a Raichu.")
    ]
}

// MARK: - Sub-components

struct StatCard: View {
    @Environment(\.theme) var theme
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold())
                .foregroundColor(theme.accent)
            Text(label)
                .font(.caption)
                .foregroundColor(theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(theme.bgPanel)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.border, lineWidth: 1))
    }
}

struct PieceCard: View {
    @Environment(\.theme) var theme
    let piece: String
    let name: String
    let description: String

    var body: some View {
        VStack(spacing: 8) {
            PieceImage(piece: piece, size: 36)
            Text(name)
                .font(.subheadline.bold())
                .foregroundColor(theme.textPrimary)
            Text(description)
                .font(.caption)
                .foregroundColor(theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(theme.bgPanel)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.border, lineWidth: 1))
    }
}

#Preview {
    HomeView()
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
