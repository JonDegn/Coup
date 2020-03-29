import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom'
import { Stage, Sprite, Text, Container, Graphics } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js'

function Main(props) {
    const Colyseus = window.Colyseus
    const [ready, setReady] = useState(false)
    const [inLobby, setInLobby] = useState(false)
    const [players, setPlayers] = useState({})
    const [name, setName] = useState('')
    const [roomName, setRoomName] = useState('')
    const [client, setClient] = useState(null)
    const [room, setRoom] = useState(null)
    const [currentTurn, setCurrentTurn] = useState(0)
    const [turnOrder, setTurnOrder] = useState([])
    const [state, setState] = useState({})
    // const [pixiApp, setPixiApp] = useState(null)
    // const [textures, setTextures] = useState({})
    // const [sprites, setSprites] = useState({})
    // const [loadingRoom, setLoadingRoom] = useState(true)

    function connect(r) {
        console.log(r)
        setRoom(r)
        r.onStateChange(s => {
            console.log("state changed", s)
            setPlayers(s.players)
            setReady(s.players[r.sessionId].ready)
            setInLobby(s.inLobby)
            setRoomName(s.roomName)
            setCurrentTurn(s.currentTurn)
            setTurnOrder(s.turnOrder)
            setState(s)
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

    // function setupCanvas() {
    //     document.body.appendChild(pixiApp.view)
    //     pixiApp.loader
    //         .add('ambassadorCard', 'card_ambassador.png')
    //         .add('assassinCard', 'card_assassin.png')
    //         .add('captainCard', 'card_captain.png')
    //         .add('contessaCard', 'card_contessa.png')
    //         .add('dukeCard', 'card_duke.png')
    //         .add('cardBack', 'card_back.png')
    //         .load((loader, resources) => {

    //             setTextures({
    //                 ambassador: resources.ambassadorCard.texture,
    //                 assassin: resources.assassinCard.texture,
    //                 captain: resources.captainCard.texture,
    //                 contessa: resources.contessaCard.texture,
    //                 duke: resources.dukeCard.texture,
    //                 back: resources.cardBack.texture
    //             })
    //             let sprites = {}
    //             Object.keys(players).forEach((pId, i) => {
    //                 let card1 = new PIXI.Sprite(resources.cardBack.texture)
    //                 card1.x = i * 2 * resources.cardBack.texture.width
    //                 let card2 = new PIXI.Sprite(resources.cardBack.texture)
    //                 card2.x = i * 2 * resources.cardBack.texture.width + resources.cardBack.texture.width

    //                 pixiApp.stage.addChild(card1);
    //                 pixiApp.stage.addChild(card2);

    //                 sprites[pId] = [card1, card2]
    //             })
    //             setSprites(sprites)
    //             console.log('Sprites', sprites)
    //         });
    //         console.log('loaded')
    // }

    function startGame() {
        room.send({ command: "startGame" })
        // setupCanvas()
    }

    // console.log(state)

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
                            <button onClick={startGame}>Start Game</button>}
                    </>
                    :
                    //<Game client={client} roomName={roomName} players={players} />
                    <>
                        <h1>{roomName}</h1>
                        <Stage options={{ transparent: true }} width={1080} height={800}>
                            {turnOrder.map((pId, pNum) => {
                                const p = players[pId]
                                return (
                                    <Container key={pId} x={(256 + 64 )* (pNum % 3) + 32 } y={Math.floor(pNum / 3) * (256)}>
                                        <Text text={`${pNum === currentTurn? '🟢' : ''}${p.name} ${p.connected? '':' (disconnected)'}`}  y={32} style={new PIXI.TextStyle({fill:`${p.outOfGame? 'gray' : 'black'}`})}/>
                                        <Text text={`Coins: ${p.coins}`} style={new PIXI.TextStyle({fontSize:16,fill:`${p.outOfGame? 'gray' : 'black'}`})}  y={64}/>
                                        <Sprite image={`./card_${p.hand[0]}.png`} scale={{ x: 0.5, y: 0.5 }} x={0} y={96} />
                                        <Sprite image={`./card_${p.hand[1]}.png`} scale={{ x: 0.5, y: 0.5 }} x={128} y={96} />
                                    </Container>
                                )
                            })}
                        </Stage>
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