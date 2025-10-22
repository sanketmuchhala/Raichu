# raichu.py : Play the game of Raichu
# Code by: Abhiram Kukkapali, Sanket Muchhala, Haloran Riley
# Based on skeleton code by D. Crandall, Oct 2021

from http.server import BaseHTTPRequestHandler
import json
import copy
import math
import random
from typing import List, Tuple, Dict

# Global variables for algorithm
max_depth = [1]

def swap(board_str: str, i: int, j: int) -> str:
    """Swap characters at positions i and j in the board string."""
    board_list = list(board_str)
    board_list[i], board_list[j] = board_list[j], board_list[i]
    return ''.join(board_list)

def remove(board_str: str, i: int) -> str:
    """Remove piece at position i by replacing with empty space."""
    board_list = list(board_str)
    board_list[i] = "."
    return ''.join(board_list)

def replace_raichu(board_str: str, i: int, color: str) -> str:
    """Replace piece at position i with a Raichu of given color."""
    board_list = list(board_str)
    if color == "w":
        board_list[i] = "@"
    elif color == "b":
        board_list[i] = "$"
    return ''.join(board_list)

def move_pichu(pos: int, N: int, board: str, color: str) -> List[str]:
    """Generate all possible moves for Pichu piece at given position."""
    list_of_boards = []
    pichu = "b" if color == "w" else "w"

    if color == "w":
        # White Pichu moves down
        if pos % N != 0 and pos + N - 1 < N * N:
            if board[pos + N - 1] == ".":
                board_copy = board
                if N * N - N <= pos + N - 1:
                    board_copy = replace_raichu(board_copy, pos, color)
                list_of_boards.append(swap(board_copy, pos, pos + N - 1))
            elif board[pos + N - 1] == pichu and (pos + N - 1) % N != 0 and pos + (N * 2) - 2 < N * N:
                if board[pos + (N * 2) - 2] == ".":
                    board_copy = board
                    if N * N - N <= pos + (N * 2) - 2:
                        board_copy = replace_raichu(board_copy, pos, color)
                    board_copy = remove(board_copy, pos + N - 1)
                    list_of_boards.append(swap(board_copy, pos, pos + (N * 2) - 2))

        if (pos + 1) % N != 0 and pos + N + 1 < N * N:
            if board[pos + N + 1] == ".":
                board_copy = board
                if N * N - N <= pos + N + 1:
                    board_copy = replace_raichu(board_copy, pos, color)
                list_of_boards.append(swap(board_copy, pos, pos + N + 1))
            elif board[pos + N + 1] == pichu and (pos + N + 1) % N != 0 and pos + (N * 2) + 2 < N * N:
                if board[pos + (N * 2) + 2] == ".":
                    board_copy = board
                    if N * N - N <= pos + (N * 2) + 2:
                        board_copy = replace_raichu(board_copy, pos, color)
                    board_copy = remove(board_copy, pos + N + 1)
                    list_of_boards.append(swap(board_copy, pos, pos + (N * 2) + 2))

    elif color == "b":
        # Black Pichu moves up
        if pos % N != 0 and pos - N - 1 >= 0:
            if board[pos - N - 1] == ".":
                board_copy = board
                if N > pos - N - 1:
                    board_copy = replace_raichu(board_copy, pos, color)
                list_of_boards.append(swap(board_copy, pos, pos - N - 1))
            elif board[pos - N - 1] == pichu and (pos - N - 1) % N != 0 and pos - N * 2 - 2 >= 0:
                if board[pos - (N * 2) - 2] == ".":
                    board_copy = board
                    if N > pos - N * 2 - 2:
                        board_copy = replace_raichu(board_copy, pos, color)
                    board_copy = remove(board_copy, pos - N - 1)
                    list_of_boards.append(swap(board_copy, pos, pos - N * 2 - 2))

        if (pos + 1) % N != 0 and pos - N + 1 >= 0:
            if board[pos - N + 1] == ".":
                board_copy = board
                if N > pos - N + 1:
                    board_copy = replace_raichu(board_copy, pos, color)
                list_of_boards.append(swap(board_copy, pos, pos - N + 1))
            elif board[pos - N + 1] == pichu and (pos - N + 1) % N != 0 and pos - N * 2 + 2 >= 0:
                if board[pos - (N * 2) + 2] == ".":
                    board_copy = board
                    if N > pos - N * 2 + 2:
                        board_copy = replace_raichu(board_copy, pos, color)
                    board_copy = remove(board_copy, pos - N + 1)
                    list_of_boards.append(swap(board_copy, pos, pos - N * 2 + 2))

    return list_of_boards

