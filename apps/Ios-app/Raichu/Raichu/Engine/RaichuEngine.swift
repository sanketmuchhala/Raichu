// RaichuEngine.swift
// Raichu
// JavaScriptCore bridge to the bundled TypeScript game engine.
// The JS bundle at raichu-engine.js must expose a RaichuEngine global object.

import JavaScriptCore
import Foundation

// MARK: - RaichuEngine Bridge

final class RaichuEngine {
    static let shared = RaichuEngine()
    private let context: JSContext

    private init() {
        guard let context = JSContext() else {
            preconditionFailure("Unable to create a JSContext for the Raichu engine")
        }
        self.context = context
        context.exceptionHandler = { _, exception in
            print("[JSEngine] \(exception?.toString() ?? "unknown JS error")")
        }

        // Load bundled JS engine
        if let path = Bundle.main.path(forResource: "raichu-engine", ofType: "js"),
           let source = try? String(contentsOfFile: path, encoding: .utf8) {
            context.evaluateScript(source)
        } else {
            // If no JS bundle yet, inject a stub engine for UI development
            injectStubEngine()
        }
    }

    // MARK: - Public API

    func createInitialBoard() -> [[String]] {
        let result = context.evaluateScript("JSON.stringify(RaichuEngine.createInitialBoard())")
        return parseBoardJSON(result?.toString() ?? "null") ?? defaultBoard()
    }

    func generateMovesForPiece(board: [[String]], row: Int, col: Int) -> [Move] {
        let boardJSON = boardToJSON(board)
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.generateMovesForPiece(\(boardJSON), \(row), \(col)))"
        )
        return parseMoves(result?.toString() ?? "[]")
    }

    func generateAllMoves(board: [[String]], player: String) -> [Move] {
        let boardJSON = boardToJSON(board)
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.generateAllMoves(\(boardJSON), '\(player)'))"
        )
        return parseMoves(result?.toString() ?? "[]")
    }

    func applyMove(board: [[String]], move: Move) -> [[String]] {
        let boardJSON = boardToJSON(board)
        let moveJSON = moveToJSON(move)
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.applyMove(\(boardJSON), \(moveJSON)))"
        )
        return parseBoardJSON(result?.toString() ?? "null") ?? board
    }

    func getGameStatus(board: [[String]], nextPlayer: String) -> String {
        let boardJSON = boardToJSON(board)
        let result = context.evaluateScript(
            "RaichuEngine.getGameStatus(\(boardJSON), '\(nextPlayer)')"
        )
        return result?.toString() ?? "playing"
    }

    func findBestMove(board: [[String]], player: String, difficulty: String) -> Move? {
        let boardJSON = boardToJSON(board)
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.findBestMove(\(boardJSON), '\(player)', '\(difficulty)').move)"
        )
        guard let json = result?.toString(), json != "null", !json.isEmpty else { return nil }
        return parseSingleMove(json)
    }

    func encodeBoard(_ board: [[String]]) -> String {
        let boardJSON = boardToJSON(board)
        let result = context.evaluateScript("RaichuEngine.encodeBoard(\(boardJSON))")
        return result?.toString() ?? ""
    }

    func decodeBoard(_ encoded: String) -> [[String]] {
        let result = context.evaluateScript(
            "JSON.stringify(RaichuEngine.decodeBoard('\(encoded)'))"
        )
        return parseBoardJSON(result?.toString() ?? "null") ?? defaultBoard()
    }

    // MARK: - JSON Helpers

    private func boardToJSON(_ board: [[String]]) -> String {
        let rows = board.map { row in
            let cells = row.map { cell in "\"\(cell)\"" }.joined(separator: ",")
            return "[\(cells)]"
        }.joined(separator: ",")
        return "[\(rows)]"
    }

    private func moveToJSON(_ move: Move) -> String {
        var json = "{\"from\":{\"row\":\(move.from.row),\"col\":\(move.from.col)},"
        json += "\"to\":{\"row\":\(move.to.row),\"col\":\(move.to.col)},"
        json += "\"piece\":\"\(move.piece)\","
        if let cap = move.captured {
            json += "\"captured\":{\"position\":{\"row\":\(cap.position.row),\"col\":\(cap.position.col)},\"piece\":\"\(cap.piece)\"},"
        } else {
            json += "\"captured\":null,"
        }
        if let promo = move.promotion {
            json += "\"promotion\":\"\(promo)\""
        } else {
            json += "\"promotion\":null"
        }
        json += "}"
        return json
    }

    private func parseBoardJSON(_ json: String?) -> [[String]]? {
        guard let json, json != "null",
              let data = json.data(using: .utf8),
              let arr = try? JSONDecoder().decode([[String]].self, from: data) else {
            return nil
        }
        return arr
    }

    private func parseMoves(_ json: String) -> [Move] {
        guard let data = json.data(using: .utf8),
              let moves = try? JSONDecoder().decode([Move].self, from: data) else {
            return []
        }
        return moves
    }

    private func parseSingleMove(_ json: String) -> Move? {
        guard let data = json.data(using: .utf8),
              let move = try? JSONDecoder().decode(Move.self, from: data) else {
            return nil
        }
        return move
    }

    // MARK: - Default board (fallback when JS not yet bundled)

    func defaultBoard() -> [[String]] {
        // Starting position: row-major 8×8
        // Row 0: empty, Row 1: White Pikachus (even cols), Row 2: White Pichus (odd cols)
        // Row 5: Black Pichus (even cols), Row 6: Black Pikachus (odd cols), rest empty
        var board = Array(repeating: Array(repeating: ".", count: 8), count: 8)
        // White pieces
        for c in stride(from: 0, through: 6, by: 2) { board[1][c] = "W" }
        for c in stride(from: 1, through: 7, by: 2) { board[2][c] = "w" }
        // Black pieces
        for c in stride(from: 0, through: 6, by: 2) { board[5][c] = "b" }
        for c in stride(from: 1, through: 7, by: 2) { board[6][c] = "B" }
        return board
    }

    // MARK: - Stub Engine (UI development mode, no JS bundle)

    private func injectStubEngine() {
        let stub = """
        var RaichuEngine = {
            createInitialBoard: function() {
                var b = [];
                for(var i=0;i<8;i++){ var r=[]; for(var j=0;j<8;j++) r.push('.'); b.push(r); }
                for(var c=0;c<8;c+=2) b[1][c]='W';
                for(var c=1;c<8;c+=2) b[2][c]='w';
                for(var c=0;c<8;c+=2) b[5][c]='b';
                for(var c=1;c<8;c+=2) b[6][c]='B';
                return b;
            },
            generateMovesForPiece: function(b,r,c) { return []; },
            generateAllMoves: function(b,p) { return []; },
            applyMove: function(b,m) { return b; },
            getGameStatus: function(b,p) { return 'playing'; },
            findBestMove: function(b,p,d) { return {move:null}; },
            encodeBoard: function(b) { return b.map(function(r){return r.join('')}).join(''); },
            decodeBoard: function(s) {
                var b=[];
                for(var i=0;i<8;i++){ b.push(s.slice(i*8,(i+1)*8).split('')); }
                return b;
            }
        };
        """
        context.evaluateScript(stub)
    }
}
