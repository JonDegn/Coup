import { Room, Client, Delayed } from "colyseus";
import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";


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
  hand: ArraySchema<string> = new ArraySchema<string>()

  constructor(name: string) {
    super()
    this.name = name;
    const cards = ['back', 'ambassador', 'assassin', 'captain', 'contessa', 'duke']
    this.hand.push(cards[Math.floor(Math.random() * cards.length)])
    this.hand.push(cards[Math.floor(Math.random() * cards.length)])
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

  @type("number")
  currentTurn: number = 0

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

export class Lobby extends Room<State> {

  timerInterval: Delayed

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

  // Called every time this room receives a message
  onMessage(client: Client, message: any) {
    console.log("message:", message)

    if (message.command === "toggleReady") {
      this.state.toggleReady(client.sessionId)
      if (this.state.players[client.sessionId].ready === false) this.cancelTimer()
    } else if (message.command === "startGame") {
      if (this.timerInterval && this.timerInterval.active) return
      this.startTimer(5, () => {
        this.state.turnOrder = new ArraySchema<string>(...Object.keys(this.state.players).sort())
        this.state.inLobby = false
      })
    } else if (message.command === "renamePlayer") {
      this.state.players[client.sessionId].name = message.name
    } else if (message.command === "endTurn") {
      do {
        this.state.currentTurn = (this.state.currentTurn + 1) % this.state.turnOrder.length
      } while (this.state.players[this.state.turnOrder[this.state.currentTurn]].outOfGame)
    }
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