def move_pikachu(pos: int, N: int, board: str, color: str) -> List[str]:
    """Generate all possible moves for Pikachu piece at given position."""
    list_of_boards = []
    enemy_pichu = "b" if color == "w" else "w"
    enemy_pikachu = "B" if color == "w" else "W"

    # Left movement
    if pos % N != 0:
        if board[pos - 1] == ".":
            list_of_boards.append(swap(board, pos, pos - 1))
            if (pos - 1) % N != 0:
                if board[pos - 2] == ".":
                    list_of_boards.append(swap(board, pos, pos - 2))
                elif (board[pos - 2] == enemy_pichu or board[pos - 2] == enemy_pikachu) and (pos - 2) % N != 0:
                    if board[pos - 3] == ".":
                        board_copy = remove(board, pos - 2)
                        list_of_boards.append(swap(board_copy, pos, pos - 3))
        elif (board[pos - 1] == enemy_pichu or board[pos - 1] == enemy_pikachu) and (pos - 1) % N != 0:
            if board[pos - 2] == ".":
                board_copy = remove(board, pos - 1)
                list_of_boards.append(swap(board_copy, pos, pos - 2))

    # Right movement
    if (pos + 1) % N != 0:
        if board[pos + 1] == ".":
            list_of_boards.append(swap(board, pos, pos + 1))
            if (pos + 2) % N != 0:
                if board[pos + 2] == ".":
                    list_of_boards.append(swap(board, pos, pos + 2))
                elif (board[pos + 2] == enemy_pichu or board[pos + 2] == enemy_pikachu) and (pos + 3) % N != 0:
                    if board[pos + 3] == ".":
                        board_copy = remove(board, pos + 2)
                        list_of_boards.append(swap(board_copy, pos, pos + 3))
        elif (board[pos + 1] == enemy_pichu or board[pos + 1] == enemy_pikachu) and (pos + 2) % N != 0:
            if board[pos + 2] == ".":
                board_copy = remove(board, pos + 1)
                list_of_boards.append(swap(board_copy, pos, pos + 2))

    # Forward movement (direction depends on color)
    forward_dir = N if color == "w" else -N
    if 0 <= pos + forward_dir < N * N:
        if board[pos + forward_dir] == ".":
            board_copy = board
            if (color == "w" and N * N - N <= pos + forward_dir) or (color == "b" and N > pos + forward_dir):
                board_copy = replace_raichu(board_copy, pos, color)
            list_of_boards.append(swap(board_copy, pos, pos + forward_dir))

            if 0 <= pos + forward_dir * 2 < N * N:
                if board[pos + forward_dir * 2] == ".":
                    board_copy = board
                    if (color == "w" and N * N - N <= pos + forward_dir * 2) or (color == "b" and N > pos + forward_dir * 2):
                        board_copy = replace_raichu(board_copy, pos, color)
                    list_of_boards.append(swap(board_copy, pos, pos + forward_dir * 2))
                elif (board[pos + forward_dir * 2] == enemy_pichu or board[pos + forward_dir * 2] == enemy_pikachu) and 0 <= pos + forward_dir * 3 < N * N:
                    if board[pos + forward_dir * 3] == ".":
                        board_copy = board
                        if (color == "w" and N * N - N <= pos + forward_dir * 3) or (color == "b" and N > pos + forward_dir * 3):
                            board_copy = replace_raichu(board_copy, pos, color)
                        board_copy = remove(board_copy, pos + forward_dir * 2)
                        list_of_boards.append(swap(board_copy, pos, pos + forward_dir * 3))
        elif (board[pos + forward_dir] == enemy_pichu or board[pos + forward_dir] == enemy_pikachu) and 0 <= pos + forward_dir * 2 < N * N:
            if board[pos + forward_dir * 2] == ".":
                board_copy = board
                if (color == "w" and N * N - N <= pos + forward_dir * 2) or (color == "b" and N > pos + forward_dir * 2):
                    board_copy = replace_raichu(board_copy, pos, color)
                board_copy = remove(board_copy, pos + forward_dir)
                list_of_boards.append(swap(board_copy, pos, pos + forward_dir * 2))

    return list_of_boards

def move_raichu(pos: int, N: int, board: str, color: str) -> List[str]:
    """Generate all possible moves for Raichu piece at given position."""
    list_of_boards = []
    enemy_pieces = {"b", "B", "$"} if color == "w" else {"w", "W", "@"}

    # 8 directions: up, down, left, right, and 4 diagonals
    directions = [
        (-N, lambda p: p >= 0),  # up
        (N, lambda p: p < N * N),  # down
        (-1, lambda p: (p + 1) % N != 0),  # left
        (1, lambda p: p % N != 0),  # right
        (1 - N, lambda p: p % N != 0 and p >= 0),  # diagonal right up
        (-1 - N, lambda p: (p + 1) % N != 0 and p >= 0),  # diagonal left up
        (1 + N, lambda p: p % N != 0 and p < N * N),  # diagonal right down
        (-1 + N, lambda p: (p + 1) % N != 0 and p < N * N)  # diagonal left down
    ]

    for delta, is_valid in directions:
        piece_taken = False
        temp_pos = pos + delta
        temp_board = board

        while is_valid(temp_pos):
            if board[temp_pos] == ".":
                board_copy = temp_board
                list_of_boards.append(swap(board_copy, pos, temp_pos))
                temp_pos += delta
            elif board[temp_pos] in enemy_pieces:
                if piece_taken:
                    break
                else:
                    temp_board = remove(temp_board, temp_pos)
                    piece_taken = True
                    temp_pos += delta
            else:
                break

    return list_of_boards

