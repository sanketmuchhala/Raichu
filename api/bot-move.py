from http.server import BaseHTTPRequestHandler
import json
import copy
import time

# Constants
INFINITY = 9999
N = 8

def board_to_list(board_str):
    """Convert board string to list"""
    return list(board_str)

def board_to_string(board_list):
    """Convert board list to string"""
    return ''.join(board_list)

def opponent(player):
    """Get opponent player"""
    return 'b' if player == 'w' else 'w'

def is_white_piece(piece):
    """Check if piece is white"""
    return piece in ['w', 'W', '@']

def get_piece_color(piece):
    """Get piece color"""
    return 'w' if is_white_piece(piece) else 'b'

def eval_board(board, player):
    """Evaluate board position"""
    piece_values = {
        'w': 1, 'W': 3, '@': 6,
        'b': 1, 'B': 3, '$': 6
    }

    score = 0
    for piece in board:
        if piece in piece_values:
            value = piece_values[piece]
            if get_piece_color(piece) == player:
                score += value
            else:
                score -= value

    return score

def move_pichu(board, pos, color):
    """Generate all possible moves for Pichu"""
    moves = []
    row = pos // N
    col = pos % N
    direction = 1 if color == 'w' else -1
    enemy_color = 'b' if color == 'w' else 'w'

    # Diagonal forward moves
    for dc in [-1, 1]:
        new_row = row + direction
        new_col = col + dc

        if 0 <= new_row < N and 0 <= new_col < N:
            new_pos = new_row * N + new_col

            # Empty square - can move
            if board[new_pos] == '.':
                new_board = board[:]
                new_board[new_pos] = board[pos]
                new_board[pos] = '.'

                # Check for promotion
                if (color == 'w' and new_row == N - 1) or (color == 'b' and new_row == 0):
                    new_board[new_pos] = '@' if color == 'w' else '$'

                moves.append(board_to_string(new_board))

            # Enemy piece - check for jump
            elif get_piece_color(board[new_pos]) == enemy_color:
                jump_row = new_row + direction
                jump_col = new_col + dc

                if 0 <= jump_row < N and 0 <= jump_col < N:
                    jump_pos = jump_row * N + jump_col

                    if board[jump_pos] == '.':
                        new_board = board[:]
                        new_board[jump_pos] = board[pos]
                        new_board[pos] = '.'
                        new_board[new_pos] = '.'  # Remove captured piece

                        # Check for promotion
                        if (color == 'w' and jump_row == N - 1) or (color == 'b' and jump_row == 0):
                            new_board[jump_pos] = '@' if color == 'w' else '$'

                        moves.append(board_to_string(new_board))

    return moves

def move_pikachu(board, pos, color):
    """Generate all possible moves for Pikachu"""
    moves = []
    row = pos // N
    col = pos % N
    enemy_color = 'b' if color == 'w' else 'w'

    directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

    for dr, dc in directions:
        # Try distances 1 and 2
        for distance in [1, 2]:
            new_row = row + dr * distance
            new_col = col + dc * distance

            if 0 <= new_row < N and 0 <= new_col < N:
                new_pos = new_row * N + new_col

                # Check intermediate square for distance 2
                if distance == 2:
                    mid_row = row + dr
                    mid_col = col + dc
                    mid_pos = mid_row * N + mid_col
                    mid_piece = board[mid_pos]

                    if mid_piece != '.':
                        # Can jump over enemy
                        if get_piece_color(mid_piece) == enemy_color and board[new_pos] == '.':
                            new_board = board[:]
                            new_board[new_pos] = board[pos]
                            new_board[pos] = '.'
                            new_board[mid_pos] = '.'  # Remove captured piece
                            moves.append(board_to_string(new_board))
                        break

                # Empty square
                if board[new_pos] == '.':
                    new_board = board[:]
                    new_board[new_pos] = board[pos]
                    new_board[pos] = '.'
                    moves.append(board_to_string(new_board))
                elif get_piece_color(board[new_pos]) == color:
                    # Own piece blocks
                    break
                else:
                    # Enemy piece blocks (can't capture without jumping)
                    break

    return moves

