<script setup lang="ts">
import { authIJK, dbIJK } from '@/utils/injects'
import { type Auth } from 'firebase/auth'
import { type Database, set, get, ref as dbref } from 'firebase/database'
import { computed, inject, ref, watch, type Ref } from 'vue'
import SNavbar from '@/components/SNavbar.vue'
import {
	Bell,
	Info,
	Paintbrush,
	Users,
	IdCard,
	Cake,
	Text,
	Save,
	MessageCircle,
	X,
	Upload,
} from 'lucide-vue-next'
import { useDBUser } from '@/composables/fetch'
import Spinner from '@/components/Spinner.vue'
import { updateTheme } from '@/utils/theme'

const auth = inject(authIJK) as Auth
const db = inject(dbIJK) as Database
const { dbuser, friends } = await useDBUser(auth, db)
const p: Ref<'p' | 't' | 'n' | 'f'> = ref('p')
const loading = ref([false])

const username = ref(dbuser.value.username || '')
const usernameValid = computed(
	() => username.value.length >= 3 && username.value.length <= 15
)
const date = ref(
	dbuser.value.date
		? {
				d: parseInt(dbuser.value.date.split('/')[0]),
				m: parseInt(dbuser.value.date.split('/')[1]),
				y: parseInt(dbuser.value.date.split('/')[2]),
		  }
		: { d: null, m: null, y: null }
)
const dateValid = computed(() => {
	if (!date.value.d && !date.value.m && !date.value.y) return true
	const day = date.value.d
	const month = date.value.m
	const year = date.value.y
	if (month < 1 || month > 12 || day < 1 || day > 31) {
		return false
	}
	if ([4, 6, 9, 11].includes(month) && day > 30) {
		return false
	}
	if (month === 2) {
		const isLeapYear =
			(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
		if (isLeapYear) {
			if (day > 29) return false
		} else {
			if (day > 28) return false
		}
	}
	return year >= 1900 && year <= new Date().getFullYear()
})
const bio = ref(dbuser.value.bio || '')
const bioValid = computed(() =>
	bio.value !== '' ? bio.value.length <= 250 : true
)

watch(dbuser, n => {
	username.value = n.username
	date.value = n.date
		? {
				d: parseInt(n.date.split('/')[0]),
				m: parseInt(n.date.split('/')[1]),
				y: parseInt(n.date.split('/')[2]),
		  }
		: { d: null, m: null, y: null }
	bio.value = n.bio || ''
})

async function save() {
	if (
		!auth ||
		!db ||
		!usernameValid.value ||
		!dateValid.value ||
		!bioValid.value
	)
		return
	loading.value[0] = true
	await set(dbref(db, `users/${auth.currentUser?.uid}`), {
		...dbuser.value,
		username: username.value,
		date: `${date.value.d}/${date.value.m}/${date.value.y}`,
		bio: bio.value,
	})
	loading.value[0] = false
}

const theme: Ref<'n' | 'l' | 'd'> = ref(
	(localStorage.getItem('theme') || 'n') as 'n' | 'l' | 'd'
)

watch(
	() => theme.value,
	t => {
		if (t === 'n') localStorage.removeItem('theme')
		else localStorage.setItem('theme', t)
		updateTheme(document, window)
	}
)

const friendMsg = ref(dbuser.value.settings?.friendMsg || true)
const friendChal = ref(dbuser.value.settings?.friendChal || true)

watch(() => friendMsg, updateFriendSettings)
watch(() => friendChal, updateFriendSettings)

async function updateFriendSettings() {
	await set(dbref(db, `users/${auth.currentUser?.uid}/`), {
		...dbuser,
		settings: {
			friendMsg: friendMsg.value,
			friendChal: friendChal.value,
		},
	})
}

async function removeFriend(id: string) {
	const newuser = {
		...dbuser.value,
		friends: dbuser.value.friends?.filter(f => f !== id),
	}
	await set(dbref(db, `users/${auth.currentUser?.uid}`), newuser)
	await set(dbref(db, `users/${id}/notifications`), [
		...((await get(dbref(db, `users/${id}/notifications`))).val() || []),
		{
			id: Math.random().toString(36).slice(2),
			pic: dbuser.value.pic,
			text: `${dbuser.value.username} has unfriended you.`,
		},
	])
}

async function handleUpload(e: Event) {
	const file = Array.from((e.target as HTMLInputElement).files || [])[0]
	if (!file) return
	return await new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result as string)
		}
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})
}

