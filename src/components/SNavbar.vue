<script setup lang="ts">
import { authIJK, dbIJK } from '@/utils/injects'
import { signOut, type Auth } from 'firebase/auth'
import { get, ref as dbref, Database, set } from 'firebase/database'
import { Bell, Check, Minus, X } from 'lucide-vue-next'
import { inject, onMounted, ref, watch, type Component, type Ref } from 'vue'
import type { DBGame, DBUser } from '@/utils/types'
import router from '@/router'
import { fetchUser } from '@/composables/fetch'
import { games } from '@/utils/games'

const { user } = defineProps<{
	user: DBUser | null
}>()

const auth = inject(authIJK) as Auth
const db = inject(dbIJK) as Database
const dpdwn = ref(0)

async function logOut() {
	await signOut(auth)
	router.push('/')
}

const requestedUsers: Ref<DBUser[]> = ref([])
const requestedGames: Ref<[DBGame, DBUser][]> = ref([])
watch(
	() => user?.friendreqs,
	async () => {
		requestedUsers.value = await Promise.all(
			user?.friendreqs?.map(async u => await fetchUser(db, u.id)) || []
		)
	},
	{ immediate: true }
)
watch(
	() => user?.gamereqs,
	async () => {
		requestedGames.value = await Promise.all(
			user?.gamereqs?.map(async u => {
				const g = (await get(dbref(db, `games/${u}`))).val() as DBGame
				return [g, await fetchUser(db, g.creator)]
			}) || []
		)
	},
	{ immediate: true }
)

async function addFriend(id: string) {
	declineFriend(id)
	set(
		dbref(db, `users/${auth.currentUser?.uid}/friends`),
		Array.from(new Set([...(user?.friends || []), id]))
	)
	set(
		dbref(db, `users/${id}/friends`),
		Array.from(
			new Set([
				...((await get(dbref(db, `users/${id}/friends`))).val() || []),
				auth.currentUser?.uid,
			])
		)
	)
}

async function declineFriend(id: string) {
	set(
		dbref(
			db,
			`users/${auth.currentUser?.uid}/friendreqs`
		),
		(
			user?.friendreqs || []
		).filter(f => f.id !== id)
	)
}

async function acceptGame(id: string) {
	removeGame(id)
	router.push('/game/' + id)
}

async function declineGame(id: string) {
	removeGame(id)
	set(dbref(db, `games/${id}/declined`), Array.from(new Set([
		...((await get(dbref(db, `games/${id}/declined`))).val() || []),
		auth.currentUser?.uid
	])))
}

async function removeGame(id: string) {
	set(
		dbref(
			db,
			`users/${auth.currentUser?.uid}/gamereqs`
		),
		(
			user?.gamereqs || []
		).filter(f => f !== id)
	)
}
</script>
<template>
	<div class="navbar h-[10vh]">
		<button class="text-xl font-extrabold btn btn-primary font-alt">
			Jocus
		</button>
		<div class="w-[85%] navbar-center">
			<ul class="px-1 navbar-menu">
				<li
					class="btn btn-primary"
					@click="$router.push('/dashboard')">
					<RouterLink to="/dashboard">Dashboard</RouterLink>
				</li>
				<li
					class="btn btn-primary"
					@click="$router.push('/games')">
					<RouterLink to="/games">Games</RouterLink>
				</li>
				<li
					class="btn btn-primary"
					@click="$router.push('/leaderboard')">
					<RouterLink to="/leaderboard">Leaderboard</RouterLink>
				</li>
			</ul>
		</div>
		<div class="flex items-center gap-4">
			<div>
				<button
					class="rounded-full btn btn-primary"
					@click="dpdwn = (dpdwn === 1) ? 0 : 1">
					<Bell />
				</button>
				<ul
					v-if="dpdwn === 1"
					tabindex="0"
					class="absolute z-50 p-2 bg-green-400 rounded-lg dark:bg-green-600 right-[3vw] max-w-[30vw] text-sm border-2 border-green-800">
					<li
						v-if="
							(user?.notifications?.length || 0) +
								(user?.friendreqs?.length || 0) +
								(user?.gamereqs?.length || 0) ===
							0
						">
						<p>No new notifications.</p>
					</li>
					<li
						class="w-full btn btn-primary"
						v-for="fr in requestedUsers">
						<img
							class="w-8 h-8 rounded-full"
							alt="Profile picture"
							:src="fr.pic"
							v-if="fr.pic" />
						You have recieved a friend request from
						{{ fr.username }}
						<button
							class="ml-auto bg-green-500 btn dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800"
							@click="addFriend(fr.id)">
							<Check />
						</button>
						<button
							class="ml-auto btn btn-error"
							@click="declineFriend(fr.id)">
							<X />
						</button>
					</li>
					<li
						class="w-full btn btn-primary"
						v-for="fr in requestedGames">
						<img
							class="w-8 h-8 rounded-full"
							alt="Profile picture"
							:src="fr[1].pic"
							v-if="fr[1].pic" />
						{{ fr[1].username }} has invited you to a game of {{ games.find(l => l.id === fr[0].game)?.name || '' }}
						<button
							class="ml-auto bg-green-500 btn dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800"
							@click="acceptGame(fr[0].id)">
							<Check />
						</button>
						<button
							class="ml-auto btn btn-error"
							@click="declineGame(fr[0].id)">
							<X />
						</button>
					</li>
				</ul>
			</div>
			<div>
				<button
					class="rounded-full btn btn-primary"
					@click="dpdwn = (dpdwn === 2) ? 0 : 2">
					<img
						class="w-8 h-8 rounded-full"
						alt="Your profile picture"
						:src="user?.pic" />
				</button>
				<ul
					v-if="dpdwn === 2"
					tabindex="0"
					class="absolute z-50 p-2 bg-green-400 rounded-lg dark:bg-green-600 right-[3vw] border-2 border-green-800">
					<li
						class="w-full btn btn-primary"
						@click="
							router.push(`/profile/${auth.currentUser?.uid}`)
						">
						Profile
					</li>
					<li
						class="w-full btn btn-primary"
						@click="router.push(`/profile/settings`)">
						Settings
					</li>
					<li
						class="w-full btn btn-primary"
						@click="logOut()">
						Logout
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>
