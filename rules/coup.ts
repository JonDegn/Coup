import { Player } from '../rooms/ingame'
import { Schema, MapSchema, type } from "@colyseus/schema";


export enum Character {
    Assassin = "Assassin",
    Duke = "Duke",
    Contessa = "Contessa",
    Captain = "Captain",
    Ambassador = "Ambassador"
}

export enum ActionType {
    Coup = 'coup',
    Income = 'income',
    ForeignAid = 'foreignAid',
    Tax = 'tax',
    Steal = 'steal',
    Exchange = 'exchange',
    Assassinate = 'assassinate',
    Block = 'block',
    Challenge = 'challenge'
}

export class Action {
    sourcePlayerId: string
    targetPlayerId: string
    action: ActionType
    execute: () => ActionResolution
    asCharacter: Character
    blocked: boolean = false
    bluff: boolean = false
    challengingPlayerId: string

    constructor(action: ActionType, sourcePlayerId: string, targetPlayerId: string, callback: () => ActionResolution, asCharacter?: Character, bluff?: boolean) {
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

export class ActionResolution {
    playerToLoseInfluence: string
    playerToExchange: string
    characterToExchange: Character
    cardsToReturn: number
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
    outOfGame: boolean = false

    constructor(id: string, name: string, hand: Hand) {
        this.id = id
        this.name = name
        this.hand = hand
    }

    addToHand(character: Character) {
        this.hand.cards.push(character)
        this.hand.lostInfluence.push(false)
    }

    // remove card from hand
    removeFromHand(character: Character) {
        if (!this.hand.contains(character)) {
            console.error(`${this.name} tried to remove ${character}, but doesn't have it in their hand!`)
        }

        let idxToRemove = -1
        for (let i = 0; i < this.hand.cards.length; i++) {
            if (!this.hand.lostInfluence[i] && this.hand.cards[i] === character) {
                idxToRemove = i
                break
            }
        }

        this.hand.lostInfluence.splice(idxToRemove, 1)
        this.hand.cards.splice(idxToRemove, 1)
    }

    // Flip card up
    loseInfluence(character: Character) {
        if (!this.hand.contains(character)) {
            console.error(`${this.name} tried to remove ${character}, but doesn't have it in their hand!`)
        }

        let idxToLose = -1
        for (let i = 0; i < this.hand.cards.length; i++) {
            if (!this.hand.lostInfluence[i] && this.hand.cards[i] === character) {
                idxToLose = i
                break
            }
        }
        this.hand.lostInfluence[idxToLose] = true;
        if (this.hand.lostInfluence[0] && this.hand.lostInfluence[1]) {
            this.outOfGame = true
        }
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
    actionStack: Action[] = []
    gameOver: boolean = false

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

    endTurn() {
        do {
            this.currentTurn = (this.currentTurn + 1) % this.turnOrder.length
        } while (this.players[this.turnOrder[this.currentTurn]].outOfGame)
        this.gameOver = Object.keys(this.players).filter(pId => !this.players[pId].outOfGame).length === 1
    }

    getAvailableActions(): any[] {
        let actions = [
            { actionType: ActionType.Income, label: 'Income (+1)', targetsPlayer: false },
            { actionType: ActionType.ForeignAid, label: 'Foreign Aid (+2)', targetsPlayer: false },
            { actionType: ActionType.Tax, label: 'Tax (+3)', targetsPlayer: false },
            { actionType: ActionType.Steal, label: 'Steal (+2)', targetsPlayer: true },
            { actionType: ActionType.Exchange, label: 'Exchange', targetsPlayer: false  }
        ]
        if (this.currentPlayer().coins >= 10) {
            return [{ actionType: ActionType.Coup, label: 'Coup (-7)', targetsPlayer: true  }]
        }
        if (this.currentPlayer().coins >= 7) {
            actions.push({ actionType: ActionType.Coup, label: 'Coup (-7)', targetsPlayer: true  })
        }
        if (this.currentPlayer().coins >= 3) {
            actions.push({ actionType: ActionType.Assassinate, label: 'Assassinate (-3)', targetsPlayer: true  })
        }
        return actions
    }

    currentPlayer(): PlayerData {
        return this.players[this.turnOrder[this.currentTurn]]
    }

    playerHandContains(playerId: string, character: Character) {
        return this.players[playerId].hand.contains(character)
    }

    playersStillPlaying() {
        return Object.keys(this.players).filter(pId => !this.players[pId].outOfGame)
    }

    addAction(action: ActionType, sourcePlayerId: string, targetPlayerId?: string, asCharacter?: Character): ActionResponse {

        if (action === ActionType.Coup) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                this.players[sourcePlayerId].coins -= 7
                return { playerToLoseInfluence: targetPlayerId, playerToExchange: null, characterToExchange: null, cardsToReturn: 0 }
            }))
            return new ActionResponse([], [], false)
        } else if (action === ActionType.Income) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                this.currentPlayer().coins++
                return new ActionResolution()
            }))
            return new ActionResponse([], [], false)
        } else if (action === ActionType.ForeignAid) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                this.currentPlayer().coins += 2
                return new ActionResolution()
            }))
            return new ActionResponse(this.playersStillPlaying().filter(pId => pId != this.currentPlayer().id), [Character.Duke], false)
        } else if (action === ActionType.Block) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                console.log(`${this.players[sourcePlayerId].name} blocked ${this.currentPlayer().name}`)
                this.actionStack.pop()
                return new ActionResolution()
            }, asCharacter, !this.playerHandContains(sourcePlayerId, asCharacter)))
            return new ActionResponse([], [], true)
        } else if (action === ActionType.Challenge) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                const challengedAction = this.actionStack[this.actionStack.length - 1]
                if (challengedAction.bluff) {
                    this.actionStack.pop()  //remove action
                    return { playerToLoseInfluence: challengedAction.sourcePlayerId, playerToExchange: null, characterToExchange: null, cardsToReturn: 0 }
                } else {
                    return { playerToLoseInfluence: sourcePlayerId, playerToExchange: challengedAction.sourcePlayerId, characterToExchange: challengedAction.asCharacter, cardsToReturn: 0 }
                }
            }))
            return new ActionResponse([], [], false)
        } else if (action === ActionType.Tax) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                this.currentPlayer().coins += 3
                return new ActionResolution()
            }, asCharacter, !this.playerHandContains(sourcePlayerId, Character.Duke)))
            return new ActionResponse([], [], true)
        } else if (action === ActionType.Steal) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                const targetPlayer = this.players[targetPlayerId]
                const amountStolen = Math.min(targetPlayer.coins, 2)
                targetPlayer.coins -= amountStolen
                this.players[sourcePlayerId].coins += amountStolen
                return new ActionResolution()
            }, asCharacter, !this.playerHandContains(sourcePlayerId, Character.Captain)))
            return new ActionResponse([targetPlayerId], [Character.Captain, Character.Ambassador], true)
        } else if (action === ActionType.Assassinate) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                this.players[sourcePlayerId].coins -= 3
                return { playerToLoseInfluence: targetPlayerId, playerToExchange: null, characterToExchange: null, cardsToReturn: 0 }
            }, asCharacter, !this.playerHandContains(sourcePlayerId, Character.Assassin)))
            return new ActionResponse([targetPlayerId], [Character.Contessa], true)
        } else if (action === ActionType.Exchange) {
            this.actionStack.push(new Action(action, sourcePlayerId, targetPlayerId, () => {
                this.players[sourcePlayerId].addToHand(this.deck.drawCard())
                this.players[sourcePlayerId].addToHand(this.deck.drawCard())
                return { playerToLoseInfluence: null, playerToExchange: null, characterToExchange: null, cardsToReturn: 2 }
            }, asCharacter, !this.playerHandContains(sourcePlayerId, Character.Ambassador)))
            return new ActionResponse([], [], true)
        } else {
            console.error(`${action} is not an action`)
            return new ActionResponse([], [], false)
        }
    }

    resolveAction(): ActionResolution {
        const action = this.actionStack.pop()
        return action.execute()
    }

    exchangeCard(pId: string, character: Character, replaceFirst: boolean, noDraw?: boolean) {
        const player: PlayerData = this.players[pId]
        if (replaceFirst) {
            player.removeFromHand(character)
            this.deck.replaceAndShuffle(character)
            if (!noDraw) player.addToHand(this.deck.drawCard())
        } else {
            player.removeFromHand(character)
            if (!noDraw) player.addToHand(this.deck.drawCard())
            this.deck.replaceAndShuffle(character)
        }
    }

    loseInfluence(pId: string, character: Character) {
        this.players[pId].loseInfluence(character)
    }
}