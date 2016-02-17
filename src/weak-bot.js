const rx = require('rx');
const uuid = require('uuid');

module.exports =
class WeakBot {
  constructor(name) {
    this.id = uuid.v4();
    this.name = name;
    this.isInGame = true;
    this.isBot = true;
    this.holeCards = [];
  }

  // LOL WEAK
  getAction(availableActions) {
    let randIndex = this.getRandomIntInclusive(0, availableActions.length - 1);
    let action = availableActions[randIndex];
      
    /*let delay = 2000 + (Math.random() * 4000);
    return rx.Observable.timer(delay)
      .flatMap(() => rx.Observable.return(action));*/
    return action;
  }

  // Returns a random integer between min (included) and max (included)
  // Using Math.round() will give you a non-uniform distribution!
  getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
