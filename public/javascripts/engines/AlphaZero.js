


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