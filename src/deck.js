const Card = require('./card.js');

class Deck {
  constructor(numberPlayers) {
    this.defuses = [];
    this.explosions = [];
    this.deck = [];

    this.defuses = Card.DefuseCards(numberPlayers);
    this.explosions = Card.ExplodingCards(numberPlayers);
    Card.CatermellonCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.MomaCatCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.ButtubaCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.TacocatCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.SkipCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.NopeCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.AttackCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.SeeTheFutureCards(numberPlayers).forEach(e => this.deck.push(e));
    Card.FavorCards(numberPlayers).forEach(e => this.deck.push(e));
  }

  // Public: Performs a proper Fisher-Yates shuffle.
  //
  // Returns nothing; the shuffle is in-place.
  shuffle() {
    let temp, idx;
    let cardsRemaining = this.deck.length;

    // While there remain elements to shuffle…
    while (cardsRemaining) {

      // Pick a remaining element…
      idx = Math.floor(Math.random() * cardsRemaining--);

      // And swap it with the current element.
      temp = this.deck[cardsRemaining];
      this.deck[cardsRemaining] = this.deck[idx];
      this.deck[idx] = temp;
    }
  }

  addExplosionsAndShuffle(){
    for(var i = 0; i < this.deck.length; i++) {
      this.deck.push(this.explosions.pop());
    }
    this.shuffle();
  }

  drawCard() {
    return this.deck.shift();
  }

  drawDefuse() {
    return this.defuses.shift();
  }

  putExplosion(card, index) {
    index--;
    if(index >= 0 && index < this.deck.length) {
      this.deck.splice(index, 0, card);
      return true;
    }
    else false;
  }

  toString() {
    return this.deck.join();
  }

  toAsciiString() {
    return this.deck.map(card => card.toAsciiString()).join();
  }
}

module.exports = Deck;
