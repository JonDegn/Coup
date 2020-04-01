import { Coup, Deck, Character, PlayerData, Hand, ActionType, CurrentAction } from "./coup"

describe('Exchanging a card', () => {
    it('does not get the same card when not replacing first', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards = [Character.Assassin, Character.Assassin]
        coup.deck.cards = [Character.Duke]
        const cardToExchange = coup.players.id1.hand.cards[0]
        coup.exchangeCard('id1', cardToExchange, false)

        expect(coup.players.id1.hand.cards).toEqual([Character.Assassin, Character.Duke])
        expect(coup.deck.cards).toEqual([Character.Assassin])
    })

    it('can get the same card when replacing first', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards = [Character.Duke, Character.Assassin]
        coup.deck.cards = [Character.Duke]
        const cardToExchange = coup.players.id1.hand.cards[0]
        coup.exchangeCard('id1', cardToExchange, true)

        expect(coup.players.id1.hand.cards).toEqual([Character.Assassin, Character.Duke])
        expect(coup.deck.cards).toEqual([Character.Duke])
    })
})

describe('On creation', () => {

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
})

describe('When performing action: Coup', () => {
    it('costs 7 and makes a player lose influence', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.coins = 7
        const response = coup.addAction(ActionType.Coup, 'id1', 'id2');
        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toHaveLength(0)
        expect(response.playersThatCanBlock).toHaveLength(0)
        expect(coup.actionStack[0].action).toEqual(ActionType.Coup)
        const actionResolution = coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(0)
        expect(actionResolution.playerToLoseInfluence).toEqual("id2")
        expect(actionResolution.playerToExchange).toEqual(null)
        expect(actionResolution.characterToExchange).toEqual(null)
        expect(coup.actionStack).toHaveLength(0)
    })
})

describe('When performing action: Income', () => {
    it('adds 1 coin', () => {
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
})

describe('When performing action: Foreign Aid', () => {
    it('adds 2 coins', () => {
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
        coup.players.id3.outOfGame = true   // id3 is out of the game
        const response = coup.addAction(ActionType.ForeignAid, 'id1');
        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toEqual([Character.Duke])
        expect(response.playersThatCanBlock).toEqual(['id2']) // id3 not included
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.ForeignAid)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(4)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be blocked', () => {
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
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Block)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(2)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be blocked and the block can be challenged (bluff)', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.addAction(ActionType.ForeignAid, 'id1');                           // id1: Foreign Aid
        coup.players.id2.hand.cards[0] = Character.Assassin
        coup.players.id2.hand.cards[1] = Character.Assassin
        coup.addAction(ActionType.Block, 'id2', 'id1', Character.Duke);         // id2: Block Foreign Aid (Bluff)
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(true)

        const response = coup.addAction(ActionType.Challenge, 'id1', 'id2');    // id1: Challenge Block

        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toHaveLength(0)
        expect(coup.actionStack).toHaveLength(3)
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Challenge)

        // Resolve Challenge
        const actionResolution = coup.resolveAction()
        expect(actionResolution.playerToLoseInfluence).toEqual("id2")
        expect(coup.actionStack).toHaveLength(1)

        // Resolve Foreign Aid
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(4)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be blocked and the block can be challenged (truth)', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.addAction(ActionType.ForeignAid, 'id1');                           // id1: Foreign Aid
        coup.players.id2.hand.cards[0] = Character.Duke
        coup.addAction(ActionType.Block, 'id2', 'id1', Character.Duke);         // id2: Block Foreign Aid (Truth)
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(false)
        const response = coup.addAction(ActionType.Challenge, 'id1', 'id2');    // id1: Challenge Block

        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toHaveLength(0)
        expect(coup.actionStack).toHaveLength(3)
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Challenge)

        // Resolve Challenge
        const actionResolution = coup.resolveAction()
        expect(actionResolution.playerToLoseInfluence).toEqual("id1")
        expect(actionResolution.playerToExchange).toEqual("id2")
        expect(actionResolution.characterToExchange).toEqual(Character.Duke)
        expect(coup.actionStack).toHaveLength(2)

        // Resolve Block Foreign Aid
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(2)
        expect(coup.actionStack).toHaveLength(0)
    })
})

