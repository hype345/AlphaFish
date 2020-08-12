var board = null
var game = new Chess()


//start screen

//for AI
var WorB; //true = white false = black

function choseWhite()
{
    WorB = false;
    playAsWhite();
}

function choseBlack()
{
    WorB = true;
    playAsBlack();
}

function choseAIvsAI()
{
    WorB = true;
    AIvsAI();
}




//AI


//evuating the board
var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
        }
    }
    return totalEvaluation;
};

var reverseArray = function(array) {
    return array.slice().reverse();
};


var pawnEvalWhite =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval =
    [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

var bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var kingEvalBlack = reverseArray(kingEvalWhite);


var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isWhite, x ,y) {
        if (piece.type === 'p') {
            return 10 + ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
        } else if (piece.type === 'r') {
            return 50 + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
        } else if (piece.type === 'n') {
            return 30 + knightEval[y][x];
        } else if (piece.type === 'b') {
            return 30 + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
        } else if (piece.type === 'q') {
            return 90 + evalQueen[y][x];
        } else if (piece.type === 'k') {
            return 900 + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

// choosing best move

var minimaxRoot =function(depth, game, isMaximisingPlayer, player) {

    var newGameMoves = game.ugly_moves();
    var bestMove = -9999;
    var bestMoveFound;

    for(var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.ugly_move(newGameMove);
        var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer, player);
        game.undo();
        if(value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    return bestMoveFound;
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer, player) {
    positionCount++;

    if(player == true)
    {
        if (depth === 0) {
            return evaluateBoard(game.board());
        }
    }
    else{
        if (depth === 0) {
            return -evaluateBoard(game.board());
        }
    }

    var newGameMoves = game.ugly_moves();

    if (isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer, player));
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer, player));
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};


var positionCount;
var getBestMove = function (game) {
    if (game.game_over()) {
        switch(game.winner()) {
            case 1:
              alert("White won by checkmate")
              break;
            case 0:
                alert("Black won by checkmate")
              break;
            case -1:
                alert("draw by half moves")
              break;
              case -2:
                alert("draw by stalemate")
              break;
              case -3:
                alert("draw by insufficient material")
              break;
              case -4:
                alert("draw by three fold repetition")
              break;
          }
        return;
    }

    positionCount = 0;
    var depth;


    if(WorB == true)
    {
        depth = parseInt($('#search-depth-w').find(':selected').text());
    }
    if(WorB == false)
    {
        depth = parseInt($('#search-depth-b').find(':selected').text());
    }

    var d = new Date().getTime();
    var bestMove = minimaxRoot(depth, game, true, WorB);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);

    return bestMove;
};

//making the move
function makeOptimalMove () {
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
};




//board set up
var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();

    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};


