/**
 * Created by Ricardo on 09/02/2016.
 */
const rx = require('rx');
const _ = require('underscore-plus');
var util = require('util');
const Card = require('./card');

const Deck = require('./deck');
const SlackApiRx = require('./slack-api-rx');
const PlayerOrder = require('./player-order');
const PlayerStatus = require('./player-status');
//const ImageHelpers = require('./image-helpers');
const PlayerInteraction = require('./player-interaction');

class ExplosiveKittens {

  constructor(slack, messages, channel, players, scheduler=rx.Scheduler.timeout) {
    this.slack = slack;
    this.messages = messages;
    this.channel = channel;
    this.players = players;
    this.scheduler = scheduler;

    this.currentPlayer = null;

    this.actionStack = new Array();
    this.gameEngine = new rx.Subject();
    this.gameEnded = new rx.Subject();
    this.stopAction = new rx.Subject();
  }

  startGame(playerDms) {
    this.isRunning = true;
    this.playerDms = playerDms;
    this.initialPlayer = this.chooseFirstPlayer();
    console.log(util.inspect(this.initialPlayer, false, null));

    this.playerHands = {};
    this.currentPlayer = this.initialPlayer;

    this.deck = new Deck(this.players.length);
    this.deck.shuffle();
    this.dealPlayerCards();
    this.deck.addExplosionsAndShuffle();

    //TODO: notify players of who's the first player to make a move.
    this.sendMessageToAll(`${this.currentPlayer.name} is the first one. Good luck! :explodingkittens:`);

    let firstActions = PlayerInteraction.buildActionMessage(
      this.currentPlayer,
      this.getActionsForPlayer(this.currentPlayer),
      0);

    this.sendMessageToPlayer(this.currentPlayer, firstActions);

    // Look for text that conforms to a player action.
    let playerAction = this.messages
      .map(e => PlayerInteraction.actionFromMessage(e.text,
        this.getActionsForPlayer(this.getPlayerById(this.slack.getUserByID(e.user).id))))
      .where(action => action !== null)
      .takeUntil(this.gameEnded)
      .subscribe(action => {
        /*if(action.type != 'nope') {
          this.actionStack.length = 0;
        }*/
        this.actionStack.push(action);
        //send new action to game engine to evaluation
        let nextPlayer = this.evaluatePlayerAction(this.stopAction);
        this.currentPlayer = nextPlayer;
        
        if(nextPlayer.isBot) {
          let draw = {
            type: 'draw',
            player: nextPlayer,
            description: 'blah'
          };
          let actions = [draw];//this.getActionsForPlayer(nextPlayer);
          console.log('botActions: ' + util.inspect(actions, false, null));
          this.actionStack.push(nextPlayer.getAction(actions));
          nextPlayer = this.evaluatePlayerAction(this.stopAction);
        }
        this.currentPlayer = nextPlayer;

        console.log('currentPlayer: ' + util.inspect(this.currentPlayer, false, null));

        //TODO: notify players of who's the next player to make a move
        let availableActions = PlayerInteraction.buildActionMessage(
          this.currentPlayer,
          this.getActionsForPlayer(this.currentPlayer),
          0);

        this.sendMessageToPlayer(this.currentPlayer, availableActions);

      });

    return this.gameEnded;
  }

  chooseFirstPlayer() {
    for(let p of this.players) {
      console.log(util.inspect(p, false, null));
      if(p.name == 'paradela') return p;
    }
    return null;
    /*let i = Math.floor(Math.random() * this.players.length);
    return this.players[i];*/
  }

  getPlayerById(id) {
    for(var u of this.players) {
      if(u.id == id) return u;
    }
    return null;
  }

  getActionsForPlayer(player) {
    console.log('getActionsForPlayer: ' + util.inspect(player, false, null));
    return PlayerInteraction.getAvailableActions(player, (player.name == this.currentPlayer.name), this.playerCanNope(player));
  }

  playerCanNope(player) {
    if(player.name == this.currentPlayer.name) {
      if(this.actionStack.length <= 1) return false;
      else return !(this.actionStack.length % 2);
    }
    else return this.actionStack.length > 0;
  }

/*{ player:
    { id: 'U02U88YH5',
      name: 'paradela',
      isInGame: true,
      holeCards:
      [ Card { type: 'MomaCat', image: 'momacat.png' },
        Card { type: 'Buttuba', image: 'buttuba.png' },
        Card { type: 'Nope', image: 'nope.png' },
        Card { type: 'Attack', image: 'attack.png' },
        Card { type: 'Defuse', image: 'defuse.png' } ]
    },
    type: 'draw',
    description: 'Draw one card from the deck.'
  }
  */
  evaluatePlayerAction(stopAction) {
    let action = this.actionStack[this.actionStack.length - 1];
    console.log('evaluatePlayerAction: ' + util.inspect(action, false, null));

    this.notifyActionToPlayers(action);

    switch(action.type){
      case 'draw':
        this.onDrawCard(action);
        break;
      case 'skip':
        this.onSkip(action);
        break;
      case 'attack':
        break;
      case 'favor':
        break;
      case 'steel':
        break;
      case 'peek':
        break;
      default:
        break;
    }


    let nextPlayer = this.evaluateStack();
    console.log('evaluateStack: ' + util.inspect(nextPlayer, false, null));
    if(nextPlayer == null)
      nextPlayer = this.evaluateCurrentPlayer();
    console.log('evaluateCurrentPlayer: ' + util.inspect(nextPlayer, false, null));
    return nextPlayer;
  }

