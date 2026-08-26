// CapturedPiecesRow.swift
// Raichu
//
// Strip of pieces a player has captured.
// Web: apps/web/src/components/board/CapturedPieces.tsx — sorted by capture
// hierarchy (Pichu, Pikachu, Raichu), drawn at 78% opacity.

import SwiftUI

struct CapturedPiecesRow: View {
    let pieces: [String]
    var size: CGFloat = 20

    private var sorted: [String] {
        pieces.sorted { PieceCatalog.rank(of: $0) < PieceCatalog.rank(of: $1) }
    }

    var body: some View {
        HStack(spacing: 1) {
            ForEach(Array(sorted.enumerated()), id: \.offset) { _, piece in
                PieceImage(piece: piece, size: size)
            }
        }
        .opacity(0.78)
        .padding(.horizontal, 4)
        .frame(minHeight: size + 4)
        .accessibilityHidden(true)
    }
}
