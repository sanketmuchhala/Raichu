// BoardGeometry.swift
// Raichu
//
// Board layout maths and the board <-> screen coordinate mapping.
//
// Proportions match the web SVG viewBox (apps/web/src/components/board/Board.tsx):
// a 512pt board with a 20pt gutter on the left, top and bottom — 532 x 552.

import CoreGraphics

enum BoardMetrics {
    static let size = 8
    /// Web `SQUARE_SIZE` / `COORD_SIZE`, used only as a ratio.
    static let referenceSquare: CGFloat = 64
    static let referenceGutter: CGFloat = 20
    static let referenceBoard: CGFloat = referenceSquare * CGFloat(size)   // 512

    static let widthRatio = (referenceBoard + referenceGutter) / referenceBoard    // 532/512
    static let heightRatio = (referenceBoard + referenceGutter * 2) / referenceBoard // 552/512

    /// Piece is inset 2pt inside a 64pt square on the web -> 60/64.
    static let pieceScale: CGFloat = 0.9375
    /// Legal-move dot radius is SQUARE_SIZE/6.
    static let legalDotRadiusScale: CGFloat = 1.0 / 6.0
    /// Capture ring radius is SQUARE_SIZE/2 - 4 at a 64pt square.
    static let captureRingRadiusScale: CGFloat = (referenceSquare / 2 - 4) / referenceSquare
    /// Capture ring stroke is 3 at a 64pt square.
    static let captureRingStrokeScale: CGFloat = 3 / referenceSquare
}

/// Resolved geometry for one layout pass.
struct BoardGeometry {
    let board: CGFloat      // side length of the 8x8 playing area
    let gutter: CGFloat
    /// `true` renders White's home rank at the bottom of the screen. Matches
    /// the web's `boardFlipped`, which defaults to `true`.
    let whiteAtBottom: Bool

    init(available: CGSize, whiteAtBottom: Bool) {
        let byWidth = available.width / BoardMetrics.widthRatio
        let byHeight = available.height / BoardMetrics.heightRatio
        let side = max(min(byWidth, byHeight), 0)
        self.board = side
        self.gutter = side * (BoardMetrics.referenceGutter / BoardMetrics.referenceBoard)
        self.whiteAtBottom = whiteAtBottom
    }

    var square: CGFloat { board / CGFloat(BoardMetrics.size) }
    var totalWidth: CGFloat { board + gutter }
    var totalHeight: CGFloat { board + gutter * 2 }

    // Flipping is a 180-degree rotation, so the same involution converts in
    // both directions for both axes.
    private func flip(_ i: Int) -> Int {
        whiteAtBottom ? BoardMetrics.size - 1 - i : i
    }

    func screenRow(ofBoardRow row: Int) -> Int { flip(row) }
    func screenCol(ofBoardCol col: Int) -> Int { flip(col) }
    func boardRow(ofScreenRow row: Int) -> Int { flip(row) }
    func boardCol(ofScreenCol col: Int) -> Int { flip(col) }

    /// Top-left corner of a board square, in the board view's coordinate space.
    func origin(of position: Position) -> CGPoint {
        CGPoint(
            x: gutter + CGFloat(screenCol(ofBoardCol: position.col)) * square,
            y: gutter + CGFloat(screenRow(ofBoardRow: position.row)) * square
        )
    }

    /// Centre of a board square.
    func center(of position: Position) -> CGPoint {
        let o = origin(of: position)
        return CGPoint(x: o.x + square / 2, y: o.y + square / 2)
    }

    /// Board square under a point, or `nil` if the point is in a gutter.
    func position(at point: CGPoint) -> Position? {
        guard square > 0 else { return nil }
        let col = Int(((point.x - gutter) / square).rounded(.down))
        let row = Int(((point.y - gutter) / square).rounded(.down))
        let range = 0..<BoardMetrics.size
        guard range.contains(col), range.contains(row) else { return nil }
        return Position(row: boardRow(ofScreenRow: row), col: boardCol(ofScreenCol: col))
    }

    /// Straight-line distance between two squares, in squares.
    func distanceInSquares(from: Position, to: Position) -> CGFloat {
        let a = center(of: from), b = center(of: to)
        guard square > 0 else { return 0 }
        return CGFloat(hypot(b.x - a.x, b.y - a.y)) / square
    }
}

// MARK: - Notation

enum Notation {
    private static let files = Array("abcdefgh")

    /// Canonical mapping from docs/game/rules-and-notation.md:
    /// `{ row: 0, col: 0 }` is `a8`, `{ row: 7, col: 7 }` is `h1`.
    static func file(_ col: Int) -> String {
        guard files.indices.contains(col) else { return "?" }
        return String(files[col])
    }

    static func rank(_ row: Int) -> Int { BoardMetrics.size - row }

    static func square(_ position: Position) -> String {
        "\(file(position.col))\(rank(position.row))"
    }
}
