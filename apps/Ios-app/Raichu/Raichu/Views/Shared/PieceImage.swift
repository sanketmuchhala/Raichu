// PieceImage.swift
// Raichu
//
// Renders a game piece image matching the web app exactly.
// Web app source: apps/web/src/components/pieces/PieceSVG.tsx
//
// Piece mapping (identical to web PieceSVG.tsx):
//   w  → wp.png  (White Pichu  — pawn)
//   b  → bp.png  (Black Pichu  — pawn)
//   W  → wr.png  (White Pikachu — rook)
//   B  → br.png  (Black Pikachu — rook)
//   @  → wq.png  (White Raichu — queen)
//   $  → bq.png  (Black Raichu — queen)
//
// Images are the Chess.com Neo/150 set, bundled in Assets.xcassets.
// CDN source: https://images.chesscomfiles.com/chess-themes/pieces/neo/150/
//
// Fallback chain:
//   1. Bundled asset (Assets.xcassets) — used after first build
//   2. AsyncImage from Chess.com CDN  — identical to web app source

import SwiftUI

// Chess.com Neo/150 CDN — same base URL as apps/web/src/components/pieces/PieceSVG.tsx
private let CDN = "https://images.chesscomfiles.com/chess-themes/pieces/neo/150"

// Maps piece character to image asset name.
// Identical mapping to web app PIECE_IMG in PieceSVG.tsx.
private let pieceImageName: [String: String] = [
    "w": "wp",   // White Pichu  (pawn)
    "b": "bp",   // Black Pichu  (pawn)
    "W": "wr",   // White Pikachu (rook)
    "B": "br",   // Black Pikachu (rook)
    "@": "wq",   // White Raichu (queen)
    "$": "bq",   // Black Raichu (queen)
]

struct PieceImage: View {
    let piece: String
    let size: CGFloat

    private var imageName: String { pieceImageName[piece] ?? "" }
    private var cdnURL: URL? { imageName.isEmpty ? nil : URL(string: "\(CDN)/\(imageName).png") }

    var body: some View {
        if imageName.isEmpty {
            Color.clear.frame(width: size, height: size)
        } else if UIImage(named: imageName) != nil {
            // Bundled asset — fast, no network
            Image(imageName)
                .resizable()
                .scaledToFit()
                .frame(width: size, height: size)
        } else if let url = cdnURL {
            // CDN fallback — same source as web app PieceSVG.tsx
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFit()
                        .frame(width: size, height: size)
                case .failure:
                    // Network failed — transparent placeholder, never show chess unicode
                    Color.clear.frame(width: size, height: size)
                case .empty:
                    Color.clear.frame(width: size, height: size)
                @unknown default:
                    Color.clear.frame(width: size, height: size)
                }
            }
            .frame(width: size, height: size)
        }
    }
}
