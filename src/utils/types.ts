export interface DBUser {
    id: string
    username: string
    pic: string
    friends?: string[]
    friendreqs?: {
        id: string
        timestamp: number
    }[]
    gamereqs?: string[]
    notifications?: {
        id: string
		pic?: string
		text: string
		btn?: {
			text: string
			callback: () => void
			class: any
		}[]
	}[]
    bio?: string
    date?: string
    settings?: {
        friendMsg?: boolean
        friendChal?: boolean
    }
    status?: {
        state: 'online' | 'offline'
        lastChanged: number
    }
}

export interface DBGame {
    id: string
    game: string
    players: string[]
    joined?: string[]
    declined?: string[]
    created: number
    creator: string
    status: 'n' /* not started */ | 's' /* started */ | 'e' /* ended */
}

export interface UNOCard {
    type: 'u'
    card: `${'b' | 'g' | 'y' | 'r'}${'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'0'|'s'|'f'|'p'}` | 'w4' | 'wc' | 'b'
}

export interface PCard {
    type: 'p'
    card: `${'h' | 's' | 'c' | 'd'}${'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'11'|'12'|'13'}` | 'j1' | 'j2' | 'b'
}