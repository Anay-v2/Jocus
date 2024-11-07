<script setup lang="ts">
import { authIJK } from '@/utils/injects';
import { signOut, type Auth } from 'firebase/auth';
import { Bell } from 'lucide-vue-next';
import { inject, ref } from 'vue';
import type { DBUser } from '@/utils/types'
import router from '@/router';

const { user } = defineProps<{
	user: DBUser | null
}>()

const auth = inject(authIJK) as Auth
const dpdwn = ref(false)

async function logOut() {
    await signOut(auth)
    router.push('/')
}
</script>
<template>
	<div class="navbar h-[10vh]">
		<button class="text-xl font-extrabold btn btn-primary font-alt">Jocus</button>
        <div class="w-[85%] navbar-center">
			<ul class="px-1 navbar-menu">
				<li class="btn btn-primary" @click="$router.push('/dashboard')"><RouterLink to="/dashboard">Dashboard</RouterLink></li>
				<li class="btn btn-primary" @click="$router.push('/games')"><RouterLink to="/games">Games</RouterLink></li>
				<li class="btn btn-primary" @click="$router.push('/leaderboard')"><RouterLink to="/leaderboard">Leaderboard</RouterLink></li>
			</ul>
		</div>
		<div class="flex gap-4">
			<button
				class="rounded-full btn btn-primary">
				<Bell />
			</button>
			<div>
				<button
					class="rounded-full btn btn-primary" @click="dpdwn = !dpdwn">
						<img class="w-8 h-8 rounded-full"
							alt="Your profile picture"
							:src="user?.pic" />
				</button>
				<ul v-if="dpdwn"
					tabindex="0"
					class="absolute z-50 p-2 bg-green-400 rounded-lg dark:bg-green-600 right-[3vw]">
					<li class="w-full btn btn-primary"><RouterLink :to="`/profile/${auth.currentUser?.uid}`">Profile</RouterLink></li>
					<li class="w-full btn btn-primary"><RouterLink :to="`/profile/settings`">Settings</RouterLink></li>
					<li class="w-full btn btn-primary"><a @click="logOut()">Logout</a></li>
				</ul>
			</div>
		</div>
	</div>
</template>
