const Card = require('./card.js');

class Deck {
  constructor(numberPlayers) {
    this.defuses = [];
    this.explosions = [];
    this.deck = [];

    this.defuses.push(Card.DefuseCards(numberPlayers));
    this.explosions.push(Card.ExplodingCards(numberPlayers));
    this.deck.push(Card.CatermellonCards(numberPlayers));
    this.deck.push(Card.MomaCatCards(numberPlayers));
    this.deck.push(Card.ButtubaCards(numberPlayers));
    this.deck.push(Card.TacocatCards(numberPlayers));
    this.deck.push(Card.SkipCards(numberPlayers));
    this.deck.push(Card.NopeCards(numberPlayers));
    this.deck.push(Card.AttackCards(numberPlayers));
    this.deck.push(Card.SeeTheFutureCards(numberPlayers));
    this.deck.push(Card.FavorCards(numberPlayers));
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
    for(i = 0; i < deck.length; i++) {
      this.deck.push(this.explosions.pop());
    }
    this.shuffle();
  }

  drawCard() {
    return this.cards.shift();
  }

  toString() {
    return this.cards.join();
  }

  toAsciiString() {
    return this.cards.map(card => card.toAsciiString()).join();
  }
}

module.exports = Deck;
