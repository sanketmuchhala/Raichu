// BoardView.swift
// Raichu
//
// Core 8x8 board used by the offline and online game screens.
//
// Layer order matches the web SVG (apps/web/src/components/board/Board.tsx):
//   squares -> last move -> selection -> legal targets -> coordinates ->
//   static pieces -> move flight -> dragged piece
//
// Motion is ported from the web rather than reinvented: it uses two easing
// curves and no springs, which is what keeps the two clients feeling alike.

import SwiftUI

struct BoardView: View {
    let board: [[String]]
    let selectedPiece: Position?
    let legalMoves: [Move]
    let lastMove: Move?
    /// `true` puts White's home rank at the bottom. Same meaning as the web's
    /// `boardFlipped`, which defaults to `true`.
    let flipped: Bool
    let canInteract: Bool
    var onTap: (Position) -> Void
    var onDrop: (Position, Position) -> Void

    @Environment(\.theme) private var theme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    // Drag
    @State private var dragOrigin: Position?
    @State private var dragPoint: CGPoint = .zero
    @State private var isDragging = false

    // Flight (tap-to-move slide). Suppressed for drags, where the piece is
    // already under the finger at the destination.
    @State private var flight: Flight?
    @State private var flightArrived = false
    @State private var suppressNextFlight = false
    @State private var flightTask: Task<Void, Never>?

    @State private var hasAppeared = false

    private struct Flight: Equatable {
        let move: Move
        /// Distance-aware, matching PieceMoveOverlay.tsx:
        /// `min(0.24, 0.135 + distance * 0.018)`.
        let slideDuration: Double
        /// The glyph that lands — a promoted piece arrives already promoted,
        /// exactly as the web overlay does.
        var landingPiece: String { move.promotion ?? move.piece }
    }

    var body: some View {
        GeometryReader { geo in
            let g = BoardGeometry(available: geo.size, whiteAtBottom: flipped)

            ZStack(alignment: .topLeading) {
                squares(g)
                highlights(g)
                coordinates(g)
                tapTargets(g)
                staticPieces(g)
                flightLayer(g)
                dragLayer(g)
            }
            .frame(width: g.totalWidth, height: g.totalHeight)
            .contentShape(Rectangle())
            .gesture(dragGesture(g))
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        }
        .aspectRatio(BoardMetrics.widthRatio / BoardMetrics.heightRatio, contentMode: .fit)
        .scaleEffect(hasAppeared || reduceMotion ? 1 : 0.985)
        .task {
            // Deferred a turn: a withAnimation issued during the first layout
            // pass gets dropped, which previously left the board hidden.
            await Task.yield()
            withAnimation(Motion.arrive(Motion.boardArrive)) { hasAppeared = true }
        }
        .onChange(of: lastMove) { _, move in beginFlight(for: move) }
        .onDisappear { flightTask?.cancel() }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Game board")
    }

    // MARK: - Squares

    // A single Canvas for the 64 base fills: they never animate, and 64
    // individual Views measurably costs more per board update.
    private func squares(_ g: BoardGeometry) -> some View {
        Canvas { ctx, _ in
            for row in 0..<BoardMetrics.size {
                for col in 0..<BoardMetrics.size {
                    let pos = Position(row: row, col: col)
                    let rect = CGRect(origin: g.origin(of: pos),
                                      size: CGSize(width: g.square, height: g.square))
                    // Parity is computed in board coordinates, as on the web.
                    // A 180-degree flip preserves it either way.
                    let isLight = (row + col) % 2 == 0
                    ctx.fill(Path(rect), with: .color(isLight ? theme.boardLight : theme.boardDark))
                }
            }
        }
        .frame(width: g.totalWidth, height: g.totalHeight)
        .allowsHitTesting(false)
    }

    // MARK: - Highlights

    // Lifted out of the Canvas so each can animate in. Web equivalents:
    // last-move-in, selected-in, legal-target-in, capture-target-in.
    private func highlights(_ g: BoardGeometry) -> some View {
        ZStack(alignment: .topLeading) {
            if let move = lastMove {
                ForEach([move.from, move.to], id: \.self) { pos in
                    square(at: pos, g: g)
                        .fill(theme.lastMove)
                        .transition(.opacity)
                }
            }

            if let selected = selectedPiece {
                square(at: selected, g: g)
                    .fill(theme.selected)
                    .transition(.opacity)
            }

            ForEach(legalTargets, id: \.position) { target in
                if target.isCapture {
                    Circle()
                        .strokeBorder(
                            theme.captureIndicator,
                            lineWidth: g.square * BoardMetrics.captureRingStrokeScale
                        )
                        .frame(width: g.square * BoardMetrics.captureRingRadiusScale * 2,
                               height: g.square * BoardMetrics.captureRingRadiusScale * 2)
                        .position(g.center(of: target.position))
                        .transition(.scale(scale: 0.72).combined(with: .opacity))
                } else {
                    Circle()
                        .fill(theme.legalMove)
                        .frame(width: g.square * BoardMetrics.legalDotRadiusScale * 2,
                               height: g.square * BoardMetrics.legalDotRadiusScale * 2)
                        .position(g.center(of: target.position))
                        .transition(.scale(scale: 0.35).combined(with: .opacity))
                }
            }
        }
        .frame(width: g.totalWidth, height: g.totalHeight, alignment: .topLeading)
        .animation(reduceMotion ? nil : Motion.press(Motion.legalTargetIn), value: selectedPiece)
        .animation(reduceMotion ? nil : .easeOut(duration: Motion.lastMoveIn), value: lastMove)
        .allowsHitTesting(false)
    }