  evaluateCurrentPlayer() {
    let playersInGame = 0;
    let nextPlayer = null;
    let currentPlayerIndex = this.players.indexOf(this.currentPlayer);

    for(let i = currentPlayerIndex + 1; i < this.players.length; i++) {
      var player = this.players[i];
      console.log('NextPlayer1: ' + util.inspect(player, false, null));
      if(player.isInGame) {
        playersInGame++;
        if(nextPlayer == null) {
          nextPlayer = player;
          console.log('NextPlayer1: ' + util.inspect(nextPlayer, false, null));
        }
      }
    }
    for(let i = 0; i <= currentPlayerIndex; i++) {
      var player = this.players[i];
      console.log('NextPlayer2: ' + util.inspect(player, false, null));
      if(player.isInGame) {
        playersInGame++;
        if(nextPlayer == null) {
          nextPlayer = player;
          console.log('NextPlayer2: ' + util.inspect(nextPlayer, false, null));
        }
      }
    }

    if(playersInGame == 1) {
      //currentPlayer won the game
      this.gameEnded.onNext(nextPlayer);
    }

    return nextPlayer;
  }

  evaluateStack() {
    if(this.actionStack.length > 0) {
      if(this.actionStack.length % 2) { //is even
        //initial action has been noped, and the original player needs to play again.
        return this.actionStack[0].player;
      }
    }
    //can't find the next player from the action stack
    return null;
  }

  // Private: Deals hole cards to each player in the game. To communicate this
  // to the players, we send them a DM with the text description of the cards.
  // We can't post in channel for obvious reasons.
  //
  // Returns nothing
  dealPlayerCards() {
    let firstToActIdx = this.players.indexOf(this.initialPlayer);
    this.orderedPlayers = this.players;//PlayerOrder.determine(this.players, firstToActIdx);
    console.log('dealPlayerCards: ' + util.inspect(this.orderedPlayers, false, null));
    for (let player of this.orderedPlayers) {
      player.holeCards = new Array();

      for(var i = 0; i < 4; i++) {
        player.holeCards.push(this.deck.drawCard());
      }
      player.holeCards.push(this.deck.drawDefuse());

      console.log('dealPlayerCards: ' + util.inspect(player, false, null));
      if (!player.isBot) {
        this.sendMessageToPlayer(player, `Your cards: ${player.holeCards}`);
      }
    }
  }

  sendMessageToPlayer(player, message) {
    if(player.isBot) return;
    let dm = this.playerDms[player.id];
    if (!dm) {
      SlackApiRx.getOrOpenDm.subscribe(({dm}) => {
        this.playerDms[player.id] = dm;
        dm.send(message);
      });
    } else {
      dm.send(message);
    }
  }

  sendMessageToAll(message, exceptions=[]) {
    for(let p of this.players) {
      if(p.isBot) continue;
      if(exceptions.indexOf(p) > -1) continue;
      this.sendMessageToPlayer(p, message);
    }
  }

  notifyActionToPlayers(action) {
    this.sendMessageToAll(`${action.player.name} acted with: ${action.type}`, [action.player]);
  }

  notifyDrawedCard(currentPlayer, card) {
    this.sendMessageToPlayer(currentPlayer, `You picked up a: ${card}`);
    //If it is an explosion, notify all the others
    if(card.type == Card.ExplodingKittenType()) {
      this.sendMessageToAll(`${currentPlayer.name} picked up an Explosion... Poor guy :explodingkittens:`, [currentPlayer]);
    }
  }

  onDrawCard(action) {
    //Draw one card from the deck
    var card = this.deck.drawCard();
    let player = action.player;

    this.notifyDrawedCard(player, card);

    //Check if it is an explosion
    if(card.type == Card.ExplodingKittenType()) { //handle explosion
      var isDefused = false;

      //Look for a Defuse card
      for(var i = 0; i < player.holeCards.length; i++) {
        var c = player.holeCards[i];
        if(c.type == Card.DefuseType()) {
          isDefused = true;
          //Discard the defuse card
          player.holeCards.splice(i, 1);
          //TODO: get explosion position
          this.deck.putExplosion(card, 1);
          break;
        }
      }
      if(!isDefused) {
        //TODO: player lost the game
        player.isInGame = false;
      }
    }
    else {
      //Player finished his turn, add card to player's hand
      player.holeCards.push(card);
      //Notify the player about his new cards
      this.sendMessageToPlayer(player, `Your cards: ${player.holeCards}`);
    }
    //every time a player draws a card, the card stack must be cleared
    this.actionStack.length = 0;
  }

  onSkip(action) {
    let player = action.player;

    for(var i = 0; i < player.holeCards.length; i++) {
      var c = player.holeCards[i];
      if(c.type == Card.SkipType()) {
        player.holeCards.splice(i, 1);
        //This is a valid action so the cardStack must be cleared
        this.actionStack.length = 0;
        //And last action must stay on top
        this.actionStack.push(action);
      }
    }
  }

  deferredActionForPlayer(player, stopAction) {
    return rx.Observable.defer(() => {
      let actions = this.getActionsForPlayer(player);

      return PlayerInteraction.getActionForPlayer(this.messages, this.channel,
        player, actions, stopAction, this.scheduler, this.timeout)
        .do(action => this.onPlayerAction(player, action,  roundEnded));
    });
  }

}

module.exports = ExplosiveKittens;