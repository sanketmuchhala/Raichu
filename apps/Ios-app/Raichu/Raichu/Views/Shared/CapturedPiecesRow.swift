// CapturedPiecesRow.swift
// Raichu
// Displays pieces captured during the game, sorted by piece type value.

import SwiftUI

struct CapturedPiecesRow: View {
    let pieces: [String]

    private var sortedPieces: [String] {
        pieces.sorted { a, b in
            pieceOrder(a) < pieceOrder(b)
        }
    }

    private func pieceOrder(_ p: String) -> Int {
        switch p.lowercased() {
        case "w", "b": return 0   // Pichu first
        case "W", "B": return 1   // Pikachu
        case "@", "$": return 2   // Raichu last
        default: return 3
        }
    }

    var body: some View {
        HStack(spacing: 1) {
            ForEach(Array(sortedPieces.enumerated()), id: \.offset) { _, piece in
                PieceImage(piece: piece, size: 22)
                    .opacity(0.78)
            }
            Spacer()
        }
        .frame(minHeight: 26)
        .padding(.horizontal, 4)
    }
}
