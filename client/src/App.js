import React, { useEffect, useState } from 'react';
import Room from './routes/room'
import Main from './routes/main'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import logo from './logo.svg';
import './App.css';

function App() {
  // const [ready, setReady] = useState(false)
  // const [signedIn, setSignedIn] = useState(false)
  // const [players, setPlayers] = useState({})
  // const [name, setName] = useState('')
  // const [client, setClient] = useState(null)
  // const [room, setRoom] = useState(null)
  // const Colyseus = window.Colyseus

  // function joinLobby() {
  //   console.log(`${name} joining...`)
  //   client.joinOrCreate("lobby", { name }).then(room => {
  //     console.log(`${name} joined successfully`)
  //     setRoom(room)

  //     localStorage.setItem("roomId", room.id);
  //     localStorage.setItem("sessionId", room.sessionId);

  //     // room.onStateChange.once(s => {
  //     //   console.log("first? state change")
  //     //   setState(s)
  //     // })
  //     room.onStateChange(s => {
  //       console.log("state changed", s.players)
  //       setPlayers(s.players)
  //       setReady(s.players[room.sessionId].ready)
  //     })
  //     setSignedIn(true)


  //     // room.state.players.onAdd = (player, sessionId) => {
  //     //   setPlayers(players => { return { ...players, [sessionId]: player } })
  //     // }

  //     // room.state.players.onChange = (player, sessionId) => {
  //     //   console.log("onChange",player)
  //     //   setPlayers(players => { return { ...players, [sessionId]: player } })
  //     // }

  //     // room.state.players.onRemove = function (player, sessionId) {
  //     //   console.log(`${player.name} left`)
  //     //   setPlayers(players => { 
  //     //     console.log(players[sessionId])
  //     //     delete players[sessionId]
  //     //     console.log(players[sessionId])
  //     //     return players 
  //     //   })
  //     // }
  //   })
  // }

  // useEffect(() => {

  //   const location = window.document.location
  //   // use current hostname/port as colyseus server endpoint
  //   let endpoint = location.protocol.replace("http", "ws") + "//" + location.hostname;

  //   // development server
  //   if (location.port && location.port !== "80") { endpoint += ":3001" }

  //   const client = new Colyseus.Client(endpoint)
  //   setClient(client)

  //   var roomId = localStorage.getItem("roomId");
  //   var sessionId = localStorage.getItem("sessionId");

  //   client.reconnect(roomId, sessionId).then(r => {
  //     console.log("reconnected")
  //     setRoom(r)
  //     r.onStateChange(s => {
  //       console.log("state changed", s.players)
  //       setPlayers(s.players)
  //       setReady(s.players[r.sessionId].ready)
  //     })
  //     setSignedIn(true)
  //   }).catch(e => console.log(e))

  // }, [Colyseus])

  // function toggleReady() {
  //   room.send({ ready: !ready })
  //   // setReady(ready => {return !ready})
  // }
  return (
    // <div className="App">
    //   <h1>Game</h1>
    //   {signedIn && players ?
    //     <>
    //       <h2>Lobby:</h2>
    //       {Object.keys(players).map((pId) => {
    //         const p = players[pId]
    //         return (
    //         <div key={pId}>{p.name}{p.connected || ' (disconnected)'}{p.ready && ' - Ready!'}</div>
    //         )
    //       }
    //       )}
    //       <button onClick={toggleReady}>{ready ? 'Not Ready' : 'Ready'}</button>
    //       {Object.keys(players).filter((pId) => players[pId].ready).length === Object.keys(players).length &&
    //       <button onClick={()=>console.log("start game")}>Start Game</button>}
    //     </>
    //     :
    //     <>
    //       <label>Name
    //       <input type='text' value={name} onChange={e => setName(e.target.value)} />
    //       </label>
    //       <button onClick={joinLobby}>Join Lobby</button>
    //     </>
    //   }
    // 
    // </div>
    <Router>
      <Switch>
        {/* <Route path='/room/:roomId' component={Room} /> */}
        <Route component={Main} />
      </Switch>
    </Router>
  );
}

export default App;
