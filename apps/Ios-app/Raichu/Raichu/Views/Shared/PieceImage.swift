// PieceImage.swift
// Raichu
// Maps piece character to bundled image asset.
// Bundle images: wp.png, bp.png, wr.png, br.png, wq.png, bq.png
// (Download from chess.com CDN and add to Assets.xcassets before shipping)

import SwiftUI

struct PieceImage: View {
    let piece: String
    let size: CGFloat

    var imageName: String {
        switch piece {
        case "w": return "wp"    // White Pichu
        case "W": return "wr"    // White Pikachu
        case "@": return "wq"    // White Raichu
        case "b": return "bp"    // Black Pichu
        case "B": return "br"    // Black Pikachu
        case "$": return "bq"    // Black Raichu
        default:  return ""
        }
    }

    var body: some View {
        if !imageName.isEmpty, UIImage(named: imageName) != nil {
            Image(imageName)
                .resizable()
                .scaledToFit()
                .frame(width: size, height: size)
        } else {
            // Fallback text symbol when images aren't bundled yet
            Text(pieceSymbol)
                .font(.system(size: size * 0.65, weight: .bold))
                .frame(width: size, height: size)
                .foregroundColor(piece.isWhitePiece ? .white : Color(hex: "1a1a1a"))
        }
    }

    private var pieceSymbol: String {
        switch piece {
        case "w", "b": return "♟"
        case "W", "B": return "♜"
        case "@", "$": return "♛"
        default: return ""
        }
    }
}
