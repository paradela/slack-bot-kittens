class Card {
  constructor(type, img) {
    this.type = type;
    this.image = img;
  }

  toString() {
    return `${this.type}`;
  }
  
  toAsciiString() {
    return `${this.rank}`;
  }

  static ExplodingKittenType() { return 'Exploding Kitten';}
  static ExplodingCards(numberPlayers) {
    var cards = [];
    for(var i = 0; i < numberPlayers - 1; i++){
      cards.push(new Card(Card.ExplodingKittenType(), 'explosion.png'));
    }
    return cards;
  }

  static DefuseType() { return 'Defuse';}
  static DefuseCards(numberPlayers) {
    var cards = [];
    for(var i = 0; i < numberPlayers; i++){
      cards.push(new Card(Card.DefuseType(), 'defuse.png'));
    }
    return cards;
  }


  static SkipType() { return 'Skip';}
  static SkipCards(numberPlayers) {
    return [
      new Card(Card.SkipType(), 'skip.png'),
      new Card(Card.SkipType(), 'skip.png'),
      new Card(Card.SkipType(), 'skip.png'),
      new Card(Card.SkipType(), 'skip.png')
    ]
  }


  static AttackType() { return 'Attack';}
  static AttackCards(numberPlayers) {
    return [
      new Card(Card.AttackType(), 'attack.png'),
      new Card(Card.AttackType(), 'attack.png'),
      new Card(Card.AttackType(), 'attack.png'),
      new Card(Card.AttackType(), 'attack.png')
    ];
  }


  static SeeTheFutureCards(numberPlayers) {
    return [
      new Card(Card.SeeTheFutureType(), 'seethefuture.png'),
      new Card(Card.SeeTheFutureType(), 'seethefuture.png'),
      new Card(Card.SeeTheFutureType(), 'seethefuture.png'),
      new Card(Card.SeeTheFutureType(), 'seethefuture.png')
    ];
  }

  static SeeTheFutureType() { return 'SeeTheFuture';}

  static FavorCards(numberPlayers) {
    return [
      new Card(Card.FavorType(), 'favor.png'),
      new Card(Card.FavorType(), 'favor.png'),
      new Card(Card.FavorType(), 'favor.png'),
      new Card(Card.FavorType(), 'favor.png')
    ];
  }

  static FavorType() { return 'Favor';}

  static NopeCards(numberPlayers) {
    return [
      new Card(Card.NopeType(), 'nope.png'),
      new Card(Card.NopeType(), 'nope.png'),
      new Card(Card.NopeType(), 'nope.png'),
      new Card(Card.NopeType(), 'nope.png')
    ];
  }

  static NopeType() { return 'Nope';}

  static MomaCatCards(numberPlayers) {
    return [
      new Card(Card.MomaCatType(), 'momacat.png'),
      new Card(Card.MomaCatType(), 'momacat.png'),
      new Card(Card.MomaCatType(), 'momacat.png'),
      new Card(Card.MomaCatType(), 'momacat.png')
    ];
  }

  static MomaCatType() { return 'MomaCat';}

  static ButtubaCards(numberPlayers) {
    return [
      new Card(Card.ButtubaType(), 'buttuba.png'),
      new Card(Card.ButtubaType(), 'buttuba.png'),
      new Card(Card.ButtubaType(), 'buttuba.png'),
      new Card(Card.ButtubaType(), 'buttuba.png')
    ];
  }

  static ButtubaType() { return 'Buttuba';}

  static CatermellonCards(numberPlayers) {
    return [
      new Card(Card.CatermellonType(), 'catermellon.png'),
      new Card(Card.CatermellonType(), 'catermellon.png'),
      new Card(Card.CatermellonType(), 'catermellon.png'),
      new Card(Card.CatermellonType(), 'catermellon.png')
    ];
  }

  static CatermellonType() { return 'Catermellon';}

  static TacocatCards(numberPlayers) {
    return [
      new Card(Card.TacocatType(), 'tacocat.png'),
      new Card(Card.TacocatType(), 'tacocat.png'),
      new Card(Card.TacocatType(), 'tacocat.png'),
      new Card(Card.TacocatType(), 'tacocat.png')
    ];
  }

  static TacocatType() { return 'Tacocat';}
}

module.exports = Card;