describe('When performing action: Tax', () => {

    it('adds 3 coins', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        const response = coup.addAction(ActionType.Tax, 'id1', 'id1', Character.Duke);
        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toEqual([])
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Tax)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(5)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be challenged (bluff)', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards[0] = Character.Assassin
        coup.players.id1.hand.cards[1] = Character.Assassin
        let response = coup.addAction(ActionType.Tax, 'id1');
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(true)
        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toEqual([])
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Tax)
        response = coup.addAction(ActionType.Challenge, 'id2', 'id1')
        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toEqual([])
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Challenge)
        const actionResolution = coup.resolveAction()
        expect(actionResolution.playerToLoseInfluence).toEqual("id1")
        expect(actionResolution.playerToExchange).toEqual(null)
        expect(actionResolution.characterToExchange).toEqual(null)

        expect(coup.players.id1.coins).toEqual(2)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be challenged (truth)', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards[0] = Character.Duke
        let response = coup.addAction(ActionType.Tax, 'id1', 'id1', Character.Duke);
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(false)
        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toEqual([])
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Tax)
        response = coup.addAction(ActionType.Challenge, 'id2', 'id1')
        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toEqual([])
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Challenge)
        const actionResolution = coup.resolveAction()
        expect(actionResolution.playerToLoseInfluence).toEqual("id2")
        expect(actionResolution.playerToExchange).toEqual("id1")
        expect(actionResolution.characterToExchange).toEqual(Character.Duke)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(5)
        expect(coup.actionStack).toHaveLength(0)
    })
})

describe('When performing action: Steal', () => {
    it('takes 2 coins from another player', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        const response = coup.addAction(ActionType.Steal, 'id1', 'id2', Character.Captain);
        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toEqual([Character.Captain, Character.Ambassador])
        expect(response.playersThatCanBlock).toEqual(['id2'])
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Steal)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(4)
        expect(coup.players.id2.coins).toEqual(0)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('takes 1 coin when only 1 is available', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id2.coins = 1
        const response = coup.addAction(ActionType.Steal, 'id1', 'id2', Character.Captain);
        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toEqual([Character.Captain, Character.Ambassador])
        expect(response.playersThatCanBlock).toEqual(['id2'])
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Steal)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(3)
        expect(coup.players.id2.coins).toEqual(0)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be challenged (bluff)', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards[0] = Character.Captain  // has captain, but it has been flipped up (lost)
        coup.players.id1.hand.lostInfluence[0] = true
        coup.players.id1.hand.cards[1] = Character.Assassin
        coup.addAction(ActionType.Steal, 'id1', 'id2', Character.Captain);
        expect(coup.actionStack[coup.actionStack.length - 1].bluff).toEqual(true)

        const response = coup.addAction(ActionType.Challenge, 'id2', 'id1');
        expect(response.canChallenge).toEqual(false)
        expect(response.charactersThatCanBlock).toEqual([])
        expect(response.playersThatCanBlock).toHaveLength(0)
        expect(coup.actionStack).toHaveLength(2)
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Challenge)
        const actionResolution = coup.resolveAction()
        expect(actionResolution.playerToLoseInfluence).toEqual("id1")
        expect(actionResolution.playerToExchange).toEqual(null)
        expect(actionResolution.characterToExchange).toEqual(null)

        expect(coup.players.id1.coins).toEqual(2)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be challenged (truth)', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards[0] = Character.Captain
        coup.addAction(ActionType.Steal, 'id1', 'id2', Character.Captain);
        coup.addAction(ActionType.Challenge, 'id2', 'id1');
        const actionResolution = coup.resolveAction()

        expect(actionResolution.playerToLoseInfluence).toEqual("id2")
        expect(actionResolution.playerToExchange).toEqual("id1")
        expect(actionResolution.characterToExchange).toEqual(Character.Captain)

        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(4)
        expect(coup.players.id2.coins).toEqual(0)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('can be blocked', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.addAction(ActionType.Steal, 'id1', 'id2', Character.Captain);
        const response = coup.addAction(ActionType.Block, 'id2', 'id1', Character.Ambassador);
        expect(coup.actionStack).toHaveLength(2)
        expect(coup.actionStack[coup.actionStack.length - 1].action).toEqual(ActionType.Block)
        coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(2)
        expect(coup.players.id2.coins).toEqual(2)
        expect(coup.actionStack).toHaveLength(0)
    })
})

