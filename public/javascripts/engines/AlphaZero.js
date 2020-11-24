//evuating the board
var evaluateBoardAlphaZero = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValueAlphaZero(board[i][j]);
        }
    }
    return totalEvaluation;
};


var getPieceValueAlphaZero = function (piece) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') {
            return 1
        } else if (piece.type === 'r') {
            return 5
        } else if (piece.type === 'n') {
            return 3
        } else if (piece.type === 'b') {
            return 3
        } else if (piece.type === 'q') {
            return 9
        } else if (piece.type === 'k') {
            return 90
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

function getModel() {
    const input = tf.input({shape: [8,8,12]});

    var x = tf.layers.conv2d({
        filters: 256,
        kernelSize: [3,3],
        padding: 'same',
        activation: 'linear'
    }).apply(input)

    x = tf.layers.batchNormalization({asix: 3}).apply(x);

    x = tf.layers.leakyReLU().apply(x);

    for(var i = 0; i < 4; i ++)
    {
        x = res_layer(x)
    }
      
    var vaule_head = vauleHead(x)
    var policy_head = policyHead(x, 64) // rn it is 64 so probability of piece to move instead of probalitlity of accual move which would be 4672 but I cant train that with current reasources

    const model = tf.model({inputs: input, outputs: [vaule_head, policy_head]});


    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: [tf.metrics.categoricalCrossentropy ,tf.losses.meanSquaredError],
        metrics: ['acc'],
      });

              return model
  }

  function conv_layer(x)
  {
    x = tf.layers.conv2d({
        filters: 256,
        kernelSize: [3,3],
        padding: 'same',
        activation: 'linear'
    }).apply(x)

    x = tf.layers.batchNormalization({asix: 3}).apply(x);

    x = tf.layers.leakyReLU().apply(x);

    return x
  }
  function res_layer(input_block)
  {

    x = conv_layer(input_block)

    x = tf.layers.conv2d({
        filters: 256,
        kernelSize: [3,3],
        padding: 'same',
        activation: 'linear'
    }).apply(x)

    x = tf.layers.batchNormalization({asix: 3}).apply(x);

    x = tf.layers.add().apply([input_block, x])

    x = tf.layers.leakyReLU().apply(x);

    return x

  }
  function vauleHead(x)
  {
    x = tf.layers.conv2d({
        filters: 256,
        kernelSize: [3,3],
        padding: 'same',
        activation: 'linear'
    }).apply(x)

    x = tf.layers.batchNormalization({asix: 3}).apply(x);

    x = tf.layers.leakyReLU().apply(x);

    x = tf.layers.flatten().apply(x)

    x = tf.layers.dense({units: 256, activation: 'linear'}).apply(x)

    x = tf.layers.leakyReLU().apply(x);

    x = tf.layers.dense({units: 1, activation: 'tanh', name: 'vaule_head'}).apply(x)

    return x

  }
  function policyHead(x, actionSize)
  {
    x = tf.layers.conv2d({
        filters: 256,
        kernelSize: [3,3],
        padding: 'same',
        activation: 'linear'
    }).apply(x)

    x = tf.layers.batchNormalization({asix: 3}).apply(x);

    x = tf.layers.leakyReLU().apply(x);

    x = tf.layers.flatten().apply(x)

    x = tf.layers.dense({units: actionSize, activation: 'softmax', name: 'policy_head'}).apply(x)

    return x

  }

  function createGameState(game) //rn the state has no history but could try adding hisotry but to save reasourses trying without a history
  {
    
    var board = game.board()
    var turn = game.turn()

    //Input stack
    //8 * 8 board with depth of 12 layers
    //white pawn 0
    // white rook 1
    // white knight 2
    // white bishup 3
    // white queen 4 
    // white king 5
    // black pawn 6
    // black rook 7 
    // black knight 8
    // black bishup 9
    // black queen 10
    // black king 11

    // turn all 1s if whites turn all 0 if blacks turn 12 -- removed now just alway have current player as white

    // Not added yet
    //two layers for repeitions
    // two layers for pepetition counters
    // four castling layers
    // total move count layer
    //no progress count -not sure what this is


    var tensor = tf.zeros([8,8,12]).arraySync()

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var piece = board[i][j];
        if(turn == 'w')
        {
            // console.log('white to move')
                if (piece === null) {
                //tensor[i][j][0]
                    }
                else if (piece.type === 'p') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][0] = 1;
                    }
                    else{
                        tensor[i][j][6] = 1;
                    }
                } else if (piece.type === 'r') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][1] = 1;
                    }
                    else{
                        tensor[i][j][7] = 1;
                    }
                } else if (piece.type === 'n') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][2] = 1;
                    }
                    else{
                        tensor[i][j][8] = 1;
                    }
                } else if (piece.type === 'b') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][3] = 1;
                    }
                    else{
                        tensor[i][j][9] = 1;
                    }
                } else if (piece.type === 'q') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][4] = 1;
                    }
                    else{
                        tensor[i][j][10] = 1;
                    }
                } else if (piece.type === 'k') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][5] = 1;
                    }
                    else{
                       tensor[i][j][11] = 1;
                    }
                }
        }
        if(turn == 'b')
        {
            // console.log('black to move')
            if (piece === null) {
                //tensor[i][j][0]
                    }
                else if (piece.type === 'p') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][6] = 1;
                    }
                    else{
                        tensor[i][j][0] = 1;
                    }
                } else if (piece.type === 'r') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][7] = 1;
                    }
                    else{
                        tensor[i][j][1] = 1;
                    }
                } else if (piece.type === 'n') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][8] = 1;
                    }
                    else{
                        tensor[i][j][2] = 1;
                    }
                } else if (piece.type === 'b') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][9] = 1;
                    }
                    else{
                        tensor[i][j][3] = 1;
                    }
                } else if (piece.type === 'q') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][10] = 1;
                    }
                    else{
                        tensor[i][j][4] = 1;
                    }
                } else if (piece.type === 'k') {
                    if(piece.color === 'w')
                    {
                        tensor[i][j][11] = 1;
                    }
                    else{
                       tensor[i][j][5] = 1;
                    }
                }   
        }
    }
  }
  var stackedState = tf.tensor(tensor)

  return stackedState
  }

  
  async function trainModel(x_train, y_train, model, numEpochs, myBatchSize, myModelNumber)
  {

    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {name: 'Model Training', styles: { height: '1000px' }   };
    const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);


    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: [tf.metrics.categoricalCrossentropy ,tf.losses.meanSquaredError],
        metrics: [tf.metrics.categoricalCrossentropy ,tf.losses.meanSquaredError],
      });


     await model.fit(x_train, y_train, {
        batchSize: myBatchSize,
        epochs: numEpochs,
        shuffle: true,
        callbacks: fitCallbacks
      });

      var modelNumber = myModelNumber;

      var name = 'model_number_' + modelNumber

      const saveResults = await model.save(`indexeddb://${name}`);
      console.log('model saved as ' + name)
  }

  async function modelPredict(input, model)
  {
     var predictionData = []
     predictionData.push(createGameState(input).arraySync())

     var finalInput = tf.tensor(predictionData)

    //  console.log(finalInput.toString())

    var output = await model.predict(finalInput)

    return output
  }

