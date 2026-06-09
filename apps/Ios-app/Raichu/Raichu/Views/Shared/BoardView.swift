// BoardView.swift
// Raichu
// Core 8×8 board component used in offline and online game screens.

import SwiftUI

private let COL_LABELS = ["a","b","c","d","e","f","g","h"]
private let MARGIN: CGFloat = 20

// Easing for piece slide (matches web app Framer Motion config)
private let slideAnimation = Animation.timingCurve(0.25, 0.46, 0.45, 0.94, duration: 0.26)
// Easing for drag lift (80ms scale-up)
private let dragLiftAnimation = Animation.easeOut(duration: 0.08)

struct BoardView: View {
    let board: [[String]]
    let selectedPiece: Position?
    let legalMoves: [Move]
    let lastMove: Move?
    let flipped: Bool
    let canInteract: Bool
    var onTap: (Position) -> Void
    var onDrop: (Position, Position) -> Void

    @Environment(\.theme) var theme

    // Drag state
    @State private var draggedPiece: Position? = nil
    @State private var dragLocation: CGPoint = .zero   // absolute in board coords
    @State private var isDragging: Bool = false

    // Snap-back state (tracks pieces that need to animate back to origin)
    @State private var snapBackPiece: Position? = nil

    var body: some View {
        GeometryReader { geo in
            let boardWidth = min(geo.size.width, geo.size.height) - MARGIN * 2
            let squareSize = boardWidth / 8

            ZStack(alignment: .topLeading) {
                // Board squares + overlays
                boardGrid(squareSize: squareSize, boardWidth: boardWidth)
                // Coordinate labels
                coordinateLabels(squareSize: squareSize, boardWidth: boardWidth)
                // Stationary pieces (exclude the one being dragged)
                piecesLayer(squareSize: squareSize, boardWidth: boardWidth)
                // Dragged piece follows finger at zIndex 100
                if isDragging, let pos = draggedPiece {
                    let piece = board[pos.row][pos.col]
                    PieceImage(piece: piece, size: squareSize * 0.88)
                        // 80ms easeOut scale-up on drag lift (spec 6.2)
                        .scaleEffect(1.08)
                        .animation(dragLiftAnimation, value: isDragging)
                        .opacity(0.85)
                        .position(dragLocation)
                        .zIndex(100)
                        .allowsHitTesting(false)
                }
            }
            .frame(width: boardWidth + MARGIN, height: boardWidth + MARGIN)
            .contentShape(Rectangle())
            // Tap to select / move
            .gesture(tapGesture(squareSize: squareSize))
        }
        .aspectRatio(1, contentMode: .fit)
        // Board flip: 3D Y-axis rotation, 400ms spring (spec 6.2)
        // Pieces counter-rotate so they stay readable after flip
        .rotation3DEffect(
            .degrees(flipped ? 0 : 180),
            axis: (x: 0, y: 1, z: 0),
            perspective: 0.5
        )
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: flipped)
    }

    // MARK: - Board Grid (Canvas)

    private func boardGrid(squareSize: CGFloat, boardWidth: CGFloat) -> some View {
        Canvas { ctx, _ in
            for row in 0..<8 {
                for col in 0..<8 {
                    // flipped=true: black at bottom (board rotated 180°)
                    // flipped=false: white at bottom (default white perspective)
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

                    // Last move highlight (0.2 opacity)
                    if let lm = lastMove, (lm.from == pos || lm.to == pos) {
                        ctx.fill(Path(rect), with: .color(theme.lastMove))
                    }

                    // Selection highlight (0.4 opacity yellow)
                    if selectedPiece == pos {
                        ctx.fill(Path(rect), with: .color(theme.selected))
                    }

                    // Legal move indicators
                    if legalMoves.contains(where: { $0.to == pos }) {
                        let isCapture = legalMoves.first(where: { $0.to == pos })?.captured != nil
                        if isCapture {
                            // Red ring for captures
                            let strokeWidth: CGFloat = squareSize * 0.08
                            let inset = strokeWidth / 2
                            let ring = Path(ellipseIn: rect.insetBy(dx: inset, dy: inset))
                            ctx.stroke(ring, with: .color(theme.captureIndicator), lineWidth: strokeWidth)
                        } else {
                            // Small dot for quiet moves (0.2 opacity)
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
                        // Hide original while dragging; captured pieces fade out 180ms easeOut (spec 6.2)
                        .opacity(draggedPiece == pos && isDragging ? 0 : 1)
                        .animation(.easeOut(duration: 0.18), value: piece)
                        .animation(slideAnimation, value: pos)
                        // Counter-rotate pieces so they stay readable when board flips (spec 6.2)
                        .rotation3DEffect(
                            .degrees(flipped ? 0 : 180),
                            axis: (x: 0, y: 1, z: 0),
                            perspective: 0.5
                        )
                        .gesture(dragGesture(for: pos, squareSize: squareSize, boardWidth: boardWidth))
                        .zIndex(draggedPiece == pos ? 1 : 0)
                }
            }
        }
    }

    // MARK: - Coordinate Labels

    private func coordinateLabels(squareSize: CGFloat, boardWidth: CGFloat) -> some View {
        ZStack {
            // Column labels (bottom edge)
            // flipped=false (white perspective): col 0 on left = 'a'
            // flipped=true (black perspective): col 0 on left = 'h'
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
            // Row labels (left edge)
            // flipped=false (white): screen row 0 = rank 8, screen row 7 = rank 1
            // flipped=true (black): screen row 0 = rank 1, screen row 7 = rank 8
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
                guard canInteract, !isDragging else { return }
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
                if !isDragging {
                    // Lift the piece
                    draggedPiece = pos
                    isDragging = true
                    HapticManager.shared.piecePickup()
                    onTap(pos)  // select the piece so legal moves show
                }
                dragLocation = value.location
            }
            .onEnded { value in
                guard isDragging, let dragged = draggedPiece else { return }

                let col = Int((value.location.x - MARGIN) / squareSize)
                let row = Int((value.location.y - MARGIN) / squareSize)

                let validDrop = col >= 0 && col < 8 && row >= 0 && row < 8
                if validDrop {
                    let displayRow = flipped ? row : 7 - row
                    let displayCol = flipped ? col : 7 - col
                    let target = Position(row: displayRow, col: displayCol)
                    if target != dragged {
                        onDrop(dragged, target)
                    }
                } else {
                    // Out-of-bounds drop — snap back with warning haptic
                    HapticManager.shared.invalidDrop()
                }

                // Reset drag state — pieces animate back via slideAnimation
                withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                    isDragging = false
                    draggedPiece = nil
                    dragLocation = .zero
                }
            }
    }
}

#Preview {
    let board = RaichuEngine.shared.createInitialBoard()
    BoardView(
        board: board,
        selectedPiece: nil,
        legalMoves: [],
        lastMove: nil,
        flipped: false,
        canInteract: true,
        onTap: { _ in },
        onDrop: { _, _ in }
    )
    .padding()
    .background(Color(hex: "1a1a1a"))
    .environment(\.theme, ThemeConfig.classic)
}