describe('When performing action: Assassinate', () => {
    it('costs 3 and makes a player lose influence', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.coins = 7
        coup.players.id1.hand.cards[0] = Character.Assassin
        const response = coup.addAction(ActionType.Assassinate, 'id1', 'id2', Character.Assassin);
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(false)
        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toEqual([Character.Contessa])
        expect(response.playersThatCanBlock).toEqual(['id2'])
        const actionResolution = coup.resolveAction()
        expect(coup.players.id1.coins).toEqual(4)
        expect(actionResolution.playerToLoseInfluence).toEqual("id2")
        expect(actionResolution.playerToExchange).toEqual(null)
        expect(actionResolution.characterToExchange).toEqual(null)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('is a bluff if player does not have assassin', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards[0] = Character.Duke
        coup.players.id1.hand.cards[1] = Character.Duke
        coup.addAction(ActionType.Assassinate, 'id1', 'id2', Character.Assassin);
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(true)
    })
})

describe('When performing action: Exchange', () => {
    it('allows player to exchange', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards[0] = Character.Ambassador
        const response = coup.addAction(ActionType.Exchange, 'id1', 'id1', Character.Ambassador);
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(false)
        expect(response.canChallenge).toEqual(true)
        expect(response.charactersThatCanBlock).toHaveLength(0)
        expect(response.playersThatCanBlock).toHaveLength(0)
        const actionResolution = coup.resolveAction()
        
        expect(actionResolution.playerToLoseInfluence).toEqual(null)
        expect(actionResolution.playerToExchange).toEqual(null)
        expect(actionResolution.characterToExchange).toEqual(null)
        expect(actionResolution.cardsToReturn).toEqual(2)
        expect(coup.actionStack).toHaveLength(0)
    })

    it('is a bluff if player does not have ambassador', () => {
        const expectedPlayers = {
            id1: {
                name: "Bob"
            },
            id2: {
                name: "Joe"
            }
        }
        const coup = new Coup(expectedPlayers)
        coup.players.id1.hand.cards[0] = Character.Duke
        coup.players.id1.hand.cards[1] = Character.Duke
        coup.addAction(ActionType.Exchange, 'id1', 'id2', Character.Ambassador);
        expect(coup.actionStack[coup.actionStack.length-1].bluff).toEqual(true)
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

    it('adds card to hand', () => {
        const player = new PlayerData('id', 'Bob', new Hand(Character.Assassin, Character.Assassin))
        player.addToHand(Character.Duke)
        expect(player.hand.cards).toHaveLength(3)
        expect(player.hand.cards[2]).toEqual(Character.Duke)
        expect(player.hand.lostInfluence[2]).toEqual(false)
    })

    it('removes card from hand', () => {
        const player = new PlayerData('id', 'Bob', new Hand(Character.Duke, Character.Assassin))
        player.hand.lostInfluence[1] = true
        player.removeFromHand(Character.Duke)
        expect(player.hand.cards).toHaveLength(1)
        expect(player.hand.cards[0]).toEqual(Character.Assassin)
        expect(player.hand.lostInfluence[0]).toEqual(true)
    })

    it('loses influence', () => {
        const player = new PlayerData('id', 'Bob', new Hand(Character.Duke, Character.Assassin))
        player.loseInfluence(Character.Duke)
        expect(player.hand.lostInfluence[0]).toEqual(true)
        expect(player.hand.lostInfluence[1]).toEqual(false)
    })

    it('is out of game when all influence is lost', () => {
        const player = new PlayerData('id', 'Bob', new Hand(Character.Duke, Character.Assassin))
        player.loseInfluence(Character.Duke)
        player.loseInfluence(Character.Assassin)
        expect(player.hand.lostInfluence[0]).toEqual(true)
        expect(player.hand.lostInfluence[1]).toEqual(true)
        expect(player.outOfGame).toEqual(true)
    })
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
})