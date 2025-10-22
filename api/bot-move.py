# raichu.py : Play the game of Raichu
# Code by: Abhiram Kukkapali, Sanket Muchhala, Haloran Riley
# Based on skeleton code by D. Crandall, Oct 2021

from http.server import BaseHTTPRequestHandler
import json
import copy
import math
import random

max_depth = [1]
best_move_at_level = {}
successor_table = {}
max_player = ""
infinity = 9999

def board_to_string(board, N):
    return "\n".join(board[i:i+N] for i in range(0, len(board), N))

def swap(str, i, j):
    list1 = list(str)
    list1[i], list1[j] = list1[j], list1[i]
    return ''.join(list1)

def remove(str, i):
    ls = list(str)
    ls[i] = "."
    return ''.join(ls)

def replace_raichu(str, i, color):
    ls = list(str)
    if(color == "w"):
        ls[i] = "@"
    elif(color == "b"):
        ls[i] = "$"
    return ''.join(ls)

def move_pichu(pos, N, board, color):
    list_of_boards = []
    pichu = ""

    if(color=="w"):
        pichu = "b"

        if(pos%N != 0 and pos+N-1 < N*N):
            if(board[pos+N-1]=="."):
                boardCopy = copy.deepcopy(board)
                if(N*N-N <= pos+N-1):
                    boardCopy = replace_raichu(boardCopy, pos, color)
                list_of_boards.append(swap(boardCopy, pos, pos+N-1))

            elif(board[pos+N-1]==pichu and (pos+N-1)%N !=0 and pos+(N*2)-2 < N*N):
                if(board[pos+(N*2)-2]=="."):
                    boardCopy = copy.deepcopy(board)
                    if(N*N-N <=  pos+(N*2)-2):
                        boardCopy = replace_raichu(boardCopy, pos, color)
                    boardCopy = remove(boardCopy, pos+N-1)
                    list_of_boards.append(swap(boardCopy, pos, pos+(N*2)-2))

        if((pos+1)%N != 0 and pos+N+1 < N*N):
            if(board[pos+N+1]=="."):
                boardCopy = copy.deepcopy(board)
                if(N*N-N <= pos+N+1):
                    boardCopy = replace_raichu(boardCopy, pos, color)
                list_of_boards.append(swap(boardCopy, pos, pos+N+1))

            elif(board[pos+N+1]==pichu and (pos+N+1)%N !=0 and pos+(N*2)+2 < N*N):
                if(board[pos+(N*2)+2]=="."):
                    boardCopy = copy.deepcopy(board)
                    if(N*N-N <= pos+(N*2)+2):
                        boardCopy = replace_raichu(boardCopy, pos, color)
                    boardCopy = remove(boardCopy, pos+N+1)
                    list_of_boards.append(swap(boardCopy, pos, pos+(N*2)+2))

    elif(color=="b"):
        pichu="w"

        if(pos%N!=0 and pos-N-1 >= 0):
            if(board[pos-N-1]=="."):
                boardCopy = copy.deepcopy(board)
                if(N > pos-N-1):
                    boardCopy = replace_raichu(boardCopy, pos, color)
                list_of_boards.append(swap(boardCopy, pos, pos-N-1))

            elif(board[pos-N-1]==pichu and (pos-N-1)%N !=0 and pos-N*2-2 >= 0):
                if(board[pos-(N*2)-2]=="."):
                    boardCopy = copy.deepcopy(board)
                    if(N > pos-N*2-2):
                        boardCopy = replace_raichu(boardCopy, pos, color)
                    boardCopy = remove(boardCopy, pos-N-1)
                    list_of_boards.append(swap(boardCopy, pos, pos-N*2-2))

        if((pos+1)%N != 0 and pos-N+1 >= 0):
            if(board[pos-N+1]=="."):
                boardCopy = copy.deepcopy(board)
                if(N > pos-N+1):
                    boardCopy = replace_raichu(boardCopy, pos, color)
                list_of_boards.append(swap(boardCopy, pos, pos-N+1))

            elif(board[pos-N+1]==pichu and (pos-N+1)%N !=0 and pos-N*2+2 >= 0):
                if(board[pos-(N*2)+2]=="."):
                    boardCopy = copy.deepcopy(board)
                    if(N > pos-N*2+2):
                        boardCopy = replace_raichu(boardCopy, pos, color)
                    boardCopy = remove(boardCopy, pos-N+1)
                    list_of_boards.append(swap(boardCopy, pos, pos-N*2+2))

    return list_of_boards

