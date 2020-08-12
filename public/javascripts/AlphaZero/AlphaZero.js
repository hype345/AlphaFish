var board = null
var game = new Chess()
//start screen

//evaulate board will be replaced later by NN

//evuating the board
var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
};


var getPieceValue = function (piece) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') {
            return 10
        } else if (piece.type === 'r') {
            return 50
        } else if (piece.type === 'n') {
            return 30
        } else if (piece.type === 'b') {
            return 30
        } else if (piece.type === 'q') {
            return 90
        } else if (piece.type === 'k') {
            return 900
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

//for AI
class MCST_Node
{
    constructor(parent, state, action)
    {
        this.parent = parent
        this.state = state
        this.action = action
        this.vaule = 0
        this.visits = 0
        this.children = []
    }
    isLeaf()
    {
        if(this.children.length == 0)
        {
            return true
        }
        else 
        {
            return false
        }
    }
    getUCB1(biasParam) {
        // console.log("vaule: " + this.vaule)
        // console.log("visits: " + this.visits)
        // console.log("parents visits " + this.parent.visits)
        return (this.vaule / this.visits) + biasParam * Math.sqrt(Math.log(this.parent.visits) / this.visits);
      }
}
class MCST
{
    constructor(UCB1ExploreParam, rolloutTimeLimit)
    {
        this.UCB1ExploreParam = UCB1ExploreParam
        this.rolloutTimeLimit = rolloutTimeLimit
    }
    buildIntialTree(state)
    {
        this.state = state
        this.root = new MCST_Node(null, this.state.fen(), null)
        var possibleMoves = this.state.ugly_moves()
        for(var i = possibleMoves.length-1; i >= 0; i--)
        {
            this.state.ugly_move(possibleMoves[i])
            var newState = this.state.fen()
            var childNode = new MCST_Node(this.root, newState, possibleMoves[i])
            this.root.children.push(childNode)
            this.state.undo()
        }
    }
    select(node)
    {
        var current = node
        if(current.isLeaf())
        {
            if(current.visits == 0)
            {
                var vaule = this.rollout(current)
                this.backpropigate(current, vaule)
            }
            else{
                current = this.expand(current)
                var vaule = this.rollout(current)
                this.backpropigate(current, vaule)
            }
        }
        else{
            var bestChoice = null
            var maxUCB1 = -Infinity
            for(var i = 0; i < current.children.length; i++)
            {
                var currentUCB1 = current.children[i].getUCB1(this.UCB1ExploreParam)

                if(Number.isNaN(currentUCB1))
                {
                    currentUCB1 = Infinity
                }
                if(currentUCB1 > maxUCB1)
                {
                    maxUCB1 = currentUCB1
                    bestChoice = current.children[i]
                }
            }
            this.select(bestChoice)
        }

    }
    expand(node)
    {
        var OriginalState = this.state.fen()
        this.state.load(node.state)
        var possibleMoves = this.state.ugly_moves()
        for(var i = possibleMoves.length-1; i >= 0; i--)
        {
            this.state.ugly_move(possibleMoves[i])
            var newState = this.state.fen()
            var childNode = new MCST_Node(node, newState, possibleMoves[i])
            node.children.push(childNode)
            this.state.undo()
        }
        this.state.load(OriginalState)
        return node.children[possibleMoves.length-1]
    }
    rollout(node)
    {
        var time = 0
        var vaule = 0
        try{
            var nodeState = node.state
        }
        catch(err)
        {
            throw node
        }
        var OriginalState = this.state.fen()
        var nodeState = node.state
        this.state.load(nodeState)
        var d = new Date().getTime();
        while(time < this.rolloutTimeLimit && this.state.game_over() == false)
        {
        var possibleMoves = this.state.ugly_moves()
        var randomIdx = Math.floor(Math.random() * possibleMoves.length);
        var bestMove = possibleMoves[randomIdx]
        this.state.ugly_move(bestMove)
        var d2 = new Date().getTime();
        var time = (d2 - d);
        }
        // board = Chessboard('myBoard', 'start');
        // board.position(this.state.fen());
        vaule = evaluateBoard(this.state.board())
        this.state.load(OriginalState)
        return vaule
    }
    backpropigate(node, vaule)
    {
        if(!node.parent)
        {
            node.vaule += vaule
            node.visits++
            return 
        }
        else{
            node.vaule += vaule
            node.visits++
            this.backpropigate(node.parent, vaule)
        }

    }
    bestMove(state, iterations, WorB)
    {
        this.buildIntialTree(state)
        for(var i = 0; i < iterations; i++)
        {
            this.select(this.root)
        }
        var bestAction
        if(WorB)
        {
            var bestVaule = -Infinity
            for(var j = 0; j < this.root.children.length; j++)
            {
                var currentVaule = this.root.children[j].vaule/this.root.children[j].visits
                if( currentVaule > bestVaule )
                {
                    bestVaule = currentVaule
                    bestAction = this.root.children[j].action
                }
            }
        }
        else{
            var bestVaule = Infinity
            for(var j = 0; j < this.root.children.length; j++)
            {
                var currentVaule = this.root.children[j].vaule/this.root.children[j].visits
                if( currentVaule < bestVaule )
                {
                    bestVaule = currentVaule
                    bestAction = this.root.children[j].action
                }
            }
        }
        return bestAction
    }
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




//AI
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

    // possibleMoves = game.ugly_moves()
    // randomIdx = Math.floor(Math.random() * possibleMoves.length);
    // bestMove = possibleMoves[randomIdx]
    var myMCST = new MCST(2, 20)
    var bestMove = myMCST.bestMove(game, 21, WorB)
    console.log(myMCST)
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