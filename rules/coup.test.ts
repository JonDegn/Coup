import { Coup, Deck, Character, PlayerData, Hand } from "./coup"



// describe('Coup', () => {

//     it('adds players on creation', () => {
//         const coup = new Coup(['bob'])
//         expect(coup.players.length).toEqual(1)
//     })

//     it('has correct player names', () => {
//         const coup = new Coup(['bob', 'joe'])
//         expect(coup.players[0].name).toEqual('bob')
//         expect(coup.players[1].name).toEqual('joe')
//     })

//     it('adds players with no hand', () => {
//         const coup = new Coup(['bob'])
//         expect(coup.players[0].hand.cards.length).toEqual(0)
//     })

// })

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