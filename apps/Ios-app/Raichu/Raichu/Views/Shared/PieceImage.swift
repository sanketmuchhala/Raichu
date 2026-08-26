// PieceImage.swift
// Raichu
//
// Renders a game piece image matching the web app exactly.
// Web source: apps/web/src/components/pieces/PieceSVG.tsx
//
// Images are the Chess.com Neo/150 set, bundled in Assets.xcassets. The CDN
// fallback exists so a missing asset degrades to the web's own source rather
// than to a blank square.

import SwiftUI

private let CDN = "https://images.chesscomfiles.com/chess-themes/pieces/neo/150"

/// Piece character metadata. Single source of truth for the char -> asset and
/// char -> spoken-name mappings.
enum PieceCatalog {
    /// Identical mapping to `PIECE_IMG` in PieceSVG.tsx.
    static let assetName: [String: String] = [
        "w": "wp",   // White Pichu   (pawn)
        "b": "bp",   // Black Pichu
        "W": "wr",   // White Pikachu (rook)
        "B": "br",   // Black Pikachu
        "@": "wq",   // White Raichu  (queen)
        "$": "bq",   // Black Raichu
    ]

    private static let pieceName: [String: String] = [
        "w": "White Pichu",  "b": "Black Pichu",
        "W": "White Pikachu", "B": "Black Pikachu",
        "@": "White Raichu",  "$": "Black Raichu",
    ]

    /// Spoken description for VoiceOver.
    static func name(of piece: String) -> String {
        pieceName[piece] ?? "Empty square"
    }

    /// Capture-hierarchy rank, used to sort captured-piece rows the way the
    /// web's CapturedPieces does (Pichu, then Pikachu, then Raichu).
    static func rank(of piece: String) -> Int {
        switch piece {
        case "w", "b": return 0
        case "W", "B": return 1
        case "@", "$": return 2
        default: return 3
        }
    }

    /// Asset-catalog membership, resolved once. `UIImage(named:)` is a
    /// synchronous catalog hit, and the board asks for it on every update.
    static let bundledAssets: Set<String> = {
        Set(assetName.values.filter { UIImage(named: $0) != nil })
    }()
}

struct PieceImage: View {
    let piece: String
    let size: CGFloat

    private var assetName: String? { PieceCatalog.assetName[piece] }

    var body: some View {
        if let name = assetName {
            if PieceCatalog.bundledAssets.contains(name) {
                Image(name)
                    .resizable()
                    .interpolation(.high)
                    .scaledToFit()
                    .frame(width: size, height: size)
            } else if let url = URL(string: "\(CDN)/\(name).png") {
                AsyncImage(url: url) { phase in
                    if case .success(let image) = phase {
                        image.resizable().interpolation(.high).scaledToFit()
                    } else {
                        // Never fall back to chess unicode — a transparent
                        // square is better than the wrong glyph set.
                        Color.clear
                    }
                }
                .frame(width: size, height: size)
            }
        } else {
            Color.clear.frame(width: size, height: size)
        }
    }
}
