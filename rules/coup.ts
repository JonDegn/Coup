import { Player } from '../rooms/lobby'
import { Schema, MapSchema, type } from "@colyseus/schema";


export enum Character {
    Assassin,
    Duke,
    Contessa,
    Captain,
    Ambassador
}

export enum ActionType {
    Income,
    ForeignAid,
    Tax,
    Steal,
    Exchange,
    Assassinate,
    Block,
    Challenge
}

// export enum CounterAction {
//     BlockForeignAid,
//     BlockSteal,
//     BlockAssassination
// }

export class CounterAction {
    blockingPlayerId: string
    blockingCharacter: Character
    bluff: boolean = false
    challengingPlayerId: string

    constructor(blockingPlayerId: string, blockingCharacter: Character, bluff: boolean) {
        this.blockingPlayerId = blockingPlayerId
        this.blockingCharacter = blockingCharacter
        this.bluff = bluff
    }
}

export class CurrentAction {
    sourcePlayerId: string
    targetPlayerId: string
    action: ActionType
    execute: () => void
    asCharacter: Character
    blocked: boolean = false
    bluff: boolean = false
    challengingPlayerId: string

    constructor(action: ActionType, sourcePlayerId: string, targetPlayerId: string, callback: () => void, asCharacter?: Character, bluff?: boolean) {
        this.action = action
        this.sourcePlayerId = sourcePlayerId
        this.targetPlayerId = targetPlayerId
        this.execute = callback
        this.asCharacter = asCharacter
        this.bluff = bluff
    }
}

export class ActionResponse {
    playersThatCanBlock: string[] = []
    charactersThatCanBlock: Character[] = []
    canChallenge: boolean
    constructor(playersThatCanAct: string[], charactersThatCanBlock: Character[], canChallenge: boolean) {
        this.playersThatCanBlock = playersThatCanAct
        this.charactersThatCanBlock = charactersThatCanBlock
        this.canChallenge = canChallenge
    }
}

export class Hand {
    cards: Character[] = []
    lostInfluence: boolean[] = []

    constructor(card1: Character, card2: Character) {
        this.cards.push(card1)
        this.cards.push(card2)
        this.lostInfluence.push(false)
        this.lostInfluence.push(false)
    }

    contains(character: Character) {
        return (!this.lostInfluence[0] && this.cards[0] === character)
            || (!this.lostInfluence[1] && this.cards[1] === character)
    }
}

export class PlayerData {
    id: string
    name: string
    hand: Hand
    coins: number = 2

    constructor(id: string, name: string, hand: Hand) {
        this.id = id
        this.name = name
        this.hand = hand
    }
}

export class Deck {
    cards: Character[] = []
    constructor(numOfEachSuit: Number) {
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

    replaceAndShuffle(card: Character) {
        this.cards.push(card)
        this.shuffle()
    }

    drawCard() {
        return this.cards.shift()
    }

}

export class Coup {
    players: any = {}
    deck: Deck
    currentTurn: number = 0
    turnOrder: string[] = []
    // currentAction: CurrentAction = null
    // counterAction: CounterAction = null
    actionStack: CurrentAction[] = []

    constructor(players) {
        const playerIds = Object.keys(players)
        this.turnOrder = playerIds.sort()
        const numOfEachCharacter = playerIds.length < 7
            ? 3
            : playerIds.length < 9
                ? 4
                : 5;
        this.deck = new Deck(numOfEachCharacter)
        playerIds.forEach(pId => {
            const p = players[pId]
            const hand = new Hand(this.deck.drawCard(), this.deck.drawCard())
            this.players[pId] = new PlayerData(pId, p.name, hand)
        })
    }

    currentPlayer(): PlayerData {
        return this.players[this.turnOrder[this.currentTurn]]
    }

    playerHandContains(playerId: string, character: Character) {
        return this.players[playerId].hand.contains(character)
    }

    addAction(action: ActionType, sourcePlayerId: string, targetPlayerId?: string, asCharacter?: Character): ActionResponse {
        if (action === ActionType.Income) {
            this.actionStack.push(new CurrentAction(action, sourcePlayerId, targetPlayerId, () => this.currentPlayer().coins++))
            return new ActionResponse([], [], false)
        } else if (action === ActionType.ForeignAid) {
            this.actionStack.push(new CurrentAction(action, sourcePlayerId, targetPlayerId, () => this.currentPlayer().coins += 2))
            return new ActionResponse(Object.keys(this.players).filter(pId => pId != this.currentPlayer().id), [Character.Duke], false) // todo: should only be players still in game
        } else if (action === ActionType.Block) {
            this.actionStack.push(new CurrentAction(action, sourcePlayerId, targetPlayerId, () => {
                console.log(`${this.players[sourcePlayerId].name} blocked ${this.currentPlayer().name}`)
                this.actionStack.pop()
            }, asCharacter, !this.playerHandContains(sourcePlayerId, asCharacter)))
            return new ActionResponse([], [], true)
        }
        return new ActionResponse([], [], false)
    }

    resolveAction() {
        const action = this.actionStack.pop()
        action.execute()
    }

    // startAction(action: ActionType, targetPlayerId?: string) {
    //     console.log(`${this.currentPlayer().name} is doing action ${action}, targeting ${targetPlayerId ? this.players[targetPlayerId].name : "no one"}`)

    //     if (action === ActionType.Income) {
    //         this.currentAction = new CurrentAction(action, targetPlayerId, () => this.currentPlayer().coins++, [], false)
    //     } else if (action === ActionType.ForeignAid) {
    //         this.currentAction = new CurrentAction(action, targetPlayerId, () => this.currentPlayer().coins += 2, [Character.Duke], false)
    //     }
    // }

    // challengeAction(challengingPlayerId: string) {
    //     console.log(`${this.players[challengingPlayerId].name} challenges ${this.currentPlayer().name}`)
    //     this.currentAction.challengingPlayerId = true
    // }

    // challengeCounterAction(challengingPlayerId: string) {
    //     console.log(`${this.players[challengingPlayerId].name} challenges ${this.currentPlayer().name}`)
    //     this.counterAction.challengingPlayerId = true
    // }

    // blockAction(blockingPlayerId: string, character: Character) {
    //     this.counterAction = new CounterAction(blockingPlayerId, character, false)
    // }

    // resolveAction() {
    //     if (this.counterAction) {
    //         if(this.counterAction.challengingPlayerId) {
    //             if(this.counterAction.bluff) {
    //                 // 
    //                 //this.players[this.counterAction.blockingPlayerId]
    //             }
    //         }
    //     }

    //     this.currentAction.execute()
    //     this.currentAction = null;
    // }
}