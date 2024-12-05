<script setup lang="ts">
import SNavbar from '@/components/SNavbar.vue'
import { useDBUser } from '@/composables/fetch'
import router from '@/router'
import { games } from '@/utils/games'
import { authIJK, dbIJK } from '@/utils/injects'
import type { Auth } from 'firebase/auth'
import { set, type Database, ref as dbref, get } from 'firebase/database'
import { computed, inject, ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown, ArrowLeft, ArrowRight, Plus, X } from 'lucide-vue-next'
import type { DBGame, DBUser } from '@/utils/types'

const route = useRoute()
const game = route.params.id ? games.find(l => l.id === route.params.id) : 'n'
if (!game) router.push('/')
const auth = inject(authIJK) as Auth
const db = inject(dbIJK) as Database
const { dbuser, friends } = await useDBUser(auth, db)
const sortedFriends = computed(() => remFriends.value.sort((a,b) => {
	const diff = (a.status?.state === 'online' ? 1 : 0) - (b.status?.state === 'online' ? 1 : 0)
	if(diff !== 0) return -diff
	return (a.status?.lastChanged || 0) - (b.status?.lastChanged || 0)
}))
const g = ref(game === 'n' ? '' : game?.id || '')
const dpdwn = ref(false)

const p = ref(false)
const players: Ref<DBUser[]> = ref([])
const remFriends = computed(() =>
	friends.value
		.filter(friend => !players.value.includes(friend))
		.filter(friend =>
			friend.settings?.friendChal === undefined
				? true
				: friend.settings?.friendChal
		)
)
async function addFriend(l: string) {
	players.value.push(friends.value.find(f => f.id === l)!)
}

function verifyStage() {
	return g.value !== '' && game && game !== 'n'
		? players.value.length + 1 >= game.players[0] &&
				players.value.length + 1 <= game.players[1]
		: false
}

watch(
	() => p.value,
	async () => {
		if (!game || game === 'n') return
		const id = Math.random().toString(36).slice(2)
		await set(dbref(db, `/games/${id}`), {
			id,
			game: game.id,
			players: [auth.currentUser?.uid, ...players.value.map(p => p.id)],
			joined: [],
			declined: [],
			created: Date.now(),
			creator: auth.currentUser?.uid,
			status: 'n',
		})
		for(const p of players.value) {
			await set(dbref(db, `users/${p.id}/gamereqs`), Array.from(new Set([
				...((await get(dbref(db, `users/${p.id}/gamereqs`))).val() || []),
				id
			])))
		}
		router.push(`/game/${id}`)
	}
)
</script>
<template>
	<header>
		<SNavbar :user="dbuser" />
	</header>
	<main>
		<div class="grid place-items-center w-screen h-[90vh]">
			<div
				class="grid place-items-center bg-slate-100 dark:bg-slate-900 rounded-lg py-8 min-w-[50vw] min-h-[80vh] max-w-[80vw] max-h-screen">
				<h1 class="mb-auto text-4xl font-bold font-alt">New Game</h1>
				<div class="flex items-center justify-center gap-2 mb-4">
					<label>Game: </label>
					<select
						class="input"
						v-model="g">
						<option
							disabled
							value="">
							Select game
						</option>
						<option
							v-for="game in games"
							:id="game.id"
							:value="game.id">
							{{ game.name }}
						</option>
					</select>
				</div>
				<ul
					class="w-[80%] p-4 rounded-lg bg-slate-200 dark:bg-slate-800 grid place-items-center">
					<h1 class="w-full text-2xl font-bold text-center font-alt">Players</h1>
					<li
						v-for="player in [...players, dbuser]"
						:key="player.id"
						class="flex items-center w-full text-lg">
						<div class="rounded-full btn btn-neutral">
							<img
								:src="player.pic"
								class="w-10 h-10 rounded-full" />
						</div>
						{{ player.username }}
						<button
							class="ml-auto btn btn-error"
							:disabled="player.id === auth.currentUser?.uid"
							@click="
								players = players.filter(
									p => p.id !== player.id
								)
							">
							<X />
						</button>
					</li>
					<!-- <li class="flex items-center justify-center">
						<select
							class="input"
							v-model="friend">
							<option
								disabled
								value="">
								Select Player
							</option>
							<option
								v-for="friend in remFriends"
								:value="friend.id">
								{{ friend.username }}
							</option>
						</select>
						<button
							class="btn btn-primary"
							:disabled="friend === ''"
							@click="addFriend()">
							<Plus />
							Add player
						</button>
					</li> -->
					<li class="relative w-fit">
				<button
					class="btn btn-primary"
					@click="dpdwn = !dpdwn">
					Add player
					<ChevronDown class="ml-auto" />
				</button>
				<ul
					v-if="dpdwn"
					tabindex="0"
					class="absolute w-[20vw] left-0 z-50 p-2 bg-green-400 rounded-lg dark:bg-green-600 border-2 border-green-800">
					<li class="flex w-full gap-2 btn btn-primary" v-for="friend in sortedFriends" :disabled="!friend.status || friend.status.state === 'offline'" @click="(!friend.status || friend.status.state === 'offline') ? null : addFriend(friend.id)">
						<img class="size-8" :src="friend.pic"> {{ friend.username }} <span class="text-neutral-700 dark:text-neutral-300">{{ friend.status?.state || 'offline' }}</span>
					</li>
					<li class="italic" v-if="sortedFriends.length === 0">
						No players left.
					</li>
				</ul>
			</li>
				</ul>
					<!-- <button
						class="w-1/2 btn btn-neutral"
						@click="p--"
						v-if="p > 0">
						<ArrowLeft />
					</button> -->
					<button
						class="btn btn-primary"
						@click="p = true"
						:disabled="!verifyStage()">
						<Plus /> Create game
					</button>
			</div>
		</div>
	</main>
</template>
