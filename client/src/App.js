import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [signedIn, setSignedIn] = useState(false)
  const [players, setPlayers] = useState([])
  const [name, setName] = useState('')
  const [client, setClient] = useState(null)
  const [room, setRoom] = useState(null)
  const Colyseus = window.Colyseus

  function joinRoom() {
    console.log(`${name} joining...`)
    client.joinOrCreate("lobby", { name }).then(room => {
      console.log(`${name} joined successfully`)
      setRoom(room)
      setSignedIn(true)

      room.state.players.onAdd = (player, sessionId) => {
        // console.log(players, player)

        setPlayers(players => [...players, player])
      }
    })
  }



  useEffect(() => {

    const location = window.document.location
    // use current hostname/port as colyseus server endpoint
    let endpoint = location.protocol.replace("http", "ws") + "//" + location.hostname;

    // development server
    if (location.port && location.port !== "80") { endpoint += ":3001" }

    console.log(endpoint)

    setClient(new Colyseus.Client(endpoint))

  }, [Colyseus])

  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <h1>Game</h1>
      {signedIn ?
        <>
          <h2>Current Players:</h2>
          {players.map((p) => <div key={p.name}>{p.name}</div>)}
        </>
        :
        <>
          <label>Name
          <input type='text' value={name} onChange={e => setName(e.target.value)} />
          </label>
          <button onClick={joinRoom}>Join</button>
        </>
      }

    </div>
  );
}

export default App;
