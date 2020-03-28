import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";


export class Player extends Schema {
  @type("string")
  name: string

  @type("boolean")
  ready: boolean = false

  @type("boolean")
  connected: boolean = true

  constructor(name: string) {
    super()
    this.name = name;
  }
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type("string")
  roomName: boolean = true

  @type("boolean")
  inLobby: boolean = true

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
  // Colyseus will invoke when creating the room instance
  onCreate(options: any) {
    this.setMetadata({roomName: options.roomName})
    console.log("lobby created", options)
    this.setState(new State())
    this.state.roomName = options.roomName
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
      console.log(`${this.state.players[client.sessionId].name} removed from state`)
      this.state.removePlayer(client.sessionId)
    }

    // this.state.removePlayer(client.sessionId)
  }

  // Called every time this room receives a message
  onMessage(client: Client, message: any) {
    console.log("message:", message)

    if (message.command === "toggleReady") {
      this.state.toggleReady(client.sessionId)
    } else if (message.command === "startGame") {
      this.state.inLobby = false
    } else if (message.command === "renamePlayer") {
      this.state.players[client.sessionId].name = message.name
    }
  }
}