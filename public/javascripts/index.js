var board = null
var game = new Chess()


async function loadModel()
{
    const bestModel = await tf.loadLayersModel(`indexeddb://bestModel`);
    if(bestModel != undefined)
    {
        console.log('loaded model current best model')
    }
    else
    {
        console.log('failed to load model this probally due to not having trained a model on this device')
        console.log('click the train button to train a new model to be able to use AlphaZero')
    }
    return bestModel
}


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


async function train()
{
    

    // var myNNet = getModel()
    // myNNet.summary()
    // await trainModel(game, 1, myNNet)
    var data = await getTraingData(1)
    console.log('data ', data)

//     const loadedModel = await tf.loadLayersModel(`indexeddb://bestModel`);
//     console.log('loaded model')

//     var output = await modelPredict(game, loadedModel)

//    var vaule = output[0]
//    var policy = output[1]
//    console.log(vaule.toString())
//    console.log(policy.toString())
}

async function makeOptimalMoveAlphaZeroTraing(myGameNumber, bestModel)
{
    var output = await getBestMoveAlphaZeroTraining(game, bestModel);
    var myPolicy = output.policy
    var bestMove = output.move
    // console.log(bestMove)
    var data = {gameNumber: myGameNumber, position: game.fen(), policy: myPolicy, result: null, turn: game.turn()}
    game.ugly_move(bestMove);
    return data

}

var getBestMoveAlphaZeroTraining = async function (game, bestModel)
{
    if(game.game_over())
    {
        return;
    }
    var myMCST = new MCST(2,160, bestModel)
    var output = (await myMCST.bestMove(game, 20, WorB, 'robust', false))
    return output;    
}


async function getTraingData(AmountOfGames)
{
    const bestModel = await loadModel()
    var data = []
    var positionsAdded = 0; 
    var numOfPositionBeforeGame = 0;


    for(var i = 0; i < AmountOfGames; i++)
    {
        console.log(i)
            async function takeTurn (thisGameNumber) {
                console.log(i + ':')
                var newData = await makeOptimalMoveAlphaZeroTraing(thisGameNumber, bestModel)
                data.push(newData) 
                positionsAdded++;
                WorB = !WorB;
                if(game.game_over() == true){
                    var gameResult = null
        
                    for(var d = numOfPositionBeforeGame; d< positionsAdded - numOfPositionBeforeGame; d++)
                    {
                        switch(game.winner()) {
                            case 1:
                             if(data[d].turn == 'w')
                             {
                                 gameResult = 1
                             }
                             else
                             {
                                 gameResult = -1
                             }
                              break;
                            case 0:
                                if(data[d].turn == 'b')
                                {
                                    gameResult = 1
                                }
                                else
                                {
                                    gameResult = -1
                                }
                              break;
                            case -1:
                                gameResult = 0
                              break;
                              case -2:
                                gameResult = 0
                              break;
                              case -3:
                                gameResult = 0
                              break;
                              case -4:
                                gameResult = 0
                              break;
                          }
                        data[d] = {gameNumber: data[d].gameNumber, position: data[d].position, policy: data[d].policy, turn: data[d].turn, result: gameResult}
                    }
                    numOfPositionBeforeGame = positionsAdded + 1
                    game.reset()
                    console.log('reset')
                }
                else{
                        takeTurn(thisGameNumber)
                }
            }
                takeTurn(i)
    }
    return data
}


//gets best move from AlphaZero
var getBestMove = async function (game) {
    const bestModel = await loadModel();
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

    var choice
    if(WorB == true)
    {
        choice = document.getElementById("whiteAI-type").options[document.getElementById("whiteAI-type").selectedIndex].text;
        switch(choice)
        {
            case 'stockfish':
                var depth = parseInt($('#search-depth-w').find(':selected').text());
                var d = new Date().getTime();
                var bestMove = minimaxRoot(depth, game, true, WorB);
                var d2 = new Date().getTime();
                var moveTime = (d2 - d);
                $('#time').text(moveTime/1000 + 's');
                return bestMove;
            case 'alphazero':
                var d = new Date().getTime();
                var myMCST = new MCST(2,160, bestModel)
                var bestMove = (await myMCST.bestMove(game, 20, WorB, 'robust', false)).move
                console.log(myMCST)
                var d2 = new Date().getTime();
                var moveTime = (d2 - d);
                $('#time').text(moveTime/1000 + 's');
                return bestMove;
            case 'random':
                possibleMoves = game.ugly_moves()
                randomIdx = Math.floor(Math.random() * possibleMoves.length);
                bestMove = possibleMoves[randomIdx]
                return bestMove;
        }
    }
    if(WorB == false)
    {
        choice = document.getElementById("blackAI-type").options[document.getElementById("blackAI-type").selectedIndex].text;
        switch(choice)
        {
            case 'stockfish':
                var depth = parseInt($('#search-depth-b').find(':selected').text());
                var d = new Date().getTime();
                var bestMove = minimaxRoot(depth, game, true, WorB);
                var d2 = new Date().getTime();
                var moveTime = (d2 - d);
                $('#time').text(moveTime/1000 + 's');
                return bestMove;
            case 'alphazero':
                var d = new Date().getTime();
                var myMCST = new MCST(2,160, bestModel)
                var bestMove = (await myMCST.bestMove(game, 20, WorB, 'robust', false)).move
                console.log(myMCST)
                var d2 = new Date().getTime();
                var moveTime = (d2 - d);
                $('#time').text(moveTime/1000 + 's');
                return bestMove;
            case 'random':
                possibleMoves = game.ugly_moves()
                randomIdx = Math.floor(Math.random() * possibleMoves.length);
                bestMove = possibleMoves[randomIdx]
                return bestMove;
        }
    }
}

//making the move on the board
async function makeOptimalMove () {
    var bestMove = await getBestMove(game);
    // console.log(bestMove)
    // console.log(game.makePretty(bestMove))
    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
};

//move history
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
            
            async function makeMove () {
            await makeOptimalMove();
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

    function resetGame()
    {
        game.reset()
    }