    private struct LegalTarget: Hashable {
        let position: Position
        let isCapture: Bool
    }

    private var legalTargets: [LegalTarget] {
        // The selected square itself never draws an indicator, matching the web.
        var seen = Set<Position>()
        return legalMoves.compactMap { move in
            guard move.to != selectedPiece, seen.insert(move.to).inserted else { return nil }
            return LegalTarget(position: move.to, isCapture: move.captured != nil)
        }
    }

    private func square(at pos: Position, g: BoardGeometry) -> Path {
        Path(CGRect(origin: g.origin(of: pos),
                    size: CGSize(width: g.square, height: g.square)))
    }

    // MARK: - Coordinates

    // Labels follow the canonical notation in docs/game/rules-and-notation.md
    // (row 0 / col 0 is a8), so they agree with the move list on every screen.
    private func coordinates(_ g: BoardGeometry) -> some View {
        let font = Font.system(size: max(g.square * 0.17, 8), weight: .semibold)

        return ZStack(alignment: .topLeading) {
            ForEach(0..<BoardMetrics.size, id: \.self) { col in
                Text(Notation.file(col))
                    .font(font)
                    .foregroundColor(theme.textSecondary)
                    .position(
                        x: g.gutter + (CGFloat(g.screenCol(ofBoardCol: col)) + 0.5) * g.square,
                        y: g.gutter + g.board + g.gutter * 0.5
                    )
            }
            ForEach(0..<BoardMetrics.size, id: \.self) { row in
                Text("\(Notation.rank(row))")
                    .font(font)
                    .foregroundColor(theme.textSecondary)
                    .position(
                        x: g.gutter * 0.5,
                        y: g.gutter + (CGFloat(g.screenRow(ofBoardRow: row)) + 0.5) * g.square
                    )
            }
        }
        .frame(width: g.totalWidth, height: g.totalHeight, alignment: .topLeading)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }

    // MARK: - Static pieces

    private func staticPieces(_ g: BoardGeometry) -> some View {
        ZStack(alignment: .topLeading) {
            ForEach(occupiedSquares, id: \.self) { pos in
                let piece = board[pos.row][pos.col]
                PieceImage(piece: piece, size: g.square * BoardMetrics.pieceScale)
                    .position(g.center(of: pos))
                    .opacity(opacityForStaticPiece(at: pos))
            }
        }
        .frame(width: g.totalWidth, height: g.totalHeight, alignment: .topLeading)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }

    private var occupiedSquares: [Position] {
        var out: [Position] = []
        for row in board.indices {
            for col in board[row].indices where board[row][col] != "." {
                out.append(Position(row: row, col: col))
            }
        }
        return out
    }

    private func opacityForStaticPiece(at pos: Position) -> Double {
        // Hidden while it is under the finger, or while the flight overlay is
        // drawing the same piece. This must cover the *whole* flight, not just
        // the pre-arrival frame — `flightArrived` flips at the start of the
        // animation, so keying on it showed the piece at its destination while
        // the overlay was still sliding toward it.
        if isDragging, dragOrigin == pos { return 0 }
        if let flight, flight.move.to == pos { return 0 }
        return 1
    }

    // MARK: - Flight overlay

    // Ported from apps/web/src/components/board/PieceMoveOverlay.tsx.
    @ViewBuilder
    private func flightLayer(_ g: BoardGeometry) -> some View {
        if let flight {
            ZStack(alignment: .topLeading) {
                // The captured piece fades where it stood — which is not always
                // the destination square, since Raichu captures by jumping.
                if let captured = flight.move.captured {
                    PieceImage(piece: captured.piece, size: g.square * BoardMetrics.pieceScale)
                        .position(g.center(of: captured.position))
                        .opacity(flightArrived ? 0 : 1)
                        .scaleEffect(flightArrived ? 0.86 : 1)
                        .animation(.easeIn(duration: Motion.captureFade), value: flightArrived)
                }

                PieceImage(piece: flight.landingPiece, size: g.square * BoardMetrics.pieceScale)
                    .position(g.center(of: flightArrived ? flight.move.to : flight.move.from))
                    .animation(Motion.arrive(flight.slideDuration), value: flightArrived)
            }
            .frame(width: g.totalWidth, height: g.totalHeight, alignment: .topLeading)
            .allowsHitTesting(false)
        }
    }

