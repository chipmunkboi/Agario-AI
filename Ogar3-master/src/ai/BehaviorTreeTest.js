var BTBot = require('../BTBot');

import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from 'behaviortree'

BehaviorTree.register('flee', new Task({
  run: function (Bot) {
    Bot.flee()
    return SUCCESS
  }
}))

BehaviorTree.register('fight', new Task({
  run: function (Bot) {
    Bot.fight()
    return SUCCESS
  }
}))

BehaviorTree.register('feed', new Task({
  run: function (Bot) {
    Bot.feed()
    return SUCCESS
  }
}))

BehaviorTree.register('wander', new Task({
  run: function (Bot) {
    Bot.wander()
    return SUCCESS
  }
}))

const treeTest = new Selector(
{
      nodes: [
        // flee selector
        new Selector(
        {
          run: function (Bot) 
          {
            // case: flee
            if(this.gamestate == 2)
            {
                Bot.flee()
                return SUCCESS
            }
            // case: fight
            else if (this.gamestate == 3)
            {
                Bot.fight()
                return SUCCESS
            }
            // case: feed
            else if (this.gamestate == 1)
            {
                Bot.feed()
                return SUCCESS
            }
            // case: wander - default
            else if (this.gamestate == 0)
            {
               Bot.wander()
               return SUCCESS
            } 
            else 
            {
                return FAILURE
            }
          }
        }
    )
    ]
}

// implement actions here
class Bot 
{
  // actions
  flee () 
  {
    var avoid = this.predators[0];
    //console.log("[Bot] "+cell.getName()+": Fleeing from "+avoid.getName());
    
    // Find angle of vector between cell and predator
    var deltaY = avoid.position.y - cell.position.y;
    var deltaX = avoid.position.x - cell.position.x;
    var angle = Math.atan2(deltaX,deltaY);
    
    // Now reverse the angle
    if (angle > Math.PI) {
        angle -= Math.PI;
    } else {
        angle += Math.PI;
    }
    
    // Direction to move
    var x1 = cell.position.x + (500 * Math.sin(angle));
    var y1 = cell.position.y + (500 * Math.cos(angle));
    
    if ((!this.target) || (this.target.getType() == 0) || (this.visibleNodes.indexOf(this.target) == -1)) {
        var foods = this.getFoodBox(x1,y1);
        if (foods) {
            this.target = this.findNearest(cell, this.food);
        
            this.mouseX = this.target.position.x;
            this.mouseY = this.target.position.y;
            break;
        }
    }   
    
    this.mouse = {x: x1, y: y1};
  }

  fight () 
  {
    if ((!this.target) || (this.visibleNodes.indexOf(this.target) == -1)) 
    {
        this.target = this.getRandom(this.prey);
    }
    //console.log("[Bot] "+cell.getName()+": Targeting "+this.target.getName());
                    
    this.mouse = {x: this.target.position.x, y: this.target.position.y};
    
    var massReq = 1.25 * (this.target.mass * 2 ); // Mass required to splitkill the target
    
    if ((cell.mass > massReq) && (this.cells.length <= 2)) { // Will not split into more than 4 cells
        var splitDist = (4 * (40 + (cell.getSpeed() * 4))) + (cell.getSize() * 1.75); // Distance needed to splitkill
        var distToTarget = this.getAccDist(cell,this.target); // Distance between the target and this cell
        
        if (splitDist >= distToTarget) {
            // Splitkill
    console.log('[Bot] ' + cell.getName() + " has splitted")
            this.gameServer.splitCells(this);
        }
    }
  }

  feed () 
  {
    if ((!this.target) || (this.target.getType() == 0) || (this.visibleNodes.indexOf(this.target) == -1)) 
    {
        // Food is eaten/a player cell/out of sight... so find a new food cell to target
        this.target = this.findNearest(cell,this.food);
                    
        this.mouse = {x: this.target.position.x, y: this.target.position.y};
    }
  }
  
  wander () 
  {
    if ((cell.position.x == this.mouseX) && (cell.position.y == this.mouseY)) 
    {
        // Get a new position
        var index = Math.floor(Math.random() * this.gameServer.nodes.length);
        var randomNode = this.gameServer.nodes[index];
        var pos = {x: 0, y: 0};
    
        if (randomNode.getType() == 3 | 1) 
        {
            pos.x = randomNode.position.x;
            pos.y = randomNode.position.y;
        } 
        else
        {
            // Not a food/ejected cell
            pos = this.gameServer.getRandomPosition();
        }
    
    // Set bot's mouse coords to this location
    this.mouse = {x: pos.x, y: pos.y};
}
  }
  
  aggressiveSplit()
  {
  }
  
  defensiveSplit()
  {
  }
  
  // checkers
  standBesideATree()
  {
    return true
  }
}

const Bot = new Bot() 