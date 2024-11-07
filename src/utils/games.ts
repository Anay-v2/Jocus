export interface Game {
    id: string
    name: string
    players: [number, number]
    deck: 'n' /* normal deck */ | 'j' /* no jokers */ | 'c' /* custom deck */
    tags: string[]
    rules: string
}

export const games: Game[] = [
    {
        id: 'uno',
        name: 'Uno',
        players: [2, 6],
        deck: 'c',
        tags: ['uno', 'family', 'strategy'],
        rules: `
<h4 class="font-alt text-xl font-semibold">Objective</h4>
<p>Be the first player to score 500 points by getting rid of all your cards in each round.</p>

<h4 class="font-alt text-xl font-semibold">Setup</h4>
<p>Each player is dealt 7 cards. The remaining deck is placed in the center, and the top card is turned to start the Discard Pile.</p>

<h4 class="font-alt text-xl font-semibold">Gameplay</h4>
<p>Players take turns matching a card from their hand to the Discard Pile by color, number, or symbol. If no match is available, draw one card from the Draw Pile. If the drawn card can be played, play it; otherwise, keep it.</p>

<h5 class="font-alt text-xl font-semibold">Special Cards</h5>
<ul>
    <li><span class="font-semibold">Skip</span>: Next player loses their turn.</li>
    <li><span class="font-semibold">Reverse</span>: Reverses the turn order.</li>
    <li><span class="font-semibold">Draw Two</span>: Next player draws two cards and loses their turn.</li>
    <li><span class="font-semibold">Wild</span>: Allows the player to choose a new color.</li>
    <li><span class="font-semibold">Wild Draw Four</span>: Choose a new color, and the next player draws four cards and loses their turn.</li>
</ul>

<h4 class="font-alt text-xl font-semibold">Calling UNO</h4>
<p>When you have only one card left, you must yell “UNO!” If another player catches you not saying it, you must draw two cards.</p>

<h4 class="font-alt text-xl font-semibold">Winning a Round</h4>
<p>The first player to get rid of all their cards wins the round. The remaining players' cards are counted, and points are added to the winner’s score based on card values.</p>

<h5 class="font-alt text-xl font-semibold">Card Values</h5>
<ul>
    <li>Number cards: Face value.</li>
    <li>Special cards: 20 points each.</li>
    <li>Wild and Wild Draw Four: 50 points each.</li>
</ul>

<h4 class="font-alt text-xl font-semibold">Winning the Game</h4>
<p>The game ends when a player reaches 500 points. They are declared the winner!</p>
        `
    },
    {
        id: 'uno-flip',
        name: 'Uno flip',
        players: [2, 6],
        deck: 'c',
        tags: ['uno', 'family', 'strategy'],
        rules: `
            Refer to the original UNO rules if you haven't read them.
            <h4 class="font-alt font-semibold text-xl">Light and dark side</h4>
            <p>There are two sides of cards: light and dark. At the start of the game, the light side is in play.</p>
            <h4 class="font-alt font-semibold text-xl">Flipping</h4>
<p>When a player plays a flip card, the other side is in play now.</p>

<h5 class="font-alt font-semibold text-xl">Dark Side Action Cards</h5>
<ul>
    <li><span class="font-semibold">Draw Five</span>: The next player draws five cards and loses their turn.</li>
    <li><span class="font-semibold">Skip Everyone</span>: All players lose their turn, and play returns to the card's player.</li>
    <li><span class="font-semibold">Reverse</span>: Reverses the direction of play.</li>
    <li><span class="font-semibold">Wild</span>: Allows the player to choose a new color.</li>
    <li><span class="font-semibold">Wild Draw Color</span>: The player selects a color, and the next player draws cards until they find a card of that color.</li>
</ul>
        `
    },
    {
        id: 'bhabhi',
        name: 'Bhabhi',
        players: [3, 6],
        deck: 'j',
        tags: ['strategy', 'family', 'competetive'],
        rules: `
            WIP
        `
    },
    {
        id: 'bluff',
        name: 'Bluff',
        players: [3, 10],
        deck: 'n',
        tags: ['psychology', 'family'],
        rules: `
            <h4 class="font-alt text-xl font-semibold">Objective</h4>
<p>The goal of Bluff is to be the first player to get rid of all your cards.</p>

<h4 class="font-alt text-xl font-semibold">Setup</h4>
<p>Use a standard deck of 52 cards. Deal all cards as evenly as possible to each player.</p>

<h4 class="font-alt text-xl font-semibold">Gameplay</h4>
<p>Players take turns in a clockwise direction. Each turn, a player places one or more cards face-down in the center, declaring their rank (e.g., "two Kings"). The rank must stay the same for each round.</p>

<h5 class="font-alt text-xl font-semibold">Calling a Bluff</h5>
<p>After a player declares and places cards, any other player may call "Bluff" if they think the cards are not the rank stated. If called:</p>
<ul>
    <li>If the cards match the declared rank, the challenger must pick up the entire pile.</li>
    <li>If the cards do not match, the bluffer picks up the pile.</li>
</ul>
<p>Note that the Joker is always valid.</p>

<h4 class="font-alt text-xl font-semibold">Passing</h4>
<p>If no one calls "Bluff," the game continues to the next player, who must declare cards of the next rank in sequence. Players can pass their turn if they do not wish to play any cards.</p>

<h4 class="font-alt text-xl font-semibold">Winning the Game</h4>
<p>The game ends when a player successfully discards all their cards. This player is declared the winner!</p>
        `
    }
]