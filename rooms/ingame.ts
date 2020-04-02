import { Room, Client, Delayed } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { Coup, PlayerData, ActionResponse, ActionType, Character } from "../rules/coup";


export class Player extends Schema {
  @type("string")
  name: string

  @type("boolean")
  ready: boolean = false

  @type("boolean")
  connected: boolean = true

  @type("number")
  coins: number = 2

  @type("boolean")
  outOfGame: boolean = false

  @type(["string"])
  revealedHand: ArraySchema<Character> = new ArraySchema<Character>()

  constructor(name: string) {
    super()
    this.name = name;
  }
}

class CurrentAction extends Schema {
  @type("string")
  sourcePlayer: string
  @type("string")
  targetPlayer: string
  @type(["string"])
  playersThatCanBlock: ArraySchema<string>
  @type(["string"])
  charactersThatCanBlock: ArraySchema<Character>
  @type("boolean")
  canChallenge: boolean

  constructor(sourcePlayer: string, targetPlayer: string, actionResponse: ActionResponse) {
      super()
      this.sourcePlayer = sourcePlayer
      this.targetPlayer = targetPlayer
      this.playersThatCanBlock = new ArraySchema<string>(...actionResponse.playersThatCanBlock)
      this.charactersThatCanBlock = new ArraySchema<Character>(...actionResponse.charactersThatCanBlock)
      this.canChallenge = actionResponse.canChallenge
  }
}

export class ActionDefinition extends Schema {
  @type("string")
  actionType: string =''
  @type("string")
  label: string =''
  @type("boolean")
  targetsPlayer: boolean

  constructor(type: string, label:string, targetsPlayer: boolean) {
    super()
    this.actionType = type
    this.label = label
    this.targetsPlayer = targetsPlayer
  }
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type("string")
  roomName: boolean = true

  @type("boolean")
  inLobby: boolean = true

  @type(["string"])
  turnOrder: ArraySchema<string>
  
  @type([ActionDefinition])
  availableActions: ArraySchema<ActionDefinition> = new ArraySchema<ActionDefinition>()

  @type("number")
  currentTurn: number = 0

  @type(CurrentAction)
  currentAction : CurrentAction = null

  @type("number")
  countdownTimer: number = 0

  createPlayer(id: string, name: string) {
    this.players[id] = new Player(name)
  }

  removePlayer(id: string) {
    delete this.players[id]
  }

  toggleReady(id: string) {
    this.players[id].ready = !this.players[id].ready
  }
}

export class InGame extends Room<State> {

  timerInterval: Delayed
  game: Coup

  // Colyseus will invoke when creating the room instance
  onCreate(options: any) {
    this.setMetadata({ roomName: options.roomName })
    console.log("lobby created", options)
    this.setState(new State())
    this.state.roomName = options.roomName
    this.clock.start()
  }

  // Called every time a client joins
  onJoin(client: Client, options: any) {
    console.log(`${options.name} joined`)
    this.state.createPlayer(client.sessionId, options.name)
  }

  async onLeave(client: Client, consented: boolean) {
    this.state.players[client.sessionId].connected = false
    console.log(`${this.state.players[client.sessionId].name} disconnected`)
    try {
      if (consented) throw new Error()
      await this.allowReconnection(client, 30)
      console.log(`${this.state.players[client.sessionId].name} reconnected`)
      this.state.players[client.sessionId].connected = true
    } catch (e) {
      console.log(`${this.state.players[client.sessionId].name} forfeits`)
      // todo: Player forfeits
      this.state.players[client.sessionId].outOfGame = true
      // this.state.removePlayer(client.sessionId)
    }

    // this.state.removePlayer(client.sessionId)
  }

  updateStateFromGame() {
    Object.keys(this.game.players).forEach(pId => {
      const gamePlayer : PlayerData = this.game.players[pId]
      this.state.players[pId].outOfGame = gamePlayer.outOfGame
      this.state.players[pId].revealedHand = new ArraySchema<Character>(...gamePlayer.hand.cards.filter((c,idx)=> gamePlayer.hand.lostInfluence[idx]))
      this.state.players[pId].coins = gamePlayer.coins
    })
    this.state.currentTurn = this.game.currentTurn
  }

  // Called every time this room receives a message
  onMessage(client: Client, message: any) {
    console.log("message:", message)

    if (message.command === "toggleReady") {
      this.state.toggleReady(client.sessionId)
      if (this.state.players[client.sessionId].ready === false) this.cancelTimer()
    } else if (message.command === "startGame") {
      if (this.timerInterval && this.timerInterval.active) return
      this.startTimer(5, () => {
        this.state.inLobby = false
        this.game = new Coup(this.state.players)
        this.state.turnOrder = new ArraySchema<string>(...this.game.turnOrder)
        this.state.availableActions = new ArraySchema<ActionDefinition>(...this.game.getAvailableActions().map(a => new ActionDefinition(a.actionType, a.label, a.targetsPlayer)))
      })
    } else if (message.command === "renamePlayer") {
      this.state.players[client.sessionId].name = message.name
    } else if (message.command === "action") {
      if (message.action === ActionType.Income) {
        this.game.addAction(message.action, this.state.turnOrder[this.state.currentTurn], this.state.turnOrder[this.state.currentTurn])
        this.game.resolveAction()
        this.updateStateFromGame()
        this.endTurn()
      } else if (message.action === ActionType.Steal) {
        const actionResponse = this.game.addAction(message.action, this.state.turnOrder[this.state.currentTurn], message.targetPlayerId, Character.Captain)
        this.state.currentAction = new CurrentAction(client.sessionId, message.targetPlayerId, actionResponse)
        // this.game.resolveAction()
        // this.updateStateFromGame()
        // this.endTurn()
      } else {
        this.game.players[client.sessionId].loseInfluence(this.game.players[client.sessionId].hand.cards[0])
        this.updateStateFromGame()
        this.endTurn()
      }
    } else if (message.command === "endTurn") {
      this.endTurn()
    }
  }

  endTurn() {
    this.game.endTurn()
    this.state.currentTurn = this.game.currentTurn
    this.state.availableActions = new ArraySchema<ActionDefinition>(...this.game.getAvailableActions().map(a => new ActionDefinition(a.actionType, a.label, a.targetsPlayer)))
  }

  startTimer(length: number, callback: Function) {
    this.state.countdownTimer = length
    this.timerInterval = this.clock.setInterval(() => {
      console.log("Timer: ", this.state.countdownTimer)
      this.state.countdownTimer--
      if (this.state.countdownTimer == 0) {
        callback()
        this.cancelTimer()
      }
    }, 1000)
  }

  cancelTimer() {
    if (this.timerInterval) {
      this.timerInterval.clear();
      console.log("timer cancelled")
    }
    this.state.countdownTimer = 0
  }
}