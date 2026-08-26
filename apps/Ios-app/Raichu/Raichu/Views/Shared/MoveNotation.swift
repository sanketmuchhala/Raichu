// MoveNotation.swift
// Raichu
//
// Move formatting, ported from `formatMoveHuman` / `formatMoveCoordinate` in
// packages/game-engine/src/game.ts so iOS reads moves exactly as web does.

import Foundation

enum MoveNotation {
    private static func pieceType(_ piece: String) -> String {
        switch piece {
        case "w", "b": return "Pichu"
        case "W", "B": return "Pikachu"
        case "@", "$": return "Raichu"
        default: return piece
        }
    }

    /// Compact form for move lists: `a6→a5` / `a6×b5`.
    static func short(_ move: Move) -> String {
        let arrow = move.captured == nil ? "→" : "×"
        return "\(Notation.square(move.from))\(arrow)\(Notation.square(move.to))"
    }

    /// Long form for the "Last:" preview and VoiceOver.
    static func human(_ move: Move) -> String {
        let arrow = move.captured == nil ? "→" : "×"
        var text = "\(pieceType(move.piece)) \(Notation.square(move.from))\(arrow)\(Notation.square(move.to))"
        if let captured = move.captured {
            text += " (captures \(pieceType(captured.piece)))"
        }
        if move.promotion != nil {
            text += " (promotes)"
        }
        return text
    }

    /// Spelled out for VoiceOver, where arrows and file letters read poorly.
    static func spoken(_ move: Move) -> String {
        let verb = move.captured == nil ? "to" : "captures on"
        var text = "\(pieceType(move.piece)) \(Notation.square(move.from)) \(verb) \(Notation.square(move.to))"
        if move.promotion != nil { text += ", promotes to Raichu" }
        return text
    }
}
