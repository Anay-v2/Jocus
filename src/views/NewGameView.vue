<script setup lang="ts">
import SNavbar from '@/components/SNavbar.vue'
import { useDBUser } from '@/composables/fetch'
import router from '@/router'
import { games } from '@/utils/games'
import { authIJK, dbIJK } from '@/utils/injects'
import type { Auth } from 'firebase/auth'
import { set, type Database, ref as dbref } from 'firebase/database'
import { computed, inject, ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-vue-next'
import type { DBGame, DBUser } from '@/utils/types'

const route = useRoute()
const game = route.params.id ? games.find(l => l.id === route.params.id) : 'n'
if (!game) router.push('/')
const auth = inject(authIJK) as Auth
const db = inject(dbIJK) as Database
const { dbuser, friends } = await useDBUser(auth, db)
const g = ref(game === 'n' ? '' : game?.id || '')

const p = ref(0)
const players: Ref<DBUser[]> = ref([])
const remFriends = computed(() =>
	friends.value.filter(friend => !players.value.includes(friend)).filter(friend => friend.settings?.friendChal === undefined ? true : friend.settings?.friendChal)
)
const friend = ref('')
async function addFriend() {
	players.value.push(friends.value.find(f => f.id === friend.value)!)
	friend.value = ''
}

function verifyStage(p: number) {
	if (p === 0) return g.value !== ''
	if (p === 1)
		return game && game !== 'n'
			? players.value.length + 1 >= game.players[0] &&
					players.value.length + 1 <= game.players[1]
			: false
}

watch(() => p.value, async () => {
    if(!game || game === 'n') return
    const id = Math.random().toString(36).slice(2)
    await set(dbref(db, `/games/${id}`), {
        id,
        game: game.id,
        players: [
            auth.currentUser?.uid,
            ...players.value.map(p => p.id),
        ],
        joined: [],
        created: Date.now(),
        status: 'n'
    })
    router.push(`/game/${id}`)
})
</script>
<template>
	<header>
		<SNavbar :user="dbuser" />
	</header>
	<main>
		<div class="grid place-items-center w-screen h-[90vh]">
			<div
				class="grid place-items-center bg-slate-100 dark:bg-slate-900 rounded-lg py-8 min-w-[50vw] min-h-[80vh] max-w-[80vw] max-h-screen">
				<h1 class="mb-auto text-4xl font-bold font-alt">
					{{
						[
							'New Game',
							'Invite Players',
							'Loading...',
						][p]
					}}
				</h1>
				<select
					class="mb-4 input"
					v-model="g"
					v-if="p === 0">
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
				<ul
					class="w-[80%] p-4 rounded-lg bg-slate-200 dark:bg-slate-800"
					v-if="p === 1">
					<li
						v-for="player in [...players, dbuser]"
						:key="player.id"
						class="flex items-center text-lg">
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
					<li class="flex items-center justify-center">
						<select
							class="input"
							v-model="friend">
							<option
								disabled
								value="">
								Select Friend
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
							Add friend
						</button>
					</li>
				</ul>
				<div class="flex items-center justify-center w-full gap-2 mt-auto">
					<button
						class="w-1/2 btn btn-neutral"
						@click="p--"
						v-if="p > 0">
						<ArrowLeft />
					</button>
					<button
						class="w-1/2 btn btn-neutral"
						@click="p++"
						v-if="p < 2"
                        :disabled="!verifyStage(p)">
						<ArrowRight />
					</button>
				</div>
			</div>
		</div>
	</main>
</template>
