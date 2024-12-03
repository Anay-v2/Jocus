<script setup lang="ts">
import { authIJK, dbIJK } from '@/utils/injects'
import { signOut, type Auth } from 'firebase/auth'
import { get, ref as dbref, Database, set } from 'firebase/database'
import { Bell, Check, Minus, X } from 'lucide-vue-next'
import { inject, onMounted, ref, watch, type Component, type Ref } from 'vue'
import type { DBUser } from '@/utils/types'
import router from '@/router'

const { user } = defineProps<{
	user: DBUser | null
}>()

const auth = inject(authIJK) as Auth
const db = inject(dbIJK) as Database
const dpdwn = ref(false)
const notifs = ref(false)
const notifications: Ref<
	{
		id: string
		pic?: string
		text: string
		btn?: {
			text?: string
			icon?: Component
			callback: () => void
			class: any
		}[]
	}[]
> = ref([])

async function logOut() {
	await signOut(auth)
	router.push('/')
}

watch(
	() => user,
	async user => {
		if (user)  {
				notifications.value = await Promise.all(
					(
						(user.friendreqs as {
							id: string
							timestamp: number
						}[]) || []
					).map(async fr => {
						const guy = (
							await get(dbref(db, `/users/${fr.id}`))
						).val() as DBUser
						return {
							id: Math.random().toString(36).slice(2),
							pic: guy.pic,
							text:
								'You have recieved a friend request from ' +
								guy.username,
							btn: [
								{
									icon: Check,
									callback: async () => {
										//@ts-ignore
										await set(
											dbref(
												db,
												`users/${auth.currentUser?.uid}/friendreqs`
											),
											Object.values(
												user.friendreqs || {}
											).filter(f => f.id !== fr.id)
										)
										await set(
											dbref(
												db,
												`users/${auth.currentUser?.uid}/friends`
											),
											Array.from(
												new Set([
													...Object.values(
														user.friends || {}
													),
													fr.id,
												])
											)
										)
										await set(
											dbref(db, `users/${fr.id}/friends`),
											Array.from(
												new Set([
													...Object.values(
														guy.friends || {}
													),
													auth.currentUser?.uid,
												])
											)
										)
									},
									class: { 'bg-green-500': true, 'dark:bg-green-700': true, 'hover:bg-green-600': true },
								},
								{
									icon: X,
									callback: async () => {
										await set(
											dbref(
												db,
												`users/${auth.currentUser?.uid}/friendreqs`
											),
											Object.values(
												user.friendreqs || {}
											).filter(f => f.id !== fr.id)
										)
									},
									class: { 'btn-error': true },
								}
							],
						}
					})
				)
				notifications.value = [...notifications.value, ...(user.notifications?.map(notif => ({
					...notif,
					btn: [{
						icon: Minus,
						callback: async () => {
							await set(
											dbref(
												db,
												`users/${auth.currentUser?.uid}/notifications`
											),
											Object.values(
												user.notifications || {}
											).filter(f => f.id !== notif.id)
										)
						},
						class: { 'btn-neutral': true }
					}]
				})) || [])]
		}
	},
	{
		immediate: true,
		deep: true
	}
)
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
					@click="notifs = !notifs">
					<Bell />
				</button>
				<ul
					v-if="notifs"
					tabindex="0"
					class="absolute z-50 p-2 bg-green-400 rounded-lg dark:bg-green-600 right-[3vw] max-w-[30vw] text-sm">
					<li v-if="!notifications.length"><p>No new notifications.</p></li>
					<li
						class="w-full btn btn-primary"
						v-for="notif in notifications">
						<img
							class="w-8 h-8 rounded-full"
							alt="Profile picture"
							:src="notif.pic"
							v-if="notif.pic" />
						{{ notif.text }}
						<button
							class="ml-auto btn"
							:class="btn.class"
							@click="btn.callback()"
							v-for="btn in notif.btn">
							<component :is="btn.icon" />
							{{ btn.text }}
						</button>
					</li>
				</ul>
			</div>
			<div>
				<button
					class="rounded-full btn btn-primary"
					@click="dpdwn = !dpdwn">
					<img
						class="w-8 h-8 rounded-full"
						alt="Your profile picture"
						:src="user?.pic" />
				</button>
				<ul
					v-if="dpdwn"
					tabindex="0"
					class="absolute z-50 p-2 bg-green-400 rounded-lg dark:bg-green-600 right-[3vw]">
					<li class="w-full btn btn-primary" @click="router.push(`/profile/${auth.currentUser?.uid}`)">
						Profile
					</li>
					<li class="w-full btn btn-primary" @click="router.push(`/profile/settings`)">
						Settings
					</li>
					<li class="w-full btn btn-primary" @click="logOut()">
						Logout
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>