def move_pikachu(pos, N, board, color):
    list_of_boards = []
    pichu = ""
    pikachu = ""

    if(color=="w"):
        pichu = "b"
        pikachu = "B"

        if(pos%N != 0):
            if(board[pos-1]=="."):
                boardCopy = copy.deepcopy(board)
                list_of_boards.append(swap(boardCopy, pos, pos-1))

                if((pos-1)%N != 0):
                    if(board[pos-2]=="."):
                        boardCopy = copy.deepcopy(board)
                        list_of_boards.append(swap(boardCopy, pos, pos-2))

                    elif((board[pos-2]==pichu) or ((board[pos-2]==pikachu)) and (pos-2)%N != 0):
                        if(board[pos-3]=="."):
                            boardCopy = copy.deepcopy(board)
                            boardCopy = remove(boardCopy, pos-2)
                            list_of_boards.append(swap(boardCopy, pos, pos-3))

            elif(((board[pos-1]==pichu) or (board[pos-1]==pikachu)) and (pos-1)%N != 0):
                if(board[pos-2]=="."):
                    boardCopy = copy.deepcopy(board)
                    boardCopy = remove(boardCopy, pos-1)
                    list_of_boards.append(swap(boardCopy, pos, pos-2))

        if((pos+1)%N != 0):
            if(board[pos+1]=="."):
                boardCopy = copy.deepcopy(board)
                list_of_boards.append(swap(boardCopy, pos, pos+1))

                if((pos+2)%N != 0):
                    if(board[pos+2]=="."):
                        boardCopy = copy.deepcopy(board)
                        list_of_boards.append(swap(boardCopy, pos, pos+2))

                    elif(((board[pos+2]==pichu) or (board[pos+2]==pikachu)) and (pos+3)%N != 0):
                        if(board[pos+3]=="."):
                            boardCopy = copy.deepcopy(board)
                            boardCopy = remove(boardCopy, pos+2)
                            list_of_boards.append(swap(boardCopy, pos, pos+3))

            elif(((board[pos+1]==pichu) or (board[pos+1]==pikachu)) and (pos+2)%N != 0):
                if(board[pos+2]=="."):
                    boardCopy = copy.deepcopy(board)
                    boardCopy = remove(boardCopy, pos+1)
                    list_of_boards.append(swap(boardCopy, pos, pos+2))

        if(pos+N < N*N):
            if(board[pos+N]=="."):
                boardCopy = copy.deepcopy(board)
                if(N*N-N <= pos+N):
                    boardCopy = replace_raichu(boardCopy, pos, color)
                list_of_boards.append(swap(boardCopy, pos, pos+N))

                if(pos+N+N < N*N):
                    if(board[pos+N+N]=="."):
                        boardCopy = copy.deepcopy(board)
                        if(N*N-N <= pos+N+N):
                            boardCopy = replace_raichu(boardCopy, pos, color)
                        list_of_boards.append(swap(boardCopy, pos, pos+N+N))

                    elif(((board[pos+N+N]==pichu) or (board[pos+N+N]==pikachu)) and pos+N+N+N < N*N):
                        if(board[pos+N+N+N]=="."):
                            boardCopy = copy.deepcopy(board)
                            if(N*N-N <= pos+N+N+N):
                                boardCopy = replace_raichu(boardCopy, pos, color)
                            boardCopy = remove(boardCopy, pos+N+N)
                            list_of_boards.append(swap(boardCopy, pos, pos+N+N+N))

                elif(((board[pos+N]==pichu) or (board[pos+N]==pikachu)) and pos+N+N < N*N):
                    if(board[pos+N+N]=="."):
                        boardCopy = copy.deepcopy(board)
                        if(N*N-N <= pos+N+N):
                            boardCopy = replace_raichu(boardCopy, pos, color)
                        boardCopy = remove(boardCopy, pos+N)
                        list_of_boards.append(swap(boardCopy, pos, pos+N+N))

    elif(color=="b"):
        pichu = "w"
        pikachu = "W"

        if(pos%N != 0):
            if(board[pos-1]=="."):
                boardCopy = copy.deepcopy(board)
                list_of_boards.append(swap(boardCopy, pos, pos-1))

                if((pos-1)%N != 0):
                    if(board[pos-2]=="."):
                        boardCopy = copy.deepcopy(board)
                        list_of_boards.append(swap(boardCopy, pos, pos-2))

                    elif(((board[pos-2]==pichu) or (board[pos-2]==pikachu)) and (pos-2)%N != 0):
                        if(board[pos-3]=="."):
                            boardCopy = copy.deepcopy(board)
                            boardCopy = remove(boardCopy, pos-2)
                            list_of_boards.append(swap(boardCopy, pos, pos-3))

            elif(((board[pos-1]==pichu) or (board[pos-1]==pikachu)) and (pos-1)%N != 0):
                if(board[pos-2]=="."):
                    boardCopy = copy.deepcopy(board)
                    boardCopy = remove(boardCopy, pos-1)
                    list_of_boards.append(swap(boardCopy, pos, pos-2))

        if((pos+1)%N != 0):
            if(board[pos+1]=="."):
                boardCopy = copy.deepcopy(board)
                list_of_boards.append(swap(boardCopy, pos, pos+1))

                if((pos+2)%N != 0):
                    if(board[pos+2]=="."):
                        boardCopy = copy.deepcopy(board)
                        list_of_boards.append(swap(boardCopy, pos, pos+2))

                    elif(((board[pos+2]==pichu) or (board[pos+2]==pikachu)) and (pos+3)%N != 0):
                        if(board[pos+3]=="."):
                            boardCopy = copy.deepcopy(board)
                            boardCopy = remove(boardCopy, pos+2)
                            list_of_boards.append(swap(boardCopy, pos, pos+3))

            elif((board[pos+1]==pichu) or (board[pos+1]==pikachu) and (pos+1)%N != 0):
                if(board[pos+2]=="."):
                    boardCopy = copy.deepcopy(board)
                    boardCopy = remove(boardCopy, pos+1)
                    list_of_boards.append(swap(boardCopy, pos, pos+2))

        if(pos-N >= 0):
            if(board[pos-N]=="."):
                boardCopy = copy.deepcopy(board)
                if(N > pos-N):
                    boardCopy = replace_raichu(boardCopy, pos, color)
                list_of_boards.append(swap(boardCopy, pos, pos-N))

                if(pos-N-N >= 0):
                    if(board[pos-N-N]=="."):
                        boardCopy = copy.deepcopy(board)
                        if(N > pos-N-N):
                            boardCopy = replace_raichu(boardCopy, pos, color)
                        list_of_boards.append(swap(boardCopy, pos, pos-N-N))

                    elif(((board[pos-N-N]==pichu) or (board[pos-N-N]==pikachu)) and pos-N-N-N >= 0):
                        if(board[pos-N-N-N]=="."):
                            boardCopy = copy.deepcopy(board)
                            if(N > pos-N-N-N):
                                boardCopy = replace_raichu(boardCopy, pos, color)
                            boardCopy = remove(boardCopy, pos-N-N)
                            list_of_boards.append(swap(boardCopy, pos, pos-N-N-N))

                elif(((board[pos+N] == pichu) or (board[pos+N] == pikachu)) and pos+N+N >= 0):
                    if(board[pos+N+N]=="."):
                        boardCopy = copy.deepcopy(board)
                        if(N > pos+N+N):
                            boardCopy = replace_raichu(boardCopy, pos, color)
                        boardCopy = remove(boardCopy, pos+N)
                        list_of_boards.append(swap(boardCopy, pos, pos+N+N))

    return list_of_boards

