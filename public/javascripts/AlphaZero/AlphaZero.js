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
var getBestMove = function (game) {
    if (game.game_over()) {
        return;
    }
    var possibleMoves = game.ugly_moves()

    var randomIdx = Math.floor(Math.random() * possibleMoves.length)

    var bestMove = possibleMoves[randomIdx]
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
        if (game.game_over()) return false
        
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
        if (game.game_over()) return false
        
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