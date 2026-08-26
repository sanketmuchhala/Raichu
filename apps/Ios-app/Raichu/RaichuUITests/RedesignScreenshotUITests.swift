// RedesignScreenshotUITests.swift
// Captures the redesigned surfaces so they can be reviewed visually.
// Not assertions about pixels — a human (or agent) reads the attachments.

import XCTest

final class RedesignScreenshotUITests: XCTestCase {

    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    private func save(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    @MainActor
    func testCaptureKeySurfaces() throws {
        XCTAssert(app.otherElements["Game board"].waitForExistence(timeout: 10))

        // New-game bottom sheet.
        app.buttons["Game settings"].firstMatch.tap()
        Thread.sleep(forTimeInterval: 1.2)
        save("new-game-sheet")

        // Exercise the mode cards.
        if app.staticTexts["Local game"].waitForExistence(timeout: 3) {
            app.staticTexts["Local game"].tap()
            Thread.sleep(forTimeInterval: 0.6)
            save("new-game-local-selected")
        }
        if app.buttons["Cancel"].waitForExistence(timeout: 3) {
            app.buttons["Cancel"].tap()
        }
        Thread.sleep(forTimeInterval: 0.8)

        // The how-to-play guide, previously unreachable in the app.
        if app.buttons["How to play"].waitForExistence(timeout: 3) {
            app.buttons["How to play"].tap()
            Thread.sleep(forTimeInterval: 1.5)
            save("guide")
            if app.buttons["Done"].waitForExistence(timeout: 3) {
                app.buttons["Done"].tap()
            }
        }
        Thread.sleep(forTimeInterval: 0.8)

        // Online tab (unauthenticated) and Profile tab.
        app.tabBars.buttons["Online"].tap()
        Thread.sleep(forTimeInterval: 1.2)
        save("lobby")

        app.tabBars.buttons["Profile"].tap()
        Thread.sleep(forTimeInterval: 1.2)
        save("auth")
    }
}