def move_raichu(pos, N, board, color):
    list_of_boards = []
    pichu = ""
    pikachu = ""
    raichu = ""

    if (color=="w"):
        pichu = "b"
        pikachu = "B"
        raichu = "$"
    elif(color=="b"):
        pichu = "w"
        pikachu = "W"
        raichu = "@"

    # Up
    piece_taken = False
    tempPos = pos - N
    tempBoard = copy.deepcopy(board)
    while(tempPos >= 0):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos-=N
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos-=N
        else:
            break

    # Down
    piece_taken = False
    tempPos = pos + N
    tempBoard = copy.deepcopy(board)
    while(tempPos < N*N):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos+=N
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos+=N
        else:
            break

    # Left
    piece_taken = False
    tempPos = pos -1
    tempBoard = copy.deepcopy(board)
    while((tempPos+1)%N != 0):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos-=1
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos-=1
        else:
            break

    # Right
    piece_taken = False
    tempPos = pos + 1
    tempBoard = copy.deepcopy(board)
    while(tempPos%N != 0):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos+=1
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos+=1
        else:
            break

    # Diagonal right up
    piece_taken = False
    tempPos = pos + 1 - N
    tempBoard = copy.deepcopy(board)
    while(tempPos%N != 0 and tempPos >= 0):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos = tempPos + 1 - N
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos = tempPos + 1 - N
        else:
            break

    # Diagonal left up
    piece_taken = False
    tempPos = pos - 1 - N
    tempBoard = copy.deepcopy(board)
    while((tempPos+1)%N != 0 and tempPos >=0):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos = tempPos - 1 - N
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos = tempPos - 1 - N
        else:
            break

    # Diagonal right down
    piece_taken = False
    tempPos = pos + 1 + N
    tempBoard = copy.deepcopy(board)
    while(tempPos%N != 0 and tempPos < N*N):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos = tempPos + 1 + N
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos = tempPos + 1 + N
        else:
            break

    # Diagonal left down
    piece_taken = False
    tempPos = pos - 1 + N
    tempBoard = copy.deepcopy(board)
    while((tempPos+1)%N != 0 and tempPos < N*N):
        if(board[tempPos]=="."):
            boardCopy = copy.deepcopy(tempBoard)
            list_of_boards.append(swap(boardCopy, pos, tempPos))
            tempPos = tempPos - 1 + N
        elif((board[tempPos] == pichu) or (board[tempPos] == pikachu) or (board[tempPos] == raichu)):
            if(piece_taken):
                break
            else:
                tempBoard = remove(tempBoard, tempPos)
                piece_taken = True
                tempPos = tempPos - 1 + N
        else:
            break

    return list_of_boards