    private func beginFlight(for move: Move?) {
        flightTask?.cancel()

        guard let move, !reduceMotion, !suppressNextFlight else {
            suppressNextFlight = false
            flight = nil
            flightArrived = true
            return
        }

        let squares = boardDistance(of: move)
        flight = Flight(move: move, slideDuration: min(0.24, 0.135 + Double(squares) * 0.018))
        flightArrived = false

        flightTask = Task { @MainActor in
            // One runloop turn so the overlay paints at its origin before it
            // animates, avoiding a first-frame flash at the destination.
            await Task.yield()
            guard !Task.isCancelled else { return }
            flightArrived = true

            // Web clears the overlay at CLEAR_MS = 300.
            try? await Task.sleep(for: .milliseconds(300))
            guard !Task.isCancelled else { return }
            flight = nil
        }
    }

    private func boardDistance(of move: Move) -> CGFloat {
        let dr = CGFloat(move.to.row - move.from.row)
        let dc = CGFloat(move.to.col - move.from.col)
        return sqrt(dr * dr + dc * dc)
    }

    // MARK: - Drag

    @ViewBuilder
    private func dragLayer(_ g: BoardGeometry) -> some View {
        if isDragging, let origin = dragOrigin {
            let piece = board[origin.row][origin.col]
            PieceImage(piece: piece, size: g.square * BoardMetrics.pieceScale)
                .scaleEffect(1.06)
                .opacity(0.98)
                .shadow(color: .black.opacity(0.36), radius: 5, x: 0, y: 6)
                .position(dragPoint)
                .allowsHitTesting(false)
                .zIndex(100)
        }
    }

    // MARK: - Tap targets

    // Each square is its own button rather than one container gesture doing its
    // own hit-testing. Composing a tap and a drag recogniser on the container
    // dropped every tap after the first, and per-square targets also give
    // VoiceOver something real to select.
    private func tapTargets(_ g: BoardGeometry) -> some View {
        ZStack(alignment: .topLeading) {
            ForEach(0..<BoardMetrics.size, id: \.self) { row in
                ForEach(0..<BoardMetrics.size, id: \.self) { col in
                    let pos = Position(row: row, col: col)
                    let origin = g.origin(of: pos)

                    Color.clear
                        .frame(width: g.square, height: g.square)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            guard canInteract, !isDragging else { return }
                            onTap(pos)
                        }
                        .offset(x: origin.x, y: origin.y)
                        .accessibilityElement()
                        .accessibilityLabel(label(for: pos))
                        .accessibilityAddTraits(accessibilityTraits(for: pos))
                }
            }
        }
        .frame(width: g.totalWidth, height: g.totalHeight, alignment: .topLeading)
    }

    private func label(for pos: Position) -> String {
        let square = Notation.square(pos)
        let piece = board.indices.contains(pos.row) && board[pos.row].indices.contains(pos.col)
            ? board[pos.row][pos.col]
            : "."

        var text = piece == "." ? "\(square), empty" : "\(square), \(PieceCatalog.name(of: piece))"
        if let target = legalTargets.first(where: { $0.position == pos }) {
            text += target.isCapture ? ", capture available" : ", legal move"
        }
        if selectedPiece == pos { text += ", selected" }
        return text
    }

    private func accessibilityTraits(for pos: Position) -> AccessibilityTraits {
        var traits: AccessibilityTraits = canInteract ? [.isButton] : []
        if selectedPiece == pos { traits.formUnion(.isSelected) }
        return traits
    }

    private func dragGesture(_ g: BoardGeometry) -> some Gesture {
        DragGesture(minimumDistance: 5)
            .onChanged { value in
                guard canInteract else { return }

                if !isDragging {
                    guard let start = g.position(at: value.startLocation),
                          board[start.row][start.col] != "." else { return }

                    dragOrigin = start
                    dragPoint = value.startLocation
                    withAnimation(Motion.arrive(Motion.dragLift)) { isDragging = true }
                    HapticManager.shared.piecePickup()
                    onTap(start)   // reveal legal targets for the lifted piece
                }
                dragPoint = value.location
            }
            .onEnded { value in
                guard canInteract, isDragging, let from = dragOrigin else {
                    isDragging = false
                    dragOrigin = nil
                    return
                }

                let target = g.position(at: value.location)
                let isLegal = target.map { t in
                    legalMoves.contains { $0.from == from && $0.to == t }
                } ?? false

                if let target, isLegal {
                    // The piece is already at the finger, so no slide is owed —
                    // the web suppresses its overlay for drags the same way.
                    suppressNextFlight = true
                    isDragging = false
                    dragOrigin = nil
                    onDrop(from, target)
                } else {
                    HapticManager.shared.invalidDrop()
                    withAnimation(Motion.arrive(Motion.dragSnapBack)) {
                        dragPoint = g.center(of: from)
                    }
                    Task { @MainActor in
                        try? await Task.sleep(for: .milliseconds(Int(Motion.dragSnapBack * 1000)))
                        isDragging = false
                        dragOrigin = nil
                    }
                }
            }
    }
}

#Preview {
    BoardView(
        board: RaichuEngine.shared.createInitialBoard(),
        selectedPiece: nil,
        legalMoves: [],
        lastMove: nil,
        flipped: true,
        canInteract: true,
        onTap: { _ in },
        onDrop: { _, _ in }
    )
    .padding()
    .background(Color(hex: "1a1a1a"))
    .environment(\.theme, ThemeConfig.classic)
}
