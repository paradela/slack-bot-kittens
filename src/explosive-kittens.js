/**
 * Created by Ricardo on 09/02/2016.
 */
const rx = require('rx');
const _ = require('underscore-plus');
var util = require('util');

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

  startGame(playerDms, initialPlayer=null) {
    this.isRunning = true;
    this.playerDms = playerDms;
    this.initialPlayer = initialPlayer === null ?
      Math.floor(Math.random() * this.players.length) :
      initialPlayer;

    this.playerHands = {};
    this.currentPlayer = this.initialPlayer;

    this.deck = new Deck(this.players.length);
    this.deck.shuffle();
    this.dealPlayerCards();
    this.deck.addExplosionsAndShuffle();

    // Look for text that conforms to a player action.
    let playerAction = this.messages
      .map(e => PlayerInteraction.actionFromMessage(e.text,
        this.getActionsForPlayer(this.getPlayerById(this.slack.getUserByID(e.user).id))))
      .where(action => action !== null)
      .takeUntil(this.gameEnded)
      .subscribe(action => {
        if(action.type != 'nope') {
          this.actionStack.length = 0;
        }
        this.actionStack.push(action);
        //send new action to game engine to evaluation
        this.evaluatePlayerAction(this.stopAction);
      });

    return this.gameEnded;
  }

  getPlayerById(id) {
    for(var u of this.players) {
      if(u.id == id) return u;
    }
    return null;
  }

  getActionsForPlayer(player) {
    //console.log(util.inspect(player, false, null));
    return PlayerInteraction.getAvailableActions(player, (player.name == this.currentPlayer.name), this.playerCanNope(player));
  }

  playerCanNope(player) {
    if(player.name == this.currentPlayer.name) {
      if(this.actionStack.length <= 1) return false;
      else return !(this.actionStack.length % 2);
    }
    else return this.actionStack.length > 0;
  }

  //This
  evaluatePlayerAction(stopAction) {
    console.log('action: ' + this.actionStack.pop());

    this.gameEnded.onNext(true);
  }

  // Private: Deals hole cards to each player in the game. To communicate this
  // to the players, we send them a DM with the text description of the cards.
  // We can't post in channel for obvious reasons.
  //
  // Returns nothing
  dealPlayerCards() {
    this.orderedPlayers = PlayerOrder.determine(this.players, this.initialPlayer);

    for (let player of this.orderedPlayers) {
      player.isInGame = true;

      this.playerHands[player.id] = new Array();

      for(var i = 0; i < 4; i++) {
        this.playerHands[player.id].push(this.deck.drawCard());
      }
      this.playerHands[player.id].push(this.deck.drawDefuse());
      player.holeCards = this.playerHands[player.id];

      if (!player.isBot) {
        let dm = this.playerDms[player.id];
        if (!dm) {
          SlackApiRx.getOrOpenDm.subscribe(({dm}) => {
            this.playerDms[player.id] = dm;
            dm.send(`Your initial hand is: ${this.playerHands[player.id]}`);
          });
        } else {
          dm.send(`Your initial hand is: ${this.playerHands[player.id]}`);
        }
      } else {
        player.holeCards = this.playerHands[player.id];
      }
    }
  }

}

module.exports = ExplosiveKittens;