def get_fringe(board, N, color):
    fringe = []
    for i in range(len(board)):
        if board[i] == "w" and color=="w":
            fringe += move_pichu(i, N, board, "w")
        elif board[i] == "b" and color=="b":
            fringe += move_pichu(i, N, board, "b")
        elif board[i] == "W" and color=="w":
            fringe += move_pikachu(i, N, board, "w")
        elif board[i] == "B" and color=="b":
            fringe += move_pikachu(i, N, board, "b")
        elif board[i] == "@" and color=="w":
            fringe += move_raichu(i, N, board, "w")
        elif board[i] == "$" and color=="b":
            fringe += move_raichu(i, N, board, "b")
    return fringe

def opponent(player):
    if player=="b":
        return "w"
    elif player=="w":
        return "b"

def is_goal(board):
    if(board.count("B")==0 and board.count("b")==0 and board.count("$")==0):
        return True
    if(board.count("W")==0 and board.count("w")==0 and board.count("@")==0):
        return True
    else:
        return False

def eval(board,player,N,ini_player):
    board=list(board)
    score=(board.count("w")*1)+(board.count("W")*3)+(board.count("@")*6)
    score1=(board.count("b")*1)+(board.count("B")*3)+(board.count("$")*6)
    if player==ini_player:
        return score-score1
    else:
        return -1*(score1-score)

def alpha_beta_decision(board, player,N,ini_player):
    maximum_value={}
    for s in get_fringe(board,N,player):
        v=min_val(s, opponent(player), -math.inf, math.inf, 0,N,ini_player)
        maximum_value[tuple(s)]=v
    if not maximum_value:
        return board
    a = max(maximum_value, key=maximum_value.get)
    return a

def max_val(board, player, alpha, beta, depth,N,ini_player):
    if is_goal(board) or depth>max_depth[0]:
        return eval(board,player,N,ini_player)
    alpha_dash=-math.inf
    for s in get_fringe(board,N,player):
        score_of_s=min_val(s, opponent(player), alpha, beta, depth + 1,N,ini_player)
        alpha_dash=max(score_of_s, alpha_dash)
        if alpha_dash>=beta:
            return alpha_dash
    return alpha_dash

def min_val(board, player, alpha, beta, depth,N,ini_player):
    if is_goal(board) or depth>max_depth[0]:
        return eval(board,player,N,ini_player)
    beta_dash=math.inf
    for s in get_fringe(board,N,player):
        score_of_s=max_val(s, opponent(player), alpha, beta, depth + 1,N,ini_player)
        beta_dash = min(score_of_s, beta_dash)
        if alpha>=beta_dash:
            return beta_dash
    return beta_dash

def find_best_move(board, N, player, timelimit):
    ini_player=player
    fringe = get_fringe(board,N,player)
    if not fringe:
        return board

    next_board = random.choice(fringe)

    for depth in range(2,5):
        max_depth[0]=depth
        recommended_board = alpha_beta_decision(board,player,N,ini_player)
        if is_goal(recommended_board):
            next_board = ''.join((item) for item in recommended_board)
            break
        next_board = ''.join((item) for item in recommended_board)

    return next_board

# Vercel serverless function handler
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            board = data.get('board', '')
            player = data.get('player', 'b')
            timelimit = data.get('timelimit', 10)
            N = 8  # Board size

            # Validate input
            if len(board) != N*N:
                raise Exception("Invalid board size")

            # Find best move
            best_board = find_best_move(board, N, player, timelimit)

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
