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