async function uploadPFP(e: Event) {
	const pfp = await handleUpload(e) || `https://ui-avatars.com/api/?name=${encodeURIComponent(
					dbuser.value.username
			  )}&size=12`
	await set(dbref(db, `users/${auth.currentUser?.uid}/pic`), pfp)
}
</script>
<template>
	<header>
		<SNavbar :user="dbuser" />
	</header>
	<main class="flex w-screen h-[90vh]">
		<nav class="h-full w-[20vw] p-4 bg-slate-200 dark:bg-slate-800">
			<h1 class="text-4xl font-alt">Settings</h1>
			<ul class="mt-8 text-left">
				<li
					class="justify-start text-lg btn btn-neutral hover:bg-slate-300 dark:hover:bg-slate-700"
					@click="p = 'p'">
					<Info />
					Profile
				</li>
				<li
					class="justify-start text-lg btn btn-neutral hover:bg-slate-300 dark:hover:bg-slate-700"
					@click="p = 't'">
					<Paintbrush />
					Theme
				</li>
				<li
					class="justify-start text-lg btn btn-neutral hover:bg-slate-300 dark:hover:bg-slate-700"
					@click="p = 'n'">
					<Bell />
					Notifications
				</li>
				<li
					class="justify-start text-lg btn btn-neutral hover:bg-slate-300 dark:hover:bg-slate-700"
					@click="p = 'f'">
					<Users />
					Friends
				</li>
			</ul>
		</nav>
		<div class="h-full w-[80vw] p-4 bg-slate-100 dark:bg-slate-900">
			<template v-if="p === 'p'">
				<h1 class="mb-8 text-4xl font-alt">Profile Settings</h1>
				<div
					class="rounded-full size-16"
					:style="{
						'background-image': `url('${dbuser.pic}')`,
						'background-size': 'contain',
						'background-repeat': 'no-repeat',
						'background-position': 'center'
					}">
					<label
						for="file"
						class="grid w-full h-full bg-black bg-opacity-50 rounded-full opacity-0 cursor-pointer hover:opacity-100 place-items-center">
						<Upload />
					</label>
					<input
						type="file"
						id="file"
						class="hidden"
						accept=".png,.jpg,.jpeg,.webp"
						@input="uploadPFP" />
				</div>
				<div
					class="gap-4 my-8 input"
					:class="{ 'input-error': !usernameValid }">
					<Users />
					<input
						type="text"
						placeholder="Username"
						v-model="username"
						class="w-full" />
				</div>
				<div class="gap-4 my-8 input">
					<IdCard />
					<input
						type="text"
						disabled
						:value="dbuser.id"
						class="w-full" />
				</div>
				<div
					class="gap-4 my-8 input"
					:class="{ 'input-error': !dateValid }">
					<Cake />
					/
					<input
						class="arrows-hide w-[5vw]"
						type="number"
						min="1"
						max="31"
						placeholder="DD"
						v-model="date.d" />
					/
					<input
						class="arrows-hide w-[5vw]"
						type="number"
						min="1"
						max="12"
						placeholder="MM"
						v-model="date.m" />
					/
					<input
						class="arrows-hide w-[5vw]"
						type="number"
						min="1900"
						max="2024"
						placeholder="YYYY"
						v-model="date.y" />
				</div>
				<div
					class="gap-4 my-8 input"
					:class="{ 'input-error': !bioValid }">
					<Text />
					<textarea
						placeholder="Bio"
						class="w-full resize-none"
						v-model="bio"></textarea>
				</div>
				<button
					class="mt-auto btn btn-primary"
					:disabled="
						loading[0] || !usernameValid || !dateValid || !bioValid
					"
					@click="save()">
					<Save v-if="!loading[0]" /><Spinner
						class="fill-white"
						v-if="loading[0]" />
					Save
				</button>
			</template>
			<template v-if="p === 't'">
				<h1 class="mb-8 text-4xl font-alt">Theme</h1>
				<select
					class="input"
					v-model="theme">
					<option value="n">System default</option>
					<option value="l">Light</option>
					<option value="d">Dark</option>
				</select>
				<!-- TODO: Card theme -->
			</template>
			<template v-if="p === 'n'">
				<h1 class="mb-8 text-4xl font-alt">Notification Settings</h1>
				<!-- TODO -->
			</template>
			<template v-if="p === 'f'">
				<h1 class="mb-8 text-4xl font-alt">Friends</h1>
				<div
					class="inline-flex items-center mb-8 cursor-pointer"
					@click="friendMsg = !friendMsg">
					<input
						type="checkbox"
						class="sr-only peer"
						v-model="friendMsg" />
					<div
						class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
					<span class="ms-3">Allow my friends to message me</span>
				</div>
				<br />
				<div
					class="inline-flex items-center mb-8 cursor-pointer"
					@click="friendChal = !friendChal">
					<input
						type="checkbox"
						class="sr-only peer"
						v-model="friendChal" />
					<div
						class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
					<span class="ms-3">Allow my friends to challenge me</span>
				</div>
				<h2 class="mb-8 text-2xl font-alt">My friends</h2>
				<ul class="p-4 rounded-lg bg-slate-200 dark:bg-slate-800">
					<li v-if="friends.length === 0">No friends</li>
					<li
						v-for="friend in friends"
						:key="friend.id"
						class="flex items-center text-lg">
						<div class="rounded-full btn btn-neutral">
							<img
								:src="friend.pic"
								class="w-10 h-10 rounded-full" />
						</div>
						{{ friend.username }}
						<span class="text-neutral-700 dark:text-neutral-300"
							>({{ friend.status?.state || 'offline' }})</span
						>
						<button class="ml-auto btn btn-primary">
							<!-- TODO -->
							<MessageCircle />
						</button>
						<button
							class="ml-2 btn btn-error"
							@click="removeFriend(friend.id)">
							<X />
						</button>
					</li>
				</ul>
			</template>
		</div>
	</main>
</template>
