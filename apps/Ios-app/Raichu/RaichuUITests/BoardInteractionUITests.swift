// BoardInteractionUITests.swift
// Drives the board far enough to see selection, legal-move indicators and a
// completed move, and writes screenshots out for visual review.

import XCTest

final class BoardInteractionUITests: XCTestCase {

    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    /// Board square centre in screen coordinates, given the board element's frame.
    private func squareCentre(in frame: CGRect, boardRow: Int, boardCol: Int) -> CGPoint {
        // totalWidth = board * 532/512, and the gutter is board * 20/512.
        let board = frame.width / (532.0 / 512.0)
        let gutter = board * (20.0 / 512.0)
        let square = board / 8.0
        // The default orientation puts White at the bottom, a 180-degree rotation.
        let screenRow = 7 - boardRow
        let screenCol = 7 - boardCol
        return CGPoint(
            x: frame.minX + gutter + (CGFloat(screenCol) + 0.5) * square,
            y: frame.minY + gutter + (CGFloat(screenRow) + 0.5) * square
        )
    }

    private func tap(_ point: CGPoint) {
        app.coordinate(withNormalizedOffset: CGVector(dx: 0, dy: 0))
            .withOffset(CGVector(dx: point.x, dy: point.y))
            .tap()
    }

    private func save(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    private func note(_ name: String, _ text: String) {
        let attachment = XCTAttachment(string: text)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    @MainActor
    func testSelectAndMoveAPiece() throws {
        let boardEl = app.otherElements["Game board"]
        XCTAssert(boardEl.waitForExistence(timeout: 10), "Board never appeared")

        let frame = boardEl.frame
        XCTAssertGreaterThan(frame.width, 100, "Board frame collapsed to \(frame)")

        // A white Pichu starts on board row 2 and advances diagonally by +row.
        let from = squareCentre(in: frame, boardRow: 2, boardCol: 1)
        let to = squareCentre(in: frame, boardRow: 3, boardCol: 2)

        note("geometry", "board frame: \(frame)  from: \(from)  to: \(to)")

        tap(from)
        Thread.sleep(forTimeInterval: 0.8)
        save("selected")

        tap(to)
        Thread.sleep(forTimeInterval: 1.5)
        save("moved")

        // The move list header only exists once a move has been played.
        XCTAssert(
            app.buttons.containing(.staticText, identifier: "Moves").firstMatch.exists
                || app.staticTexts["Moves"].exists,
            "Move history did not appear after a move"
        )
    }
}
