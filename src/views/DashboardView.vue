<script setup lang="ts">
import SNavbar from '@/components/SNavbar.vue'
import { games, type Game } from '@/utils/games'
import { authIJK, dbIJK } from '@/utils/injects'
import type { DBUser } from '@/utils/types'
import { type Auth, onAuthStateChanged } from 'firebase/auth'
import { Database, get, ref as dbref } from 'firebase/database'
import { Users, Spade, Plus } from 'lucide-vue-next'
import { inject, type Ref, ref, useTemplateRef } from 'vue'

const auth = inject(authIJK) as Auth
const db = inject(dbIJK) as Database
const dbuser: Ref<DBUser | null> = ref(null)
const friends: Ref<DBUser[]> = ref([])
const game: Ref<Game | null> = ref(null)
const rulesModal = useTemplateRef('rules')

onAuthStateChanged(auth, fetchMe)
fetchMe()

async function fetchMe() {
	dbuser.value = await fetchUser(auth.currentUser?.uid || '')
	dbuser.value?.friends.forEach(async f =>
		friends.value.push(await fetchUser(f))
	)
}

async function fetchUser(uid: string) {
	return (await get(dbref(db, `users/${uid}`))).val() as DBUser
}

function showRules(gameid: string) {
    game.value = games.filter(l => l.id === gameid)[0]
    rulesModal.value?.showModal()
}
</script>
<template>
	<header>
		<SNavbar :user="dbuser" />
	</header>
	<main class="mt-4 ml-8">
		<h1 class="text-4xl font-bold font-alt">Hi, {{ dbuser?.username }}</h1>
		<h2 class="text-3xl font-semibold font-alt">Friends</h2>
		<div class="flex w-full gap-2">
			<div
				class="rounded-full btn btn-neutral"
				v-for="friend in friends"
				:key="friend.uid">
					<img :src="friend.pic" class="w-8 h-8 rounded-full" />
			</div>
			<button class="rounded-full btn btn-neutral"><Plus /></button>
		</div>
		<h2 class="text-3xl font-semibold font-alt">Games</h2>
		<div class="flex w-full gap-4">
			<div
				class="grid gap-2 p-4 bg-green-400 rounded-lg dark:bg-green-600 place-items-center w-[20vw]"
				v-for="game in games"
				:key="game.id">
					<h2 class="text-2xl font-alt">{{ game.name }}</h2>
						<span class="flex gap-2"
							><Users />{{ game.players[0] }} -
							{{ game.players[1] }}</span
						>
						<span class="flex gap-2"
							><Spade />{{
								{
									n: 'Standard deck',
									j: 'No jokers',
									c: 'Custom deck',
								}[game.deck]
							}}</span
						>
					<div class="flex gap-2">
						<div
							class="p-1.5 bg-green-500 rounded-full dark:bg-green-700"
							v-for="tag in game.tags.filter((_, i) => i < 4)">
							{{ tag }}
						</div>
					</div>
					<div class="flex justify-end gap-4 mt-auto">
						<button
							class="btn bg-fuchsia-400 dark:bg-fuchsia-600 hover:bg-fuchsia-500"
							@click="showRules(game.id)">
							View rules
						</button>
						<button
							class="bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 btn"
							@click="$router.push(`/new/${game.id}`)">
							Play
						</button>
					</div>
			</div>
		</div>
		<dialog
			ref="rules"
			class="py-8 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 w-[60vw] h-[60vh]">
			<div class="grid place-items-center">
				<form method="dialog">
					<button
						class="absolute rounded-full btn btn-sm btn-neutral right-2 top-2">
						✕
					</button>
				</form>
				<h3 class="text-2xl font-bold font-alt">{{ game?.name }}</h3>
				<div class="py-4" v-html="game?.rules || ''"></div>
			</div>
		</dialog>
	</main>
</template>
