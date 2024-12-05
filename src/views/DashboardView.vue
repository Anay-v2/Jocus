<script setup lang="ts">
import SNavbar from '@/components/SNavbar.vue'
import { games, type Game } from '@/utils/games'
import { authIJK, dbIJK } from '@/utils/injects'
import { type Auth } from 'firebase/auth'
import { Database, get, ref as dbref, set } from 'firebase/database'
import { Users, Spade, Plus, IdCard, X } from 'lucide-vue-next'
import { computed, inject, type Ref, ref, useTemplateRef } from 'vue'
import FullScreenLoading from '@/components/FullScreenLoading.vue'
import { useDBUser } from '@/composables/fetch'
import router from '@/router'

const ploading = ref(false)
const auth = inject(authIJK) as Auth
const db = inject(dbIJK) as Database
const { dbuser, friends } = await useDBUser(auth, db)
const sortedFriends = computed(() => friends.value.sort((a,b) => {
	const diff = (a.status?.state === 'online' ? 1 : 0) - (b.status?.state === 'online' ? 1 : 0)
	if(diff !== 0) return -diff
	return (a.status?.lastChanged || 0) - (b.status?.lastChanged || 0)
}))
const game: Ref<Game | null> = ref(null)
const rulesModal = useTemplateRef('rules')
const friendModal = useTemplateRef('friend')

function showRules(gameid: string) {
	game.value = games.filter(l => l.id === gameid)[0]
	rulesModal.value?.showModal()
}

const friendID = ref('')
const friendToast = ref(``)

async function addFriend() {
	if (!auth || !db) return
	if (friendID.value === auth.currentUser?.uid) {
		friendToast.value = `You can't friend yourself!`
		friendID.value = ''
		friendModal.value?.close()
		return
	}
	if ((dbuser.value?.friends || []).includes(friendID.value)) {
		friendToast.value = `That user is already your friend!`
		friendID.value = ''
		friendModal.value?.close()
		return
	}
	const friend = (await get(dbref(db, `users/${friendID.value}`))).val()
	if (friend) {
		await set(
			dbref(db, `users/${friendID.value}/friendreqs`),
			Array.from(
				new Set([
					...(friend.friendreqs || []),
					{ id: auth.currentUser?.uid, timestamp: Date.now() },
				])
			)
		)
		friendToast.value = `Friend request sent!`
	} else {
		friendToast.value = `User not found. Try double-checking the ID.`
	}
	friendID.value = ''
	friendModal.value?.close()
}

const fdpdwn = ref('')
</script>
<template>
	<header v-if="!ploading">
		<SNavbar :user="dbuser" />
	</header>
	<main
		class="mt-4 ml-8"
		v-if="!ploading">
		<h1 class="text-4xl font-bold font-alt">Hi, {{ dbuser?.username }}</h1>
		<h2 class="text-3xl font-semibold font-alt">Friends</h2>
		<div class="flex w-full gap-2">
			<div class="relative"
				v-for="friend in sortedFriends"
				:key="friend.id">
				<div class="rounded-full cursor-pointer btn btn-neutral" @click="fdpdwn = (fdpdwn === friend.id) ? '' : friend.id">
					<img
						:src="friend.pic"
						class="w-8 h-8 rounded-full" />
				</div>
				<svg class="absolute bottom-1 right-1"
							width="9"
							height="9"
							viewBox="0 0 9 9"
							xmlns="http://www.w3.org/2000/svg">
							<circle
								cx="4.5"
								cy="4.5"
								r="4.5"
								:fill="
									friend.status?.state === 'online'
										? '#9CED75'
										: '#FF6C6C'
								" />
						</svg>
				<ul
					v-if="fdpdwn === friend.id"
					tabindex="0"
					class="absolute left-[3vw] z-50 p-2 bg-green-400 rounded-lg dark:bg-green-600 border-2 border-green-800">
					<li class="w-full btn btn-primary">
						<RouterLink :to="`/profile/${friend.id}`"
							>View Profile</RouterLink
						>
					</li>
					<li class="w-full btn btn-primary">
						Message
						<!-- TODO -->
					</li>
				</ul>
			</div>
			<button
				class="rounded-full btn bg-slate-100 dark:bg-slate-900"
				@click="friendModal?.showModal()">
				<Plus />
			</button>
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
						class="btn bg-fuchsia-500 dark:bg-fuchsia-700 hover:bg-fuchsia-600"
						@click="showRules(game.id)">
						View rules
					</button>
					<button
						class="bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-800 btn"
						@click="router.push(`/new/${game.id}`)">
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
						<X />
					</button>
				</form>
				<h3 class="text-2xl font-bold font-alt">{{ game?.name }}</h3>
				<div
					class="px-4"
					v-html="game?.rules || ''"></div>
			</div>
		</dialog>
		<dialog
			ref="friend"
			class="pt-8 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 w-[60vw] h-[60vh]">
			<div class="grid place-items-center">
				<form method="dialog">
					<button
						class="absolute rounded-full btn btn-sm btn-neutral right-2 top-2">
						<X />
					</button>
				</form>
				<h3 class="text-2xl font-bold font-alt">Add friend</h3>
			</div>
			<div class="grid w-full h-full place-items-center">
				<div class="grid my-4 place-items-center">
					<div class="items-center input">
						<IdCard />
						<input
							class="ml-2"
							type="text"
							placeholder="Enter ID"
							v-model="friendID" />
						<button
							class="btn btn-primary"
							@click="addFriend()">
							<Plus />
						</button>
					</div>
				</div>
			</div>
		</dialog>
		<div
			class="absolute flex items-center px-4 py-2 rounded-lg bottom-4 right-4 bg-slate-100 dark:bg-slate-900"
			v-if="friendToast.length > 0">
			{{ friendToast }}
			<button
				class="ml-4 btn btn-neutral"
				@click="friendToast = ''">
				<X />
			</button>
		</div>
	</main>
	<FullScreenLoading v-else />
</template>
