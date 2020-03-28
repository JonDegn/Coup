import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom'



function Room(props) {
    const Colyseus = window.Colyseus
    const roomId = props.match.params.roomId
    const [ready, setReady] = useState(false)
    const [signedIn, setSignedIn] = useState(false)
    const [players, setPlayers] = useState({})
    const [name, setName] = useState('')
    const [client, setClient] = useState(null)
    const [room, setRoom] = useState(null)
    const [inLobby, setInLobby] = useState(true)

    function connect(r) {
        setRoom(r)
        r.onStateChange(s => {
            console.log("state changed", s.players)
            setPlayers(s.players)
            setReady(s.players[r.sessionId].ready)
            setInLobby(s.inLobby)
        })
        // setSignedIn(true)
        localStorage.setItem("roomId", room.id);
        localStorage.setItem("sessionId", room.sessionId);
    }

    function joinGame() {
        client.joinById(roomId).then(r => {
            connect(r)
        }).catch(e => {
            console.log(e)
        })
    }

    useEffect(() => {
        const location = window.document.location
        let endpoint = location.protocol.replace("http", "ws") + "//" + location.hostname;
        if (location.port && location.port !== "80") { endpoint += ":3001" }

        const client = new Colyseus.Client(endpoint)
        setClient(client)

        client.getAvailableRooms('lobby').then(rooms => {
            if (!rooms.filter(r => r.roomId === roomId).length) {
                console.log("no room. go away")
                props.history.push('/')
            }
        })

        var sessionId = localStorage.getItem("sessionId");
        client.reconnect(roomId, sessionId).then(r => {
            console.log("reconnected")
            connect(r)
        }).catch(() => {
            console.log("failed reconnect.")
            joinGame()
        })
    }, [Colyseus])

    return (
        <div>
            <h1>Game</h1>
            {signedIn && players ?
                inLobby ?
                    <>
                        <h2>Lobby:</h2>
                        {Object.keys(players).map((pId) => {
                            const p = players[pId]
                            return (
                                <div key={pId}>{p.name}{p.connected || ' (disconnected)'}{p.ready && ' - Ready!'}</div>
                            )
                        }
                        )}
                        <button onClick={() => room.send({ command: "toggleReady" })}>{ready ? 'Not Ready' : 'Ready'}</button>
                        {Object.keys(players).filter((pId) => players[pId].ready).length === Object.keys(players).length &&
                            <button onClick={() => room.send({ command: "startGame" })}>Start Game</button>}
                    </>
                    :
                    <div>In Game!</div>
                :
                <>
                    <label>Name
                        <input type='text' value={name} onChange={e => setName(e.target.value)} />
                    </label>
                    <button onClick={(joinGame)}>Join Game</button>
                </>
            }

        </div>)
}

export default withRouter(Room)