def move_raichu(board, pos, color):
    """Generate all possible moves for Raichu (like a queen)"""
    moves = []
    row = pos // N
    col = pos % N
    enemy_color = 'b' if color == 'w' else 'w'

    directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

    for dr, dc in directions:
        enemy_found = False
        enemy_pos = None

        for distance in range(1, N):
            new_row = row + dr * distance
            new_col = col + dc * distance

            if not (0 <= new_row < N and 0 <= new_col < N):
                break

            new_pos = new_row * N + new_col
            piece = board[new_pos]

            if piece == '.':
                new_board = board[:]
                new_board[new_pos] = board[pos]
                new_board[pos] = '.'

                # If we jumped over an enemy, remove it
                if enemy_found:
                    new_board[enemy_pos] = '.'

                moves.append(board_to_string(new_board))
            elif get_piece_color(piece) == enemy_color:
                if not enemy_found:
                    enemy_found = True
                    enemy_pos = new_pos
                else:
                    # Second enemy piece, can't jump
                    break
            else:
                # Own piece blocks
                break

    return moves

def get_successors(board_str, player):
    """Generate all possible successor states"""
    board = board_to_list(board_str)
    successors = []

    for pos in range(N * N):
        piece = board[pos]

        if piece == '.' or get_piece_color(piece) != player:
            continue

        piece_lower = piece.lower()

        if piece_lower == 'w' or piece_lower == 'b':
            # Pichu
            moves = move_pichu(board, pos, player)
        elif piece_lower == 'w' or piece_lower == 'b':
            # This handles the uppercase versions
            if piece == 'W' or piece == 'B':
                # Pikachu
                moves = move_pikachu(board, pos, player)
            else:
                moves = move_pichu(board, pos, player)
        else:
            # Raichu
            if piece == '@' or piece == '$':
                moves = move_raichu(board, pos, player)
            elif piece == 'W' or piece == 'B':
                moves = move_pikachu(board, pos, player)
            else:
                moves = move_pichu(board, pos, player)

        successors.extend(moves)

    return successors

def is_terminal(board_str):
    """Check if game is over"""
    board = board_to_list(board_str)
    white_count = sum(1 for p in board if is_white_piece(p))
    black_count = sum(1 for p in board if p in ['b', 'B', '$'])

    return white_count == 0 or black_count == 0

def minimax_alpha_beta(board_str, player, depth, alpha, beta, maximizing, start_time, time_limit):
    """Minimax with alpha-beta pruning"""
    # Check time limit
    if time.time() - start_time > time_limit:
        return eval_board(board_to_list(board_str), player), board_str

    # Terminal conditions
    if depth == 0 or is_terminal(board_str):
        return eval_board(board_to_list(board_str), player), board_str

    successors = get_successors(board_str, player if maximizing else opponent(player))

    if not successors:
        return eval_board(board_to_list(board_str), player), board_str

    if maximizing:
        max_eval = -INFINITY
        best_move = board_str

        for successor in successors:
            eval_score, _ = minimax_alpha_beta(successor, player, depth - 1, alpha, beta, False, start_time, time_limit)

            if eval_score > max_eval:
                max_eval = eval_score
                best_move = successor

            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break

        return max_eval, best_move
    else:
        min_eval = INFINITY
        best_move = board_str

        for successor in successors:
            eval_score, _ = minimax_alpha_beta(successor, player, depth - 1, alpha, beta, True, start_time, time_limit)

            if eval_score < min_eval:
                min_eval = eval_score
                best_move = successor

            beta = min(beta, eval_score)
            if beta <= alpha:
                break

        return min_eval, best_move

def find_best_move(board_str, player, time_limit=10):
    """Find best move using iterative deepening"""
    start_time = time.time()
    best_move = board_str

    # Try increasing depths
    for depth in range(1, 6):
        if time.time() - start_time > time_limit * 0.8:
            break

        try:
            _, move = minimax_alpha_beta(board_str, player, depth, -INFINITY, INFINITY, True, start_time, time_limit * 0.9)
            if move != board_str:
                best_move = move
        except:
            break

    return best_move

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            board = data.get('board', '')
            player = data.get('player', 'b')
            time_limit = data.get('timelimit', 10)

            # Find best move
            best_board = find_best_move(board, player, time_limit)

            # Send response
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
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            error_response = {
                'error': str(e)
            }

            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
