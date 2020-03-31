import { Coup, Deck, Character, PlayerData, Hand, ActionType, CurrentAction } from "./coup"



describe('Coup', () => {


    it('adds players on creation', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        expect(Object.keys(coup.players).length).toEqual(Object.keys(expectedPlayers).length)
        expect(coup.players.id1.name).toEqual(expectedPlayers.id1.name)
        expect(coup.players.id2.name).toEqual(expectedPlayers.id2.name)
    })

    it('deals 2 cards to each player', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        expect(coup.players.id1.hand.cards).toHaveLength(2)
        expect(coup.players.id1.hand.lostInfluence[0]).toEqual(false)
        expect(coup.players.id1.hand.lostInfluence[1]).toEqual(false)
        expect(coup.players.id2.hand.cards).toHaveLength(2)
        expect(coup.players.id2.hand.lostInfluence[0]).toEqual(false)
        expect(coup.players.id2.hand.lostInfluence[1]).toEqual(false)
        expect(coup.deck.cards).toHaveLength(15 - Object.keys(coup.players).length * 2) // Deck should have 15 - 2 players * 2 cards
    })

    it('has 15 cards in the deck with 3 players', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            },
            id3: {
                name: "Billy"
            }
        }
        const coup = new Coup(expectedPlayers)
        expect(coup.deck.cards).toHaveLength(15 - Object.keys(coup.players).length * 2) // 15 - 3 players * 2 cards
    })

    it('has 15 cards in the deck with 6 players', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            },
            id3: {
                name: "Billy"
            },
            id4: {
                name: "Jane"
            },
            id5: {
                name: "Beth"
            },
            id6: {
                name: "Kyle"
            }
        }
        const coup = new Coup(expectedPlayers)
        expect(coup.deck.cards).toHaveLength(15 - Object.keys(coup.players).length * 2) // 15 - 6 players * 2 cards
    })

    it('has 20 cards in the deck with 7 players', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            },
            id3: {
                name: "Billy"
            },
            id4: {
                name: "Jane"
            },
            id5: {
                name: "Beth"
            },
            id6: {
                name: "Kyle"
            },
            id7: {
                name: "Josh"
            }
        }
        const coup = new Coup(expectedPlayers)
        expect(coup.deck.cards).toHaveLength(20 - Object.keys(coup.players).length * 2) // 20 - 7 players * 2 cards
    })

    it('has 25 cards in the deck with 9 players', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            },
            id3: {
                name: "Billy"
            },
            id4: {
                name: "Jane"
            },
            id5: {
                name: "Beth"
            },
            id6: {
                name: "Kyle"
            },
            id7: {
                name: "Josh"
            },
            id8: {
                name: "Andy"
            },
            id9: {
                name: "Jon"
            }
        }
        const coup = new Coup(expectedPlayers)
        expect(coup.deck.cards).toHaveLength(25 - Object.keys(coup.players).length * 2) // 25 - 9 players * 2 cards
    })

    it('creates turn order', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        expect(coup.turnOrder).toEqual(["id1", "id2"])
    })

    it('performs action: income', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        const response = coup.addAction(ActionType.Income, 'id1');
        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toHaveLength(0)
        expect(response.playersThatCanBlock).toHaveLength(0)
        expect(coup.actionStack[0].action).toEqual(ActionType.Income)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(3)
        expect(coup.actionStack).toHaveLength(0)
    }) 

    it('performs action: foreign aid', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        const response = coup.addAction(ActionType.ForeignAid, 'id1');
        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toEqual([Character.Duke])
        expect(response.playersThatCanBlock).toEqual(['id2'])
        expect(coup.actionStack[coup.actionStack.length-1].action).toEqual(ActionType.ForeignAid)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(4)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('performs counter-action: block foreign aid', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.addAction(ActionType.ForeignAid, 'id1');
        const response = coup.addAction(ActionType.Block, 'id2', 'id1', Character.Duke);

        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toHaveLength(0)
        expect(coup.actionStack).toHaveLength(2)
        expect(coup.actionStack[coup.actionStack.length-1].action).toEqual(ActionType.Block)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(2)
        expect(coup.actionStack).toHaveLength(0)
    }) 

})