def get_fringe(board: str, N: int, color: str) -> List[str]:
    """Generate all possible successor states for the given player."""
    fringe = []
    for i in range(len(board)):
        if board[i] == "w" and color == "w":
            fringe.extend(move_pichu(i, N, board, "w"))
        elif board[i] == "b" and color == "b":
            fringe.extend(move_pichu(i, N, board, "b"))
        elif board[i] == "W" and color == "w":
            fringe.extend(move_pikachu(i, N, board, "w"))
        elif board[i] == "B" and color == "b":
            fringe.extend(move_pikachu(i, N, board, "b"))
        elif board[i] == "@" and color == "w":
            fringe.extend(move_raichu(i, N, board, "w"))
        elif board[i] == "$" and color == "b":
            fringe.extend(move_raichu(i, N, board, "b"))
    return fringe

def opponent(player: str) -> str:
    """Return the opponent of the given player."""
    return "w" if player == "b" else "b"

def is_goal(board: str) -> bool:
    """Check if the game has ended (one player has no pieces left)."""
    black_pieces = board.count("B") + board.count("b") + board.count("$")
    white_pieces = board.count("W") + board.count("w") + board.count("@")
    return black_pieces == 0 or white_pieces == 0

def eval_board(board: str, player: str, ini_player: str) -> int:
    """Evaluate the board state for the given player."""
    score_white = board.count("w") * 1 + board.count("W") * 3 + board.count("@") * 6
    score_black = board.count("b") * 1 + board.count("B") * 3 + board.count("$") * 6

    if player == ini_player:
        return score_white - score_black if ini_player == "w" else score_black - score_white
    else:
        return score_black - score_white if ini_player == "w" else score_white - score_black

def alpha_beta_decision(board: str, player: str, N: int, ini_player: str) -> str:
    """Find the best move using alpha-beta pruning."""
    fringe = get_fringe(board, N, player)
    if not fringe:
        return board

    maximum_value: Dict[str, float] = {}
    for successor in fringe:
        value = min_val(successor, opponent(player), -math.inf, math.inf, 0, N, ini_player)
        maximum_value[successor] = value

    if not maximum_value:
        return board

    return max(maximum_value, key=maximum_value.get)  # type: ignore

def max_val(board: str, player: str, alpha: float, beta: float, depth: int, N: int, ini_player: str) -> float:
    """Maximizing player in minimax algorithm."""
    if is_goal(board) or depth > max_depth[0]:
        return float(eval_board(board, player, ini_player))

    alpha_dash = -math.inf
    for successor in get_fringe(board, N, player):
        score = min_val(successor, opponent(player), alpha, beta, depth + 1, N, ini_player)
        alpha_dash = max(score, alpha_dash)
        if alpha_dash >= beta:
            return alpha_dash
    return alpha_dash

def min_val(board: str, player: str, alpha: float, beta: float, depth: int, N: int, ini_player: str) -> float:
    """Minimizing player in minimax algorithm."""
    if is_goal(board) or depth > max_depth[0]:
        return float(eval_board(board, player, ini_player))

    beta_dash = math.inf
    for successor in get_fringe(board, N, player):
        score = max_val(successor, opponent(player), alpha, beta, depth + 1, N, ini_player)
        beta_dash = min(score, beta_dash)
        if alpha >= beta_dash:
            return beta_dash
    return beta_dash

def find_best_move(board: str, N: int, player: str, timelimit: int) -> str:
    """Find the best move using iterative deepening with alpha-beta pruning."""
    ini_player = player
    fringe = get_fringe(board, N, player)

    if not fringe:
        return board

    next_board = random.choice(fringe)

    # Iterative deepening - reduced depth for faster performance
    for depth in range(1, 3):  # Reduced from range(2, 5) for speed
        max_depth[0] = depth
        recommended_board = alpha_beta_decision(board, player, N, ini_player)

        if is_goal(recommended_board):
            next_board = recommended_board
            break

        next_board = recommended_board

    return next_board

# Vercel serverless function handler
class handler(BaseHTTPRequestHandler):
    """Handler for Vercel serverless function."""

    def do_POST(self) -> None:
        """Handle POST requests for bot moves."""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            board = data.get('board', '')
            player = data.get('player', 'b')
            timelimit = data.get('timelimit', 10)
            N = 8  # Board size is fixed at 8x8

            # Validate input
            if len(board) != N * N:
                raise ValueError(f"Invalid board size: {len(board)}, expected {N * N}")

            # Find best move
            best_board = find_best_move(board, N, player, timelimit)

            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'board': best_board,
                'player': player
            }

            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            error_response = {
                'error': str(e)
            }

            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_OPTIONS(self) -> None:
        """Handle OPTIONS requests for CORS preflight."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
