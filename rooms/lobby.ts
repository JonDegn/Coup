import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

// An abstract player object, demonstrating a potential 2D world position
export class Player extends Schema {
  @type("string")
  name:string

  constructor(name:string){
    super()
    this.name = name;
  }
}

// Our custom game state, an ArraySchema of type Player only at the moment
export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  something = "This attribute won't be sent to the client-side";

  createPlayer (name: string, id: string) {
      this.players[ id ] = new Player(name);
  }

  removePlayer (id: string) {
      delete this.players[ id ];
  }

  list() {
    return ['bob','joe','sally']
  }
}

export class GameRoom extends Room<State> {
  // Colyseus will invoke when creating the room instance
  onCreate(options: any) {
    console.log("lobby created")
    // initialize empty room state
    this.setState(new State());
  }

  // Called every time a client joins
  onJoin(client: Client, options: any) {
    console.log(`${options.name} joined`)
    this.state.createPlayer(options.name, client.sessionId)
    // this.state.players[client.sessionId] = new Player();
    console.log(this.state)
  }

  // Called every time this room receives a message
  onMessage(client: Client, message: any) {
    console.log("message:", message, "client:", client)
    // Retrieve a previously stored player by their sessionId
    // const player = this.state.players[client.sessionId];
    // // Pretend that we sent the room the message: {command: "left"}
    // if (message.command === "left") {
    //   player.x -= 1;
    // } else if (message.command === "right") {
    //   player.x += 1;
    // }

    // console.log(client.sessionId + " at, x: " + player.x, "y: " + player.y);
  }
}