import {Player} from '../rooms/lobby'
import { Schema, MapSchema, type } from "@colyseus/schema";


export enum Character {
    Assassin,
    Duke,
    Contessa,
    Captain,
    Ambassador
}

export class Hand {
    cards:Character[] = []
    lostInfluence:boolean[] = []

    constructor(card1:Character, card2:Character) {
        this.cards.push(card1)
        this.cards.push(card2)
        this.lostInfluence.push(false)
        this.lostInfluence.push(false)
    }
}

export class PlayerData {
    id: string
    name: string
    hand: Hand
    lostInfluence: boolean[] = []

    constructor(id:string, name: string, hand: Hand) {
        this.id = id
        this.name = name
        this.hand = hand
    }
}

export class Deck {
    cards: Character[] = []
    constructor(numOfEachSuit:Number) {
        for (let i = 0; i < numOfEachSuit; i++) {
            this.cards.push(Character.Ambassador)
            this.cards.push(Character.Assassin)
            this.cards.push(Character.Captain)
            this.cards.push(Character.Contessa)
            this.cards.push(Character.Duke)
        }
        this.shuffle()
    }

    // https://stackoverflow.com/a/6274381
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this.cards;
    }

    replaceAndShuffle(card:Character) {
        this.cards.push(card)
        this.shuffle()
    }

    drawCard() {
        return this.cards.shift()
    }

}

export class Coup {
    players: PlayerData[] = []
    deck: Deck

    constructor(players) {
        // this.players = playerNames.map(n => new PlayerData(n))
        this.deck = new Deck(1)
    }
}