//for AI
class MCST_Node
{
    constructor(parent, state, action, childrenPolicy)
    {
        this.parent = parent
        this.state = state
        this.action = action
        this.childrenPolicy = childrenPolicy
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
    getUCB1(biasParam, WorB, policy) {
        // console.log('vaule: ', this.vaule)
        // console.log('visits: ', this.visits)
        // console.log('parent visits: ', this.parent.visits)
        // console.log('policy', policy)

        if(WorB)
        {
            return (this.vaule / this.visits) + biasParam * (1 + policy) * Math.sqrt(Math.log(this.parent.visits) / this.visits);
        }
        else{
            return (this.vaule / this.visits) - biasParam * (1 + policy) * Math.sqrt(Math.log(this.parent.visits) / this.visits);
        }
        
      }
}

async function buildMCST(UCB1ExploreParam, rolloutTimeLimit, modelName)
{
    const model = await tf.loadLayersModel(`indexeddb://${modelName}`);
    if(model != undefined)
    {
        console.log('loaded model' + modelName)
    }
    else
    {
        console.log('failed to load model ' + modelName)
    }

    // model.summary()

    return new MCST(UCB1ExploreParam, rolloutTimeLimit, model)
}
class MCST
{
    constructor(UCB1ExploreParam, rolloutTimeLimit, model)
    {
        this.UCB1ExploreParam = UCB1ExploreParam
        this.rolloutTimeLimit = rolloutTimeLimit
        this.model = model
    }
    async buildIntialTree(state)
    {
        this.state = state

        var output = await modelPredict(this.state, this.model)

        var policyArry = output[1].arraySync()

        this.root = new MCST_Node(null, this.state.fen(), null, policyArry[0])
        var possibleMoves = this.state.ugly_moves()
        for(var i = possibleMoves.length-1; i >= 0; i--)
        {
            this.state.ugly_move(possibleMoves[i])

            // var output2 = await modelPredict(this.state, this.model)

            // var policyArry2 = output2[1].arraySync()

            var newState = this.state.fen()
            var childNode = new MCST_Node(this.root, newState, possibleMoves[i], null)
            this.root.children.push(childNode)
            this.state.undo()
        }
    }
    async select(node, WorB, random)
    {
        var current = node
        if(current.isLeaf())
        {
            if(current.visits == 0)
            {
                var output = await this.rollout(current, random)
                var vaule = output[0].arraySync()
                var policy = output[1].arraySync()
                current.childrenPolicy = policy[0]
                this.backpropigate(current, vaule[0][0])
            }
            else
            {
                current = await this.expand(current)
                var output = await this.rollout(current, random)
                var vaule = output[0].arraySync()
                var policy = output[1].arraySync()
                current.childrenPolicy = policy[0]
                this.backpropigate(current, vaule[0][0])
            }
        }
        else{
            var turn = current.state.split(' ')
            turn = turn[1]
            if(turn == 'w')
            {
            WorB = true
            }
            else{
                WorB = false
            }

            if(WorB)
            {
                var bestChoice = null
                var maxUCB1 = -Infinity
                for(var i = 0; i < current.children.length; i++)
                {
                    // console.log(i)
                    // console.log(typeof(this.state.makePretty(current.children[i].action)))
                    // console.log((this.state.makePretty(current.children[i].action)))
                    // console.log(current.children[i].action)
                    var currentUCB1 = await current.children[i].getUCB1(this.UCB1ExploreParam, WorB, current.childrenPolicy[this.state.makePretty(current.children[i].action)])
                    // console.log(`w - node ${i}: ${currentUCB1}`)
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
                await this.select(bestChoice, WorB, random)
            }
            else{
                var bestChoice = null
                var minUCB1 = Infinity
                for(var i = 0; i < current.children.length; i++)
                {
                    // console.log(typeof(this.state.makePretty(current.children[i].action)))
                    var currentUCB1 = await current.children[i].getUCB1(this.UCB1ExploreParam, WorB, current.childrenPolicy[this.state.makePretty(current.children[i].action)])
                    // console.log(`b - node ${i}: ${currentUCB1}`)
                    if(Number.isNaN(currentUCB1))
                    {
                        currentUCB1 = -Infinity
                    }
                    if(currentUCB1 < minUCB1)
                    {
                        minUCB1 = currentUCB1
                        bestChoice = current.children[i]
                    }
                }
                await this.select(bestChoice, WorB, random)
            }
        }

    }
    async expand(node)
    {
        var OriginalState = this.state.fen()
        this.state.load(node.state)
        var possibleMoves = this.state.ugly_moves()
        if(possibleMoves.length == 0)
        {
            console.log('expand failed off this state:')
            console.log(node.state)
            this.state.load(OriginalState)
            return node
        }
        for(var i = possibleMoves.length-1; i >= 0; i--)
        {
            this.state.ugly_move(possibleMoves[i])
            var newState = this.state.fen()

            // var output = await modelPredict(this.state, this.model)

            // var policyArry = output[1].arraySync()

            var childNode = new MCST_Node(node, newState, possibleMoves[i], null)
            node.children.push(childNode)
            this.state.undo()
        }
        this.state.load(OriginalState)
        return node.children[possibleMoves.length-1]
    }
    async rollout(node, random)
    {
        if(random)
        {
            var time = 0
            var vaule = 0
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
            vaule = evaluateBoardAlphaZero(this.state.board())
            this.state.load(OriginalState)
            return vaule
        }
        else{
            var vaule = 0
            var OriginalState = this.state.fen()
            var nodeState = node.state
            this.state.load(nodeState)
            // vaule = evaluateBoardAlphaZero(this.state.board()) non NN vaule function

            var output = await modelPredict(this.state, this.model)
            this.state.load(OriginalState)
            return output
        }
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
    async bestMove(state, iterations, WorB, type, random)
    {
        await this.buildIntialTree(state)

        for(var i = 0; i < iterations; i++)
        {
            await this.select(this.root, WorB, random)
            // console.log('Rep' + i)
        }
        var bestAction
        var currentVaule        
        if(WorB)
        {
            var bestVaule = -Infinity
            var bestVauleRobust = 0
            for(var j = 0; j < this.root.children.length; j++)
            {
                if(type == 'robust')
                {
                    var currentVaule = this.root.children[j].visits
                    if( currentVaule > bestVauleRobust )
                {
                    bestVauleRobust = currentVaule
                    bestAction = this.root.children[j].action
                }
                }
                if(type == 'max')
                {
                    var currentVaule = this.root.children[j].vaule
                    if( currentVaule > bestVaule )
                {
                    bestVaule = currentVaule
                    bestAction = this.root.children[j].action
                }
                }
            }
        }
        else{
            var bestVauleMax = Infinity
            var bestVauleRobust = 0
            for(var j = 0; j < this.root.children.length; j++)
            {
                if(type == 'robust')
                {
                    var currentVaule = this.root.children[j].visits
                    if( currentVaule > bestVauleRobust )
                {
                    bestVauleRobust = currentVaule
                    bestAction = this.root.children[j].action
                }
                }
                if(type == 'max')
                {
                    var currentVaule = this.root.children[j].vaule
                    if( currentVaule < bestVauleMax )
                {
                    bestVauleMax = currentVaule
                    bestAction = this.root.children[j].action
                }
                }
            }
        }
        var currentPolicy = new Array(64); 
        for (let z=0; z<64; ++z)
        {
            currentPolicy[z] = 0;
        } 
        for (let q = 0; q < this.root.children.length; q++)
        {
                currentPolicy[this.state.makePretty(this.root.children[q].action)] += this.root.children[q].visits / this.root.visits  
                // console.log(this.state.makePretty(this.root.children[q].action))

        }
        var output = {move: bestAction, policy: currentPolicy }
        // console.log(output)
        return output
    }
}