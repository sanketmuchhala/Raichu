// BoardView.swift
// Raichu
// Core 8×8 board component used in offline and online game screens.

import SwiftUI

private let COL_LABELS = ["a","b","c","d","e","f","g","h"]
private let MARGIN: CGFloat = 20

struct BoardView: View {
    let board: [[String]]
    let selectedPiece: Position?
    let legalMoves: [Move]
    let lastMove: Move?
    let flipped: Bool
    let canInteract: Bool
    var onTap: (Position) -> Void
    var onDrop: ((Position, Position) -> Void)?

    @Environment(\.theme) var theme
    @State private var draggedPiece: Position? = nil
    @State private var dragOffset: CGSize = .zero
    @State private var animatingMoveFrom: Position? = nil
    @State private var animatingMoveTo: Position? = nil

    var body: some View {
        GeometryReader { geo in
            let boardWidth = min(geo.size.width, geo.size.height) - MARGIN * 2
            let squareSize = boardWidth / 8

            ZStack(alignment: .topLeading) {
                // Board background
                boardGrid(squareSize: squareSize, boardWidth: boardWidth)
                // Coordinate labels
                coordinateLabels(squareSize: squareSize, boardWidth: boardWidth)
                // Pieces layer
                piecesLayer(squareSize: squareSize, boardWidth: boardWidth)
            }
            .frame(width: boardWidth + MARGIN, height: boardWidth + MARGIN)
        }
        .aspectRatio(1, contentMode: .fit)
    }

    // MARK: - Board Grid

    private func boardGrid(squareSize: CGFloat, boardWidth: CGFloat) -> some View {
        Canvas { ctx, _ in
            for row in 0..<8 {
                for col in 0..<8 {
                    let displayRow = flipped ? row : 7 - row
                    let displayCol = flipped ? col : 7 - col
                    let isLight = (displayRow + displayCol) % 2 == 0
                    let rect = CGRect(
                        x: MARGIN + CGFloat(col) * squareSize,
                        y: MARGIN + CGFloat(row) * squareSize,
                        width: squareSize,
                        height: squareSize
                    )

                    let baseColor = isLight ? theme.boardLight : theme.boardDark
                    ctx.fill(Path(rect), with: .color(baseColor))

                    let pos = Position(row: displayRow, col: displayCol)

                    // Last move highlight
                    if let lm = lastMove, (lm.from == pos || lm.to == pos) {
                        ctx.fill(Path(rect), with: .color(theme.lastMove))
                    }

                    // Selection highlight
                    if selectedPiece == pos {
                        ctx.fill(Path(rect), with: .color(theme.selected))
                    }

                    // Legal move indicator
                    if legalMoves.contains(where: { $0.to == pos }) {
                        let isCapture = legalMoves.first(where: { $0.to == pos })?.captured != nil
                        if isCapture {
                            // Red ring for captures
                            let strokeWidth: CGFloat = squareSize * 0.08
                            let inset = strokeWidth / 2
                            let ring = Path(ellipseIn: rect.insetBy(dx: inset, dy: inset))
                            ctx.stroke(ring, with: .color(theme.captureIndicator), lineWidth: strokeWidth)
                        } else {
                            // Small circle for quiet moves
                            let circleSize = squareSize * 0.3
                            let circleRect = CGRect(
                                x: rect.midX - circleSize / 2,
                                y: rect.midY - circleSize / 2,
                                width: circleSize,
                                height: circleSize
                            )
                            ctx.fill(Path(ellipseIn: circleRect), with: .color(theme.legalMove))
                        }
                    }
                }
            }
        }
        .frame(width: boardWidth + MARGIN, height: boardWidth + MARGIN)
        .contentShape(Rectangle())
        .gesture(tapGesture(squareSize: squareSize))
    }

    // MARK: - Pieces Layer

    private func piecesLayer(squareSize: CGFloat, boardWidth: CGFloat) -> some View {
        ForEach(0..<8, id: \.self) { row in
            ForEach(0..<8, id: \.self) { col in
                let displayRow = flipped ? row : 7 - row
                let displayCol = flipped ? col : 7 - col
                let piece = board[displayRow][displayCol]
                let pos = Position(row: displayRow, col: displayCol)

                if piece != "." {
                    let x = MARGIN + CGFloat(col) * squareSize + squareSize / 2
                    let y = MARGIN + CGFloat(row) * squareSize + squareSize / 2

                    PieceImage(piece: piece, size: squareSize * 0.88)
                        .position(x: x, y: y)
                        .opacity(draggedPiece == pos ? 0.5 : 1.0)
                        .animation(.easeOut(duration: 0.26), value: pos)
                        .gesture(dragGesture(for: pos, squareSize: squareSize, boardWidth: boardWidth))
                }
            }
        }
    }

    // MARK: - Coordinate Labels

    private func coordinateLabels(squareSize: CGFloat, boardWidth: CGFloat) -> some View {
        ZStack {
            // Column labels (bottom)
            ForEach(0..<8, id: \.self) { col in
                let label = flipped ? COL_LABELS[col] : COL_LABELS[7 - col]
                Text(label)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(theme.textSecondary)
                    .position(
                        x: MARGIN + CGFloat(col) * squareSize + squareSize / 2,
                        y: MARGIN + boardWidth + 10
                    )
            }
            // Row labels (left)
            ForEach(0..<8, id: \.self) { row in
                let label = flipped ? "\(row + 1)" : "\(8 - row)"
                Text(label)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(theme.textSecondary)
                    .position(x: 10, y: MARGIN + CGFloat(7 - row) * squareSize + squareSize / 2)
            }
        }
    }

    // MARK: - Tap Gesture

    private func tapGesture(squareSize: CGFloat) -> some Gesture {
        SpatialTapGesture()
            .onEnded { value in
                guard canInteract else { return }
                let col = Int((value.location.x - MARGIN) / squareSize)
                let row = Int((value.location.y - MARGIN) / squareSize)
                guard col >= 0, col < 8, row >= 0, row < 8 else { return }
                let displayRow = flipped ? row : 7 - row
                let displayCol = flipped ? col : 7 - col
                onTap(Position(row: displayRow, col: displayCol))
            }
    }

    // MARK: - Drag Gesture

    private func dragGesture(for pos: Position, squareSize: CGFloat, boardWidth: CGFloat) -> some Gesture {
        DragGesture(minimumDistance: 5)
            .onChanged { value in
                guard canInteract else { return }
                if draggedPiece == nil {
                    draggedPiece = pos
                    HapticManager.shared.piecePickup()
                    onTap(pos)
                }
                dragOffset = value.translation
            }
            .onEnded { value in
                guard let dragged = draggedPiece else { return }
                let endX = value.location.x
                let endY = value.location.y
                let col = Int((endX - MARGIN) / squareSize)
                let row = Int((endY - MARGIN) / squareSize)

                if col >= 0, col < 8, row >= 0, row < 8 {
                    let displayRow = flipped ? row : 7 - row
                    let displayCol = flipped ? col : 7 - col
                    let target = Position(row: displayRow, col: displayCol)
                    if target != dragged {
                        onDrop?(dragged, target)
                    }
                } else {
                    HapticManager.shared.invalidDrop()
                }
                draggedPiece = nil
                dragOffset = .zero
            }
    }
}
