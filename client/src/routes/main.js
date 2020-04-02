import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom'
import { Stage, Sprite, Text, Container, Graphics } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js'

function Main(props) {
    const Colyseus = window.Colyseus
    const [inLobby, setInLobby] = useState(false)
    const [players, setPlayers] = useState({})
    const [name, setName] = useState('')
    const [roomName, setRoomName] = useState('')
    const [client, setClient] = useState(null)
    const [room, setRoom] = useState(null)
    const [currentTurn, setCurrentTurn] = useState(0)
    const [turnOrder, setTurnOrder] = useState([])
    const [playerId, setPlayerId] = useState('')
    const [countdownTimer, setCountdownTimer] = useState(0)
    const [availableActions, setAvailableActions] = useState([])
    const [selectingActionTarget, setSelectingActionTarget] = useState(null)
    const [currentAction, setCurrentAction] = useState(null)

    function connect(r) {
        console.log(r)
        setPlayerId(r.sessionId)
        setRoom(r)
        r.onStateChange(s => {
            console.log("state changed", s)
            setPlayers(s.players)
            setInLobby(s.inLobby)
            setRoomName(s.roomName)
            setCurrentTurn(s.currentTurn)
            setTurnOrder(s.turnOrder)
            setCountdownTimer(s.countdownTimer)
            setAvailableActions(s.availableActions)
            setCurrentAction(s.currentAction)
            // setAvailableActions([])
            // console.log("actions",s.availableActions)
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
            console.log("reconnected", r.state)
            connect(r)
        }).catch(() => { })

    }, [Colyseus])

    function joinRoom() {
        client.getAvailableRooms('in-game').then(rooms => {
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
        client.create('in-game', { name, roomName }).then(r => {
            connect(r)
        })
    }

    function startGame() {
        room.send({ command: "startGame" })
    }

    function selectTargetForAction(pId) {
        room.send({ command: "action", action: selectingActionTarget, targetPlayerId: pId })
        setSelectingActionTarget(null)
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
                        <button onClick={() => room.send({ command: "toggleReady" })}>{players[playerId].ready ? 'Not Ready' : 'Ready'}</button>
                        {countdownTimer
                            ? <div>Starting game... {countdownTimer}</div>
                            : Object.keys(players).filter((pId) => players[pId].ready).length === Object.keys(players).length &&
                            <button onClick={startGame}>Start Game</button>}
                    </>
                    :
                    <>
                        <h1>{roomName}</h1>
                        {/* <Stage options={{ transparent: true }} width={1080} height={800}>
                            {turnOrder.map((pId, pNum) => {
                                const p = players[pId]
                                return (
                                    <Container key={pId} x={(256 + 64) * (pNum % 3) + 32} y={Math.floor(pNum / 3) * (256)}>
                                        <Text text={`${pNum === currentTurn ? '🟢' : ''}${p.name} ${p.connected ? '' : ' (disconnected)'}`} y={32} style={new PIXI.TextStyle({ fill: `${p.outOfGame ? 'gray' : 'black'}` })} />
                                        <Text text={`Coins: ${p.coins}`} style={new PIXI.TextStyle({ fontSize: 16, fill: `${p.outOfGame ? 'gray' : 'black'}` })} y={64} />
                                        <Sprite image={`./card_${p.hand[0]}.png`} scale={{ x: 0.5, y: 0.5 }} x={0} y={96} />
                                        <Sprite image={`./card_${p.hand[1]}.png`} scale={{ x: 0.5, y: 0.5 }} x={128} y={96} />
                                    </Container>
                                )
                            })}
                        </Stage> */}
                        {selectingActionTarget && <h2>Select a player:</h2>}
                        {currentAction && currentAction.sourcePlayer !== playerId &&
                            <div>
                                <h2>{players[currentAction.sourcePlayer].name} is targetting {players[currentAction.targetPlayer].name}</h2>
                                {currentAction.canChallenge && <button>Challenge!</button>}
                                {currentAction.playersThatCanBlock.filter(pId => pId === playerId).length ? 
                                currentAction.charactersThatCanBlock.map(c => <button>Block as {c}</button>)
                                :null}
                            </div>}
                        <table border={1} style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr><td>Current Turn</td><td>Player</td><td>Coins</td><td>Lost Influence</td></tr>
                            </thead>
                            <tbody>
                                {turnOrder.map((pId, pNum) => {
                                    const p = players[pId]
                                    return (
                                        <tr key={pId}>
                                            <td>{pNum === currentTurn ? 'X' : ''}</td>
                                            <td onClick={() => {
                                                if (selectingActionTarget && pId != playerId) {
                                                    selectTargetForAction(pId)
                                                }
                                            }}>{`${p.name} ${p.connected ? '' : ' (disconnected)'}`}</td>
                                            <td>{p.coins}</td>
                                            <td>{p.revealedHand.join()}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <h2>Actions:</h2>
                        <>
                            {
                                playerId === turnOrder[currentTurn] &&
                                availableActions.map(a =>
                                    <button key={a.actionType} onClick={() => {
                                        if (a.targetsPlayer) {  // Wait for player to select a target
                                            setSelectingActionTarget(a.actionType)
                                        } else {
                                            room.send({ command: "action", action: a.actionType })
                                        }
                                    }}>{a.label}</button>
                                )
                            }
                        </>
                        {/* <h2>Counter-actions:</h2>
                        <button onClick={() => room.send({ command: "counterAction", action: "steal" })}>Block Stealing</button>
                        <button onClick={() => room.send({ command: "counterAction", action: "foreignAid" })}>Block Foreign Aid</button>
                        <button onClick={() => room.send({ command: "counterAction", action: "assassinate" })}>Block Assassination</button>*/}
                        <button onClick={() => room.send({ command: "endTurn" })}>end turn (temp)</button>
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