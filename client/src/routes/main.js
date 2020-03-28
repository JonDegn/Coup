import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom'


// function Join({ client, setPlayers, setReady }) {
//     const [name, setName] = useState('')
//     const [roomName, setRoomName] = useState('')

//     function joinRoom() {

//     }

//     function createRoom() {
//         client.create('lobby', { name, roomName }).then(r => {
//             localStorage.setItem("roomId", r.id);
//             localStorage.setItem("sessionId", r.sessionId);

//             room.onStateChange(s => {
//                 setPlayers(s.players)
//                 setReady(s.players[room.sessionId].ready)
//             })
//             setSignedIn(true)

//             // props.history.push(`/room/${r.id}`)
//         })
//     }

//     return (
//         <div>
//             <label>Username
//             <input type='text' value={name} onChange={e => setName(e.target.value)} />
//             </label>
//             <label>Room Name
//             <input type='text' value={roomName} onChange={e => setRoomName(e.target.value)} />
//             </label>
//             <button onClick={createRoom}>Create Room</button>
//             <button onClick={joinRoom}>Join Room</button>
//         </div>
//     )
// }

function Main(props) {
    const Colyseus = window.Colyseus
    const [ready, setReady] = useState(false)
    const [inLobby, setInLobby] = useState(false)
    const [players, setPlayers] = useState({})
    const [name, setName] = useState('')
    const [roomName, setRoomName] = useState('')
    const [client, setClient] = useState(null)
    const [room, setRoom] = useState(null)
    // const [loadingRoom, setLoadingRoom] = useState(true)

    function connect(r) {
        console.log(r)
        setRoom(r)
        r.onStateChange(s => {
            console.log("state changed", s.players)
            setPlayers(s.players)
            setReady(s.players[r.sessionId].ready)
            setInLobby(s.inLobby)
            setRoomName(s.roomName)
        })
        localStorage.setItem("roomId", r.id);
        localStorage.setItem("sessionId", r.sessionId);
    }

    useEffect(() => {
        const location = window.document.location
        let endpoint = location.protocol.replace("http", "ws") + "//" + location.hostname;
        if (location.port && location.port !== "80") { endpoint += ":3001" }
        const client = new Colyseus.Client(endpoint)
        setClient(client)

        var roomId = localStorage.getItem("roomId");
        var sessionId = localStorage.getItem("sessionId");

        client.reconnect(roomId, sessionId).then(r => {
            console.log("reconnected")
            connect(r)
        }).catch(() => { })
    }, [Colyseus])

    function joinRoom() {
        client.getAvailableRooms('lobby').then(rooms => {
            const matches = rooms.filter(r => r.metadata && r.metadata.roomName === roomName)
            if (matches.length > 0) {
                console.log(matches)
                client.joinById(matches[0].roomId, { name }).then(r => {
                    connect(r)
                })
            } else {
                console.log("no room found!")
            }
        })
    }

    function createRoom() {
        client.create('lobby', { name, roomName }).then(r => {
            connect(r)
        })
    }

    return (
        <div>
            {room && players ?
                inLobby ?
                    <>
                        <h1>{roomName}</h1>
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
                    <>
                    <h1>{roomName}</h1>
                    <div>In Game!</div>
                    </>
                :
                <>
                    <label>Username
                        <input type='text' value={name} onChange={e => setName(e.target.value)} />
                    </label>
                    <label>Room Name
                        <input type='text' value={roomName} onChange={e => setRoomName(e.target.value)} />
                    </label>
                    <button onClick={createRoom}>Create Room</button>
                    <button onClick={joinRoom}>Join Room</button>
                </>
            }
        </div>

    )


}

export default withRouter(Main)