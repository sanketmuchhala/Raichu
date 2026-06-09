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
                    // 1. Logo + title
                    logoSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5), value: appeared)

                    // 2. CTAs
                    ctaSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.15), value: appeared)

                    // 3. Stats strip (with count-up)
                    statsStrip
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.30), value: appeared)

                    // 4. Piece guide (with scale-in)
                    pieceGuideSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.45), value: appeared)

                    // 5. Capture hierarchy table
                    captureHierarchySection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.60), value: appeared)

                    // 6. How to Play
                    howToPlaySection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.75), value: appeared)

                    // 7. Final CTA
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
                    .animation(.easeOut(duration: 0.5).delay(0.90), value: appeared)
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

    // MARK: - Logo

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

    // MARK: - CTAs

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

    // MARK: - Stats Strip (count-up on numeric values)

    private var statsStrip: some View {
        HStack(spacing: 8) {
            AnimatedStatCard(targetValue: nil, staticValue: "5–15", label: "min", animate: appeared)
            AnimatedStatCard(targetValue: 0, staticValue: nil, label: "luck", animate: appeared)
            AnimatedStatCard(targetValue: 3, staticValue: nil, label: "piece types", animate: appeared)
            AnimatedStatCard(targetValue: nil, staticValue: "Free", label: "always", animate: appeared)
        }
        .padding(.horizontal)
    }

    // MARK: - Piece Guide (scale-in)

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
                    description: "Moves 1 diag forward.\nCaptures Pichu only.",
                    animate: appeared
                )
                PieceCard(
                    piece: "W",
                    name: "Pikachu",
                    description: "Moves 1–2 forward/side.\nCaptures Pichu + Pikachu.",
                    animate: appeared
                )
                PieceCard(
                    piece: "@",
                    name: "Raichu",
                    description: "Queen-like movement.\nCaptures anything.",
                    animate: appeared
                )
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Capture Hierarchy

    private var captureHierarchySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Capture Hierarchy")
                .font(.title3.bold())
                .foregroundColor(theme.textPrimary)

            VStack(spacing: 8) {
                CaptureRow(
                    attackerPiece: "@",
                    attackerName: "Raichu",
                    captures: ["@", "W", "w"],
                    captureLabel: "captures everything"
                )
                CaptureRow(
                    attackerPiece: "W",
                    attackerName: "Pikachu",
                    captures: ["W", "w"],
                    captureLabel: "captures Pikachu + Pichu"
                )
                CaptureRow(
                    attackerPiece: "w",
                    attackerName: "Pichu",
                    captures: ["w"],
                    captureLabel: "captures Pichu only"
                )
            }
        }
        .padding()
        .background(theme.bgPanel)
        .cornerRadius(16)
        .padding(.horizontal)
    }

    // MARK: - How to Play

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

// MARK: - AnimatedStatCard (count-up for numeric values)

struct AnimatedStatCard: View {
    @Environment(\.theme) var theme
    let targetValue: Int?    // nil = use staticValue as-is
    let staticValue: String? // used when targetValue is nil
    let label: String
    let animate: Bool

    @State private var displayedValue: Int = 0

    private var displayText: String {
        if targetValue != nil {
            return "\(displayedValue)"
        }
        return staticValue ?? ""
    }

    var body: some View {
        VStack(spacing: 4) {
            Text(displayText)
                .font(.title2.bold())
                .foregroundColor(theme.accent)
                .monospacedDigit()
            Text(label)
                .font(.caption)
                .foregroundColor(theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(theme.bgPanel)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.border, lineWidth: 1))
        .onChange(of: animate) { _, newValue in
            guard newValue, let target = targetValue, target > 0 else { return }
            // Count up from 0 to target over 0.8s using a timer
            let interval = 0.8 / Double(target)
            var current = 0
            Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { timer in
                current += 1
                displayedValue = current
                if current >= target { timer.invalidate() }
            }
        }
    }
}

// MARK: - PieceCard (scale-in on appear)

struct PieceCard: View {
    @Environment(\.theme) var theme
    let piece: String
    let name: String
    let description: String
    let animate: Bool

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
        .scaleEffect(animate ? 1.0 : 0.9)
        .animation(.easeOut(duration: 0.4).delay(0.50), value: animate)
    }
}

// MARK: - CaptureRow

struct CaptureRow: View {
    @Environment(\.theme) var theme
    let attackerPiece: String
    let attackerName: String
    let captures: [String]   // white piece chars to show as targets
    let captureLabel: String

    var body: some View {
        HStack(spacing: 10) {
            // Attacker
            HStack(spacing: 6) {
                PieceImage(piece: attackerPiece, size: 28)
                Text(attackerName)
                    .font(.caption.bold())
                    .foregroundColor(theme.textPrimary)
            }
            .frame(width: 90, alignment: .leading)

            Image(systemName: "arrow.right")
                .font(.caption)
                .foregroundColor(theme.accent)

            // Targets
            HStack(spacing: 4) {
                ForEach(captures, id: \.self) { piece in
                    PieceImage(piece: piece, size: 22)
                }
            }

            Spacer()

            Text(captureLabel)
                .font(.caption2)
                .foregroundColor(theme.textSecondary)
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(theme.bgSecondary)
        .cornerRadius(8)
    }
}

#Preview {
    HomeView()
        .environmentObject(UIStore())
        .environment(\.theme, ThemeConfig.classic)
}
