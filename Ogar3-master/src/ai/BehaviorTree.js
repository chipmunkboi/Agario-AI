var BotPlayer = require('../BotPlayer');
var BTBot = require('../BTBot');
const { BehaviorTree, Sequence, Task, SUCCESS, FAILURE } = require('behaviortree')
const { BehaviorTree, Sequence, Task, SUCCESS, FAILURE, decorators: { AlwaysSucceedDecorator } } = require('behaviortree')

// initialize and create Behavior Tree
import { BehaviorTree } from 'behaviortree'
var bTree = new BehaviorTree({
  tree: mySelector,
  blackboard: {}
})

// selector nodes
import { Random } from 'behaviortree'
const mySelector = new Random({
  nodes: [
    // here comes in a list of nodes (Tasks, Sequences or Priorities)
    // as objects or as registered strings
  ]
})

// sequence nodes
import { Sequence } from 'behaviortree'
const mySequence = new Sequence({
  nodes: [
    // here comes in a list of nodes (Tasks, Sequences or Priorities)
    // as objects or as registered strings
  ]
})

// tasks/leaf nodes
import { Task, SUCCESS } from 'behaviortree'
const myTask = new Task({
  // (optional) this function is called directly before the run method
  // is called. It allows you to setup things before starting to run
  // Beware: if task is resumed after calling this.running(), start is not called.
  start: function(blackboard) { blackboard.isStarted = true; },

  // (optional) this function is called directly after the run method
  // is completed with either this.success() or this.fail(). It allows you to clean up
  // things, after you run the task.
  end: function(blackboard) { blackboard.isStarted = false; },

  // This is the meat of your task. The run method does everything you want it to do.
  run: function(blackboard) {
    return SUCCESS
  }
})

// Run Tree:
setInterval(function() {
  bTree.step()
}, 1000/60)