describe('Player', () => {

    it('has correct name', () => {
        const expectedName = 'Bob'
        const player = new PlayerData('id', expectedName, new Hand(Character.Assassin, Character.Contessa))
        expect(player.name).toEqual(expectedName)
    })

    it('adds cards to hand on creation', () => {
        const card1 = Character.Assassin
        const card2 = Character.Contessa

        const player = new PlayerData('id', 'Bob', new Hand(card1, card2))

        expect(player.hand).toBeDefined()
        expect(player.hand.cards).toHaveLength(2)
        expect(player.hand.cards[0]).toEqual(card1)
        expect(player.hand.cards[1]).toEqual(card2)
        expect(player.hand.lostInfluence[0]).toEqual(false)
        expect(player.hand.lostInfluence[1]).toEqual(false)
    })

    // it('has correct player names', () => {
    //     const coup = new Coup(['bob', 'joe'])
    //     expect(coup.players[0].name).toEqual('bob')
    //     expect(coup.players[1].name).toEqual('joe')
    // })

    // it('adds players with no hand', () => {
    //     const coup = new Coup(['bob'])
    //     expect(coup.players[0].hand.cards.length).toEqual(0)
    // })

})

describe('Deck', () => {
    it('has 15 cards when using 3 of each character', () => {
        const deck = new Deck(3);

        expect(deck.cards.length).toEqual(15)
    })

    it('is shuffled', () => {
        const deck = new Deck(3);

        expect(deck.cards.slice(0, 5)).not.toEqual([Character.Ambassador, Character.Assassin, Character.Captain, Character.Contessa, Character.Duke])
    })

    it('has the right amount of each character', () => {
        const numberOfEachCharacter = 5
        const deck = new Deck(numberOfEachCharacter);

        expect(deck.cards.filter((c => c === Character.Ambassador)).length).toEqual(numberOfEachCharacter)
        expect(deck.cards.filter((c => c === Character.Assassin)).length).toEqual(numberOfEachCharacter)
        expect(deck.cards.filter((c => c === Character.Captain)).length).toEqual(numberOfEachCharacter)
        expect(deck.cards.filter((c => c === Character.Contessa)).length).toEqual(numberOfEachCharacter)
        expect(deck.cards.filter((c => c === Character.Duke)).length).toEqual(numberOfEachCharacter)
    })

    it('removes correct card when drawn', () => {
        const deck = new Deck(1);
        const count = deck.cards.length
        const expected = deck.cards[0]
        const actual = deck.drawCard()

        expect(deck.cards.length).toEqual(count - 1)
        expect(actual).toEqual(expected)
    })

    it('adds correct card when replaced', () => {
        const numberOfEachCharacter = 1
        const deck = new Deck(numberOfEachCharacter);
        const firstFiveCards = deck.cards.slice(0, 5)
        const expectedCount = deck.cards.length + 1

        deck.replaceAndShuffle(Character.Assassin)

        expect(deck.cards.length).toEqual(expectedCount)
        expect(deck.cards.filter(c => c === Character.Assassin).length).toEqual(numberOfEachCharacter + 1)
    })

    it('shuffles deck when card is replaced', () => {
        const deck = new Deck(1);
        const firstFiveCards = deck.cards.slice(0, 5)

        deck.replaceAndShuffle(Character.Assassin)

        expect(deck.cards.slice(0, 5)).not.toEqual(firstFiveCards)
    })


    // it('has 15 card with 3 players', () => {
    //     const coup = new Coup(['bob', 'joe','sally'])
    //     expect(coup.deck.cards.length).toEqual(15)
    // })
    // it('has 15 card with 6 players', () => {

    // })
    // it('has 20 card with 7 players', () => {

    // })
    // it('has 25 card with 9 players', () => {

    // })
})