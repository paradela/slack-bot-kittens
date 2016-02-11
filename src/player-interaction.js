const rx = require('rx');
const _ = require('underscore-plus');
const Card = require('./card.js');
var util = require('util');

class PlayerInteraction {
  // Public: Poll players that want to join the game during a specified period
  // of time.
  //
  // messages - An {Observable} representing new messages sent to the channel
  // channel - The {Channel} object, used for posting messages
  // scheduler - (Optional) The scheduler to use for timing events
  // timeout - (Optional) The amount of time to conduct polling, in seconds
  // maxPlayers - (Optional) The maximum number of players to allow
  //
  // Returns an {Observable} that will `onNext` for each player that joins and
  // `onCompleted` when time expires or the max number of players join.
  static pollPotentialPlayers(messages, channel, scheduler=rx.Scheduler.timeout, timeout=5/*30*/, maxPlayers=10) {
    let formatMessage = t => `Who wants to play Exploding Kittens? Respond with 'yes' in this channel in the next ${t} seconds.`;
    let timeExpired = PlayerInteraction.postMessageWithTimeout(channel, formatMessage, scheduler, timeout);

    // Look for messages containing the word 'yes' and map them to a unique
    // user ID, constrained to `maxPlayers` number of players.
    let newPlayers = messages.where(e => e.text && e.text.toLowerCase().match(/\byes\b/))
      .map(e => e.user)
      .distinct()
      .take(maxPlayers)
      .publish();

    newPlayers.connect();
    timeExpired.connect();

    // Once our timer has expired, we're done accepting new players.
    return newPlayers.takeUntil(timeExpired);
  }

  // Public: Poll a specific player to take a poker action, within a timeout.
  //
  // messages - An {Observable} representing new messages sent to the channel
  // channel - The {Channel} object, used for posting messages
  // player - The player being polled
  // previousActions - A map of players to their most recent action
  // scheduler - (Optional) The scheduler to use for timing events
  // timeout - (Optional) The amount of time to conduct polling, in seconds
  //
  // Returns an {Observable} indicating the action the player took. If time
  // expires, a 'timeout' action is returned.
  static getActionForPlayer(messages, channel, player, previousActions, scheduler=rx.Scheduler.timeout, timeout=30) {
    let availableActions = PlayerInteraction.getAvailableActions(player, previousActions);
    let formatMessage = t => PlayerInteraction.buildActionMessage(player, availableActions, t);
    
    let timeExpired = null;
    let expiredDisp = null;
    if (timeout > 0) {
      timeExpired = PlayerInteraction.postMessageWithTimeout(channel, formatMessage, scheduler, timeout);
      expiredDisp = timeExpired.connect();
    } else {
      channel.send(formatMessage(0));
      timeExpired = rx.Observable.never();
      expiredDisp = rx.Disposable.empty;
    }

    // Look for text that conforms to a player action.
    let playerAction = messages.where(e => e.user === player.id)
      .map(e => PlayerInteraction.actionFromMessage(e.text, availableActions))
      .where(action => action !== null)
      .publish();

    // connect() will execute the query to find messages from user.
    playerAction.connect();
    
    // If the user times out, he will draw a card.
    let actionForTimeout = timeExpired.map(() => { name: 'draw' });

    let botAction = player.isBot ?
      player.getAction(availableActions, previousActions) :
      rx.Observable.never();

    // NB: Take the first result from the player action, the timeout, and a bot
    // action (only applicable to bots).
    return rx.Observable.merge(playerAction, actionForTimeout, botAction)
      .take(1)
      .do(() => expiredDisp.dispose());
  }

  // Private: Posts a message to the channel with some timeout, that edits
  // itself each second to provide a countdown.
  //
  // channel - The channel to post in
  // formatMessage - A function that will be invoked once per second with the
  //                 remaining time, and returns the formatted message content
  // scheduler - The scheduler to use for timing events
  // timeout - The duration of the message, in seconds
  //
  // Returns an {Observable} sequence that signals expiration of the message
  static postMessageWithTimeout(channel, formatMessage, scheduler, timeout) {
    let timeoutMessage = channel.send(formatMessage(timeout));

    let timeExpired = rx.Observable.timer(0, 1000, scheduler)
      .take(timeout + 1)
      .do((x) => timeoutMessage.updateMessage(formatMessage(`${timeout - x}`)))
      .publishLast();

    return timeExpired;
  }

  // Private: Builds up a formatted countdown message containing the available
  // actions.
  //
  // player - The player who is acting
  // availableActions - An array of the actions available to this player
  // timeRemaining - Number of seconds remaining for the player to act
  //
  // Returns the formatted string
  static buildActionMessage(player, availableActions, timeRemaining) {
    let message = `${player.name}, it's your turn. Respond with:\n`;
    for (let action of availableActions) {
      message += `*(${action.charAt(0).toUpperCase()})${action.slice(1)}*\t`;
    }
    
    if (timeRemaining > 0) {
      message += `\nin the next ${timeRemaining} seconds.`;
    }
    
    return message;
  }

  // Private: Given an array of actions taken previously in the hand, returns
  // an array of available actions.
  //
  // player - The player who is acting
  // previousActions - A map of players to their most recent action
  //
  // Returns an array of strings
  static getAvailableActions(player, currentPlayer=true, canNope=false) {
    let availableActions = [];
    let catCards = new Map();
    let actions =  new Map();

    if(currentPlayer) {
      var action = {
        player : player,
        type : 'draw',
        description : 'Draw one card from the deck.'
      }
      availableActions.push(action);
    }

    for(let card of player.holeCards) {
      var action = {
        player : player,
        type : '',
        description: ''
      };

      switch(card.type) {
        case Card.ButtubaType():
        case Card.TacocatType():
        case Card.CatermellonType():
        case Card.MomaCatType():
          if(!currentPlayer) break;
          var c = 1;
          if(catCards.has(card.type)) {
            if(catCards.get(card.type) == 1){
              action.type = 'steel';
              action.description = 'Steel card with ' + card.type + 's';
              availableActions.push(action);
            }
            c = catCards.get(card.type) + 1;
          }
          catCards.set(card.type, c);
          break;
        case Card.AttackType():
          if(!currentPlayer) break;
          if(!actions.has(card.type)) {
            action.type = 'attack';
            action.description = 'Skip your play. Next player makes two plays.';
            availableActions.push(action);
          }
          actions.set(card.type, true);
          break;
        case Card.SkipType():
          if(!currentPlayer) break;
          if(!actions.has(card.type)) {
            action.type = 'skip';
            action.description = 'Skip your play.';
            availableActions.push(action)
          }
          actions.set(card.type, true);
          break;
        case Card.FavorType():
          if(!currentPlayer) break;
          if(!actions.has(card.type)) {
            action.type = 'favor';
            action.description = 'Ask a card to any player in the game.';
            availableActions.push(action);
          }
          actions.set(card.type, true);
          break;
        case Card.SeeTheFutureType():
          if(!currentPlayer) break;
          if(!actions.has(card.type)) {
            action.type = 'future';
            action.description = 'Peek the next three cards.';
            availableActions.push(action);
          }
          actions.set(card.type, true);
          break;
        case Card.NopeType():
          if(canNope) {
            if(!actions.has(card.type)) {
              action.type = 'nope';
              action.description = 'Nope any card played before by other player.';
              availableActions.push(action);
            }
            actions.set(card.type, true);
            break;
          }
        case Card.DefuseType():
          break;
      }
    }

    return availableActions;
  }

  // Private: Parse player input into a valid action.
  //
  // text - The text that the player entered
  // availableActions - An array of the actions available to this player
  //
  // Returns an object representing the action, with keys for the name and
  // bet amount, or null if the input was invalid.
  static actionFromMessage(text, availableActions) {
    console.log('actionFromMessage: ' + util.inspect(availableActions, false, null));
    if (!text) return null;

    let input = text.trim().toLowerCase().split(/\s+/);
    if (!input[0]) return null;

    for (let a of availableActions) {
      if (input[0] == a.type) {
        return a;
      }
    }
    return null;
  }
}

module.exports = PlayerInteraction;
