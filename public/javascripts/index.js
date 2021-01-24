var board = null
var game = new Chess()



async function loadModel(name)
{
    const bestModel = await tf.loadLayersModel(`indexeddb://${name}`);
    if(bestModel != undefined)
    {
        console.log('loaded ', name)
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
  
  var numberOfTrainingLoops = 2
  var numberOfTrainingGames = 3
  var numberOfEpochs = 10
  var numberOfPlayoffGames = 2;
  var numberOfCompetitors = 1;


  for(var c = 0; c < numberOfCompetitors; c++)
  {
  console.log('Competitor ' + c)

  //Load current best NN
  var myNNet = await loadModel('bestModel')
  // myNNet.summary()


  console.log('Competitor ' + c + ' started training')
  //NN trains agaist itself
  for(var q = 0; q < numberOfTrainingLoops; q++)
  {
  //NN plays itself
  if(q == 0)
  {
      var data = await getTraingData(numberOfTrainingGames, 'bestModel')
  }
  else {
      var data = await getTraingData(numberOfTrainingGames, 'model_number_' + c)
  }

  tf.util.shuffle(data)
  // console.log('train ', data)

  //Formating the data from the training session
  var input_x = []

  var input_y_result = []
  var input_y_policy = []

  for(var i = 0; i<data.length; i++)
  {
      game.newPosition(data[i].position)
      input_x.push(createGameState(game).arraySync())
      input_y_result.push(data[i].result)
      input_y_policy.push(data[i].policy)
  }

  var x_train = tf.tensor(input_x)
  //   console.log(x_train.toString())

  var y_train = [tf.tensor(input_y_result), tf.tensor(input_y_policy)]
  // console.log(y_train[0].toString())
  // console.log(y_train[1].toString())


  //Training the NN
  if(q == 0)
  {
      myNNet = myNNet
  }
  else {
      myNNet = await loadModel('model_number_' + c)
  }

  await trainModel(x_train, y_train, myNNet, numberOfEpochs, data.length, c)
  console.log('Competitor ' + c + ' finished training loop ' + q)
  await loadModel('model_number_' + c)
  }

  console.log('Competitor ' + c + ' is going to the arena')
  var matchScore = 0;
  for(var l = 0; l < numberOfPlayoffGames; l++)
  {
      game.reset()
      var bestModel = await loadModel('bestModel')
      var competitor = await loadModel('model_number_' + c) 
      if(l % 2 == 0)
      {
          viewerArena(bestModel, competitor)
          switch(game.winner()) {
              case 1:
                  matchScore+=1
                  console.log('the bestNN won as white')
                break;
              case 0:
                  matchScore-=1
                  console.log('Competitor ' + c + ' won as black')
                break;
              case -1:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as black')
                break;
                case -2:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as black')
                break;
                case -3:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as black')
                break;
                case -4:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as black')
                break;
            }
      }
      else{
          viewerArena(competitor, bestModel)
          switch(game.winner()) {
              case 1:
                  matchScore-=1
                  console.log('Competitor ' + c + ' won as white')
                break;
              case 0:
                  matchScore+=1
                  console.log('the bestNN won as black')
                break;
              case -1:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as white')
                break;
                case -2:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as white')
                break;
                case -3:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as white')
                break;
                case -4:
                  matchScore+=0
                  console.log('Competitor ' + c + ' drew as white')
                break;
            }
      }
      console.log('Competitor ' + c + ' vs bestNN match score is ' + matchScore)
  }
  if(matchScore < 0)
  {
      console.log('Competitor ' + c + ' beat the bestNN and is being promoted to the bestNN')
      var newBest = await loadModel(competitorName)
      await newBest.save(`indexeddb://bestModel`);
  }
  console.log('Competitor ' + c + ' failed to beat the bestNN and has been retired')
}
}

async function viewerArena(P1Model, P2Model)
{ 

    async function AlphaMakeMove () {
        if(WorB)
        {
            await makeOptimalMoveAlphaZeroTesting(P1Model);     
        }
        else{
            await makeOptimalMoveAlphaZeroTesting(P2Model);    
        }
        WorB = !WorB;
        if(game.game_over()==true)
        {
          return
        }
        window.setTimeout(AlphaMakeMove, 25)
    }

        board = Chessboard('myBoard', 'start');
        window.setTimeout(AlphaMakeMove, 25)
}

async function makeOptimalMoveAlphaZeroTesting(model)
{
    
    var output = await getBestMoveAlphaZeroTesting(game, model);

  if(game.game_over() == false)
  {
    var bestMove = output.move
    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
  }
}

var getBestMoveAlphaZeroTesting = async function (game, model)
{
    if(game.game_over())
    {
        return;
    }
    var myMCST = new MCST(2,160, model)
    var output = (await myMCST.bestMove(game, 20, WorB, 'robust', false))
    return output;    
}

async function makeOptimalMoveAlphaZeroTraing(myGameNumber, model)
{
    var output = await getBestMoveAlphaZeroTraining(game, model);
    var myPolicy = output.policy
    var bestMove = output.move
    // console.log(bestMove)
    var data = {gameNumber: myGameNumber, position: game.fen(), policy: myPolicy, result: null, turn: game.turn()}
    game.ugly_move(bestMove);
    return data

}

var getBestMoveAlphaZeroTraining = async function (game, model)
{
    if(game.game_over())
    {
        return;
    }
    var myMCST = new MCST(2,160, model)
    var output = (await myMCST.bestMove(game, 20, WorB, 'robust', false))
    return output;    
}

async function playGame (thisGameNumber, bestModel, data, positionsAdded) {
    var newData = await makeOptimalMoveAlphaZeroTraing(thisGameNumber, bestModel)
    data.push(newData) 
    positionsAdded++;
    WorB = !WorB;
    if(game.game_over() == true){
        var gameResult = null

        for(var d = 0; d< positionsAdded; d++)
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
        game.reset()
        // console.log(data)
    }
    else{
            await playGame(thisGameNumber, bestModel, data, positionsAdded)
    }
}


async function getTraingData(AmountOfGames, modelName)
{
    const bestModel = await loadModel(modelName)
    var data = []

    for(var i = 0; i < AmountOfGames; i++)
    {
        var gameData = []
        await playGame(i, bestModel, gameData, 0)
        data.push(...gameData)
    }
    return data
}


//gets best move from AlphaZero
var getBestMove = async function (game) {
    const bestModel = await loadModel('bestModel');
    if (game.game_over()) {
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
    if(game.game_over() == false)
    {
      game.ugly_move(bestMove);
      board.position(game.fen());
      renderMoveHistory(game.history());
    }
    if(game.game_over() == true)
    {
      window.setTimeout(displayGameResult, 500) //this is buggy allert stops code and some how would run before board updates but with this arbitray timeout the timeing seems to work
      // displayGameResult()
    }
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
          displayGameResult()
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
          displayGameResult()
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
                WorB = !WorB;
                if(game.game_over()==true)
                {
                  // displayGameResult()
                  return;
                }
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

    function displayGameResult()
    {
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
    }


    async function oldtest()
    {
        var matchScore = 0;
        for(var l = 0; l < 2; l++)
        {
            game.reset()
            const bestModel = await loadModel('bestModel')
            const competitor = await loadModel('model_number_' + 0) 
            if(l % 2 == 0)
            {
                viewerArena(bestModel, competitor)
                switch(game.winner()) {
                    case 1:
                        matchScore+=1
                        console.log('the bestNN won as white')
                      break;
                    case 0:
                        matchScore-=1
                        console.log('Competitor ' + 0 + ' won as black')
                      break;
                    case -1:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as black')
                      break;
                      case -2:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as black')
                      break;
                      case -3:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as black')
                      break;
                      case -4:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as black')
                      break;
                  }
            }
            else{
                viewerArena(competitor, bestModel)
                switch(game.winner()) {
                    case 1:
                        matchScore-=1
                        console.log('Competitor ' + 0 + ' won as white')
                      break;
                    case 0:
                        matchScore+=1
                        console.log('the bestNN won as black')
                      break;
                    case -1:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as white')
                      break;
                      case -2:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as white')
                      break;
                      case -3:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as white')
                      break;
                      case -4:
                        matchScore+=0
                        console.log('Competitor ' + 0 + ' drew as white')
                      break;
                  }
            }
            console.log('Competitor ' + 0 + ' vs bestNN match score is ' + matchScore)
        }
        if(matchScore < 0)
        {
            console.log('Competitor ' + 0 + ' beat the bestNN and is being promoted to the bestNN')
        }
        console.log('Competitor ' + 0 + ' failed to beat the bestNN and has been retired')
    }

    async function test()
    {
      const bestModel = await loadModel('bestModel')
      const competitor = await loadModel('model_number_' + 0) 
      await viewerArena(bestModel, competitor)


        console.log(game.winner())
    }