var PlayerTracker = require('../PlayerTracker');

const { BehaviorTree, Sequence, Selector, Task, SUCCESS, FAILURE } = require('behaviortree')

function BTBot() {
	PlayerTracker.apply(this, Array.prototype.slice.call(arguments));
	//this.color = gameServer.getRandomColor();
	
	// AI only
	this.gameState = 0;
	this.predators = []; // List of cells that can eat this bot
	this.prey = []; // List of cells that can be eaten by this bot
	this.food = [];
	
	this.target;
}

module.exports = BTBot;
BTBot.prototype = new PlayerTracker();

// Functions

// Called in update here
BTBot.prototype.getLowestCell = function() {
	// Gets the cell with the lowest mass
	if (this.cells.length <= 0) {
		return null; // Error!
	}
	
	// Starting cell
	var lowest = this.cells[0];
	for (i = 1; i < this.cells.length; i++) {
		if (lowest.mass > this.cells[i].mass) {
		    lowest = this.cells[i];	
		}
	}
	return lowest;
}

// Override

BTBot.prototype.updateSightRange = function() { // For view distance
    var totalSize = 1.0;
    var len = this.cells.length;
    
    for (var i = 0; i < len;i++) {
    	
        if (!this.cells[i]) {
            continue;
        }
    	
        totalSize += this.cells[i].getSize();
    }
    this.sightRange = 1024 / Math.pow(Math.min(64.0 / totalSize, 1), 0.4);
}

BTBot.prototype.update = function() { // Overrides the update function from player tracker
    // Remove nodes from visible nodes if possible
    
    for (var i = 0; i < this.nodeDestroyQueue.length; i++) {
        var index = this.visibleNodes.indexOf(this.nodeDestroyQueue[i]);
        if (index > -1) {
            this.visibleNodes.splice(index, 1);
        }
    }
	
    // Exit if bot is dead
    if (this.cells.length <= 0) {
        return;
    }

    // Update every 500 ms
    if (this.tickViewBox <= 0) {
        this.visibleNodes = this.calcViewBox();
        this.tickViewBox = 10;
    } else {
        this.tickViewBox--;
        return;
    }
	
	// Calc predators/prey
    var cell = this.getLowestCell();
    this.predators = [];
    this.prey = [];
    this.food = [];
    
    var ignoreMass = Math.min((cell.mass / 10), 100); // Ignores targeting cells below this mass
    // Loop
    for (i in this.visibleNodes) {
        var check = this.visibleNodes[i];
		
        // Cannot target itself
        if ((!check) || (cell.owner == check.owner)){
            continue;
        }
		
        var t = check.getType();
        if (t == 0) {
            // Cannot target teammates
            if (this.gameServer.gameMode.haveTeams) {
                if (check.owner.team == this.team) {
                    continue;
                }
            }
	        
            // Check for danger
            if (cell.mass > (check.mass * 1.25)){
                //if (check.mass > ignoreMass) {
                    // Prey
                this.prey.push(check);
                //}
            } else if (check.mass > (cell.mass * 1.25)) {
                // Predator
                this.predators.push(check);
            }
        } else if (t == 1) { // Food
            this.food.push(check);
        } else if (t == 3) { // Ejected mass
            if (cell.mass > 20) {
                this.food.push(check);
            }
        }
    }

    // Action
    this.decide(cell);
	
    this.nodeDestroyQueue = []; // Empty
    
}

// class
class Dog{
    bark(){
        console.log("Bark!")
    }
    randomlyWalk(){
        console.log("Random Walk!")
    }
    standBesideATree(){
        console.log("Stand!")
    }
    liftALeg(){
        console.log("Lift!")
    }
    pee(){
        console.log("Pee!")
    }
}

// Behavior Tree
BehaviorTree.register('bark', new Task({
    run: function(dog) {
      dog.bark()
      return SUCCESS
    }
  }))
   
  const tree = new Sequence({
    nodes: [
      'bark',
      new Task({
        run: function(dog) {
          dog.randomlyWalk()
          return SUCCESS
        }
      }),
      'bark',
      new Task({
        run: function(dog) {
          if (dog.standBesideATree()) {
            dog.liftALeg()
            dog.pee()
            return SUCCESS
          } else {
            return FAILURE
          }
        }
      })
    ]
  })

BTBot.prototype.decide = function(cell) {
	// Check for predators
	if (this.predators.length <= 0) {
		if (this.prey.length > 0) {
			this.gameState = 3;
		} else if (this.food.length > 0) {
			this.gameState = 1;
		} else {
			this.gameState = 0;
		}
	} else {
		// Run
		this.gameState = 2;
    }

    //const intitalbot = new BehaviorBot()
    //const behavior_bot = Object.assign(cell, intitalbot)

    const dog = new Dog(/*...*/) // the nasty details of a dog are omitted
 
    const bTree = new BehaviorTree({
    tree: tree,
    blackboard: dog
    })
 
    // The "game" loop:
    setInterval(function() {
    console.log("_____________________________________________")
    bTree.step({ debug: true })
    console.log(bTree.lastRunData)
    console.log("_____________________________________________")
    }, 1000/60)

}
// Finds the nearest cell in list
BTBot.prototype.findNearest = function(cell,list) {
	if (this.currentTarget) {
		// Do not check for food if target already exists
		return null;
	}
	
	// Check for nearest cell in list
	var shortest = list[0];
	var shortestDist = this.getDist(cell,shortest);
	for (i = 1; i < list.length; i++) {
		var check = list[i];
		var dist = this.getDist(cell,check)
		if (shortestDist > dist) {
			shortest = check;
			shortestDist = dist;
		}
	}
	
    return shortest;
}

BTBot.prototype.getRandom = function(list) {
	// Gets a random cell from the array
	var n = Math.floor(Math.random() * list.length);
	return list[n];
}

BTBot.prototype.getDist = function(cell,check) {
    // Fastest distance - I have a crappy computer to test with :(
    var xd = (check.position.x - cell.position.x);
    xd = xd < 0 ? xd * -1 : xd; // Math.abs is slow
    
    var yd = (check.position.y - cell.position.y);
    yd = yd < 0 ? yd * -1 : yd; // Math.abs is slow
    
    return (xd + yd);	
}

BTBot.prototype.getAccDist = function(cell,check) {
    // Accurate Distance
    var xs = check.position.x - cell.position.x;
    xs = xs * xs;
	 
    var ys = check.position.y - cell.position.y;
    ys = ys * ys;
	
    return Math.sqrt( xs + ys );
}

BTBot.prototype.getFoodBox = function(x,y) {
	var list = [];
    var r = 200;
		
    var topY = y - r;
    var bottomY = y + r;
    var leftX = x - r;
    var rightX = x + r;
	
	// Loop
    for (var i in this.visibleNodes) {
		var check = this.visibleNodes[i];
		
		if ((!check) || (check.getType() != 1)){
			continue;
		}
		
        // Collision checking
        if (y > bottomY) {
            continue;
        } if (y < topY) {
            continue;
        } if (x > rightX) {
            continue;
        } if (x < leftX) {
            continue;
        } 
          
		list.push(check);
    }
}   
// Custom