function playAsWhite()
{
    function onDragStart (source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (game.game_over()) {
            switch(game.winner()) {
                case 1:
                  alert("White won by checkmate")
                  break;
                case 0:
                    alert("Black won by checkmate")
                  break;
                case -1:
                    alert("draw by half moves")
                  break;
                  case -2:
                    alert("draw by stalemate")
                  break;
                  case -3:
                    alert("draw by insufficient material")
                  break;
                  case -4:
                    alert("draw by three fold repetition")
                  break;
              }
            return;
        }
        
        // only pick up pieces for White
        if (piece.search(/^b/) !== -1) return false
        }
        
            function onDrop (source, target) {
            removeGreySquares()
        
            // see if the move is legal
            var move = game.move({
                from: source,
                to: target,
                promotion: 'q' // NOTE: always promote to a queen for example simplicity
            })
        
            // illegal move
            if (move === null) return 'snapback'
        
            renderMoveHistory(game.history());



            //makes best legal move for black
            window.setTimeout(makeOptimalMove, 250)
            }
        
            // update the board position after the piece snap
            // for castling, en passant, pawn promotion
            function onSnapEnd () {
            board.position(game.fen())
            }
        
            var whiteSquareGrey = '#a9a9a9'
            var blackSquareGrey = '#696969'
        
            function removeGreySquares () {
            $('#myBoard .square-55d63').css('background', '')
            }
        
            function greySquare (square) {
            var $square = $('#myBoard .square-' + square)
        
            var background = whiteSquareGrey
            if ($square.hasClass('black-3c85d')) {
                background = blackSquareGrey
            }
        
            $square.css('background', background)
            }
        
        
            function onMouseoverSquare (square, piece) {
            // get list of possible moves for this square
            var moves = game.moves({
                square: square,
                verbose: true
            })
        
            // exit if there are no moves available for this square
            if (moves.length === 0) return
        
            // highlight the square they moused over
            greySquare(square)
        
            // highlight the possible squares for this piece
            for (var i = 0; i < moves.length; i++) {
                greySquare(moves[i].to)
            }
            }
        
            function onMouseoutSquare (square, piece) {
            removeGreySquares()
            }
        
            
            var config = {
            draggable: true,
            position: 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            onSnapEnd: onSnapEnd
            }
            board = Chessboard('myBoard', config);
}
function playAsBlack()
{
    function onDragStart (source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (game.game_over()) {
            switch(game.winner()) {
                case 1:
                  alert("White won by checkmate")
                  break;
                case 0:
                    alert("Black won by checkmate")
                  break;
                case -1:
                    alert("draw by half moves")
                  break;
                  case -2:
                    alert("draw by stalemate")
                  break;
                  case -3:
                    alert("draw by insufficient material")
                  break;
                  case -4:
                    alert("draw by three fold repetition")
                  break;
              }
            return;
        }
        
        // only pick up pieces for White
        if (piece.search(/^w/) !== -1) return false
        }

            function onDrop (source, target) {
            removeGreySquares()
        
            // see if the move is legal
            var move = game.move({
                from: source,
                to: target,
                promotion: 'q' // NOTE: always promote to a queen for example simplicity
            })
        
            // illegal move
            if (move === null) return 'snapback'
        
            renderMoveHistory(game.history());
            //makes best legal move for black
            window.setTimeout(makeOptimalMove, 250)
            }
        
            // update the board position after the piece snap
            // for castling, en passant, pawn promotion
            function onSnapEnd () {
            board.position(game.fen())
            }
        
            var whiteSquareGrey = '#a9a9a9'
            var blackSquareGrey = '#696969'
        
            function removeGreySquares () {
            $('#myBoard .square-55d63').css('background', '')
            }
        
            function greySquare (square) {
            var $square = $('#myBoard .square-' + square)
        
            var background = whiteSquareGrey
            if ($square.hasClass('black-3c85d')) {
                background = blackSquareGrey
            }
        
            $square.css('background', background)
            }
        
        
            function onMouseoverSquare (square, piece) {
            // get list of possible moves for this square
            var moves = game.moves({
                square: square,
                verbose: true
            })
        
            // exit if there are no moves available for this square
            if (moves.length === 0) return
        
            // highlight the square they moused over
            greySquare(square)
        
            // highlight the possible squares for this piece
            for (var i = 0; i < moves.length; i++) {
                greySquare(moves[i].to)
            }
            }
        
            function onMouseoutSquare (square, piece) {
            removeGreySquares()
            }
        
            
            var config = {
            draggable: true,
            position: 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            onSnapEnd: onSnapEnd
            }
            board = Chessboard('myBoard', config);

            window.setTimeout(makeOptimalMove, 250)
}
function AIvsAI()
{
            
            function makeMove () {
            makeOptimalMove();
            renderMoveHistory(game.history());
            WorB = !WorB;
            window.setTimeout(makeMove, 250)
        }

            board = Chessboard('myBoard', 'start');
            window.setTimeout(makeMove, 250)
}


    //Util functions
    function boardFlip()
    {
        board.flip();
    }