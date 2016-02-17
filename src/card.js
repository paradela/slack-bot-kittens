var util = require('util');

class Card {
  constructor(type, img) {
    this.type = type;
    this.image = img;
  }

  toString() {
    return `${this.image}`;
  }
  
  toAsciiString() {
    return `${this.image}`;
  }

  static ExplodingKittenType() { return 'Exploding Kitten';}
  static ExplodingCards(numberPlayers) {
    var cards = [];
    for(var i = 0; i < numberPlayers - 1; i++){
      cards.push(new Card(Card.ExplodingKittenType(), ':explodingkittens:'));
    }
    return cards;
  }

  static DefuseType() { return 'Defuse';}
  static DefuseCards(numberPlayers) {
    var cards = [];
    for(var i = 0; i < numberPlayers; i++){
      cards.push(new Card(Card.DefuseType(), ':defuse:'));
    }
    return cards;
  }


  static SkipType() { return 'Skip';}
  static SkipCards(numberPlayers) {
    return [
      new Card(Card.SkipType(), ':skip:'),
      new Card(Card.SkipType(), ':skip:'),
      new Card(Card.SkipType(), ':skip:'),
      new Card(Card.SkipType(), ':skip:')
    ]
  }


  static AttackType() { return 'Attack';}
  static AttackCards(numberPlayers) {
    return [
      new Card(Card.AttackType(), ':attack:'),
      new Card(Card.AttackType(), ':attack:'),
      new Card(Card.AttackType(), ':attack:'),
      new Card(Card.AttackType(), ':attack:')
    ];
  }


  static SeeTheFutureCards(numberPlayers) {
    return [
      new Card(Card.SeeTheFutureType(), ':seethefuture:'),
      new Card(Card.SeeTheFutureType(), ':seethefuture:'),
      new Card(Card.SeeTheFutureType(), ':seethefuture:'),
      new Card(Card.SeeTheFutureType(), ':seethefuture:'),
      new Card(Card.SeeTheFutureType(), ':seethefuture:')
    ];
  }

  static SeeTheFutureType() { return 'SeeTheFuture';}

  static FavorCards(numberPlayers) {
    return [
      new Card(Card.FavorType(), ':favor:'),
      new Card(Card.FavorType(), ':favor:'),
      new Card(Card.FavorType(), ':favor:'),
      new Card(Card.FavorType(), ':favor:')
    ];
  }

  static FavorType() { return 'Favor';}

  static NopeCards(numberPlayers) {
    return [
      new Card(Card.NopeType(), ':nope:'),
      new Card(Card.NopeType(), ':nope:'),
      new Card(Card.NopeType(), ':nope:'),
      new Card(Card.NopeType(), ':nope:')
    ];
  }

  static NopeType() { return 'Nope';}

  static MommaCatCards(numberPlayers) {
    return [
      new Card(Card.MommaCatType(), ':mommacat:'),
      new Card(Card.MommaCatType(), ':mommacat:'),
      new Card(Card.MommaCatType(), ':mommacat:'),
      new Card(Card.MommaCatType(), ':mommacat:'),
      new Card(Card.MommaCatType(), ':mommacat:')
    ];
  }

  static MommaCatType() { return 'MomaCat';}

  static BeardedCatCards(numberPlayers) {
    return [
      new Card(Card.BeardedCatType(), ':beardedcat:'),
      new Card(Card.BeardedCatType(), ':beardedcat:'),
      new Card(Card.BeardedCatType(), ':beardedcat:'),
      new Card(Card.BeardedCatType(), ':beardedcat:')
    ];
  }

  static BeardedCatType() { return 'BeardedCat';}

  static CatermellonCards(numberPlayers) {
    return [
      new Card(Card.CatermellonType(), ':catermellon:'),
      new Card(Card.CatermellonType(), ':catermellon:'),
      new Card(Card.CatermellonType(), ':catermellon:'),
      new Card(Card.CatermellonType(), ':catermellon:')
    ];
  }

  static CatermellonType() { return 'Catermellon';}

  static TacocatCards(numberPlayers) {
    return [
      new Card(Card.TacocatType(), ':tacocat:'),
      new Card(Card.TacocatType(), ':tacocat:'),
      new Card(Card.TacocatType(), ':tacocat:'),
      new Card(Card.TacocatType(), ':tacocat:')
    ];
  }

  static TacocatType() { return 'Tacocat';}

  static RainbowCatCards(numberPlayers) {
    return [
      new Card(Card.RainbowCatType(), ':rainbowcat:'),
      new Card(Card.RainbowCatType(), ':rainbowcat:'),
      new Card(Card.RainbowCatType(), ':rainbowcat:'),
      new Card(Card.RainbowCatType(), ':rainbowcat:')
    ];
  }

  static RainbowCatType() { return 'RainbowCat';}
}

module.exports